import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.middleware.js';
import { validate, schemas } from '../middleware/validate.middleware.js';
import { blockchainService } from '../services/blockchain.service.js';
import { supabaseService } from '../services/supabase.service.js';
import type { CarbonCreditResponse, DbCredit } from '../types/index.js';

const router = Router();

/**
 * @route GET /api/credits
 * @desc Get all carbon credits (paginated)
 */
router.get(
    '/',
    validate(schemas.pagination, 'query'),
    asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as { page: number; limit: number };

        const dbResult = await supabaseService.getCredits(page, limit);

        if (dbResult.data.length > 0) {
            const credits: CarbonCreditResponse[] = dbResult.data.map((c: DbCredit) => ({
                tokenId: c.token_id,
                farmId: c.farm_id,
                farmer: c.farmer,
                carbonAmount: c.carbon_amount,
                methodology: c.methodology,
                vintage: new Date(c.vintage).getTime() / 1000,
                mintedAt: new Date(c.minted_at).getTime() / 1000,
                isRetired: c.is_retired,
                retiredAt: c.retired_at ? new Date(c.retired_at).getTime() / 1000 : null,
                retirementReason: c.retirement_reason,
                tokenUri: c.token_uri,
            }));

            res.json({
                success: true,
                data: credits,
                pagination: {
                    page,
                    limit,
                    total: dbResult.total,
                    pages: Math.ceil(dbResult.total / limit),
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Database empty - return empty result
        res.json({
            success: true,
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                pages: 0,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/credits/:tokenId
 * @desc Get carbon credit by token ID
 */
router.get(
    '/:tokenId',
    validate(schemas.tokenId, 'params'),
    asyncHandler(async (req: Request, res: Response) => {
        const { tokenId } = req.params as unknown as { tokenId: number };

        // Try database first
        const dbCredit = await supabaseService.getCreditByTokenId(tokenId) as DbCredit | null;

        if (dbCredit) {
            const credit: CarbonCreditResponse = {
                tokenId: dbCredit.token_id,
                farmId: dbCredit.farm_id,
                farmer: dbCredit.farmer,
                carbonAmount: dbCredit.carbon_amount,
                methodology: dbCredit.methodology,
                vintage: new Date(dbCredit.vintage).getTime() / 1000,
                mintedAt: new Date(dbCredit.minted_at).getTime() / 1000,
                isRetired: dbCredit.is_retired,
                retiredAt: dbCredit.retired_at ? new Date(dbCredit.retired_at).getTime() / 1000 : null,
                retirementReason: dbCredit.retirement_reason,
                tokenUri: dbCredit.token_uri,
            };

            res.json({
                success: true,
                data: credit,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Fallback to blockchain
        const credit = await blockchainService.getCreditDetails(tokenId);

        if (!credit) {
            throw ApiError.notFound(`Credit with token ID ${tokenId} not found`);
        }

        let tokenUri = '';
        try {
            tokenUri = await blockchainService.getTokenURI(tokenId);
        } catch {
            // Token URI might not be set
        }

        res.json({
            success: true,
            data: {
                tokenId: credit.tokenId,
                farmId: credit.farmId,
                farmer: credit.farmer,
                carbonAmount: credit.carbonAmount.toString(),
                methodology: credit.methodology,
                vintage: credit.vintage,
                mintedAt: credit.mintedAt,
                isRetired: credit.isRetired,
                retiredAt: credit.isRetired ? credit.retiredAt : null,
                retirementReason: credit.isRetired ? credit.retirementReason : null,
                tokenUri,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/credits/by-owner/:address
 * @desc Get credits by owner address
 */
router.get(
    '/by-owner/:address',
    validate(schemas.address, 'params'),
    validate(schemas.pagination, 'query'),
    asyncHandler(async (req: Request, res: Response) => {
        const { address } = req.params;
        const { page, limit } = req.query as unknown as { page: number; limit: number };

        // Try database first
        const dbResult = await supabaseService.getCreditsByOwner(address!, page, limit);

        if (dbResult.data.length > 0) {
            const credits: CarbonCreditResponse[] = dbResult.data.map((c: DbCredit) => ({
                tokenId: c.token_id,
                farmId: c.farm_id,
                farmer: c.farmer,
                carbonAmount: c.carbon_amount,
                methodology: c.methodology,
                vintage: new Date(c.vintage).getTime() / 1000,
                mintedAt: new Date(c.minted_at).getTime() / 1000,
                isRetired: c.is_retired,
                retiredAt: c.retired_at ? new Date(c.retired_at).getTime() / 1000 : null,
                retirementReason: c.retirement_reason,
                tokenUri: c.token_uri,
            }));

            res.json({
                success: true,
                data: credits,
                pagination: {
                    page,
                    limit,
                    total: dbResult.total,
                    pages: Math.ceil(dbResult.total / limit),
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Fallback to blockchain
        const tokenIds = await blockchainService.getOwnerCredits(address!);
        const credits: CarbonCreditResponse[] = [];

        for (const tokenId of tokenIds.slice((page - 1) * limit, page * limit)) {
            const credit = await blockchainService.getCreditDetails(tokenId);
            if (credit) {
                credits.push({
                    tokenId: credit.tokenId,
                    farmId: credit.farmId,
                    farmer: credit.farmer,
                    carbonAmount: credit.carbonAmount.toString(),
                    methodology: credit.methodology,
                    vintage: credit.vintage,
                    mintedAt: credit.mintedAt,
                    isRetired: credit.isRetired,
                    retiredAt: credit.isRetired ? credit.retiredAt : null,
                    retirementReason: credit.isRetired ? credit.retirementReason : null,
                });
            }
        }

        res.json({
            success: true,
            data: credits,
            pagination: {
                page,
                limit,
                total: tokenIds.length,
                pages: Math.ceil(tokenIds.length / limit),
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/credits/by-farm/:farmId
 * @desc Get credits by farm ID
 */
router.get(
    '/by-farm/:farmId',
    validate(schemas.farmId, 'params'),
    validate(schemas.pagination, 'query'),
    asyncHandler(async (req: Request, res: Response) => {
        const { farmId } = req.params as unknown as { farmId: number };
        const { page, limit } = req.query as unknown as { page: number; limit: number };

        // Try database first
        const dbResult = await supabaseService.getCreditsByFarm(farmId, page, limit);

        if (dbResult.data.length > 0) {
            const credits: CarbonCreditResponse[] = dbResult.data.map((c: DbCredit) => ({
                tokenId: c.token_id,
                farmId: c.farm_id,
                farmer: c.farmer,
                carbonAmount: c.carbon_amount,
                methodology: c.methodology,
                vintage: new Date(c.vintage).getTime() / 1000,
                mintedAt: new Date(c.minted_at).getTime() / 1000,
                isRetired: c.is_retired,
                retiredAt: c.retired_at ? new Date(c.retired_at).getTime() / 1000 : null,
                retirementReason: c.retirement_reason,
                tokenUri: c.token_uri,
            }));

            res.json({
                success: true,
                data: credits,
                pagination: {
                    page,
                    limit,
                    total: dbResult.total,
                    pages: Math.ceil(dbResult.total / limit),
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Fallback to blockchain
        const tokenIds = await blockchainService.getFarmCredits(farmId);
        const credits: CarbonCreditResponse[] = [];

        for (const tokenId of tokenIds.slice((page - 1) * limit, page * limit)) {
            const credit = await blockchainService.getCreditDetails(tokenId);
            if (credit) {
                credits.push({
                    tokenId: credit.tokenId,
                    farmId: credit.farmId,
                    farmer: credit.farmer,
                    carbonAmount: credit.carbonAmount.toString(),
                    methodology: credit.methodology,
                    vintage: credit.vintage,
                    mintedAt: credit.mintedAt,
                    isRetired: credit.isRetired,
                    retiredAt: credit.isRetired ? credit.retiredAt : null,
                    retirementReason: credit.isRetired ? credit.retirementReason : null,
                });
            }
        }

        res.json({
            success: true,
            data: credits,
            pagination: {
                page,
                limit,
                total: tokenIds.length,
                pages: Math.ceil(tokenIds.length / limit),
            },
            timestamp: new Date().toISOString(),
        });
    })
);

export default router;
