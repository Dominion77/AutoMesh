import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.middleware.js';
import { validate, schemas } from '../middleware/validate.middleware.js';
import { blockchainService } from '../services/blockchain.service.js';
import { supabaseService } from '../services/supabase.service.js';
import type { FarmResponse, CarbonReadingResponse, DbFarm, DbReading } from '../types/index.js';

const router = Router();

/**
 * @route GET /api/farms
 * @desc Get all farms (paginated)
 */
router.get(
    '/',
    validate(schemas.pagination, 'query'),
    asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as { page: number; limit: number };

        // Try to get from database first
        const dbResult = await supabaseService.getFarms(page, limit);

        if (dbResult.data.length > 0) {
            const farms: FarmResponse[] = dbResult.data.map((farm: DbFarm) => ({
                id: farm.id,
                farmer: farm.farmer,
                name: farm.name,
                area: farm.area,
                location: farm.location,
                soilType: farm.soil_type,
                totalCarbon: farm.total_carbon,
                carbonDebt: farm.carbon_debt,
                availableCarbon: (BigInt(farm.total_carbon) - BigInt(farm.carbon_debt)).toString(),
                lastReadingTimestamp: new Date(farm.last_reading_timestamp).getTime() / 1000,
                isActive: farm.is_active,
                createdAt: new Date(farm.created_at).getTime() / 1000,
            }));

            res.json({
                success: true,
                data: farms,
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

        // Fallback to blockchain (limited data)
        const totalFarms = await blockchainService.getTotalFarms();
        const farms: FarmResponse[] = [];

        const start = (page - 1) * limit + 1;
        const end = Math.min(start + limit - 1, totalFarms);

        for (let i = start; i <= end; i++) {
            const farm = await blockchainService.getFarm(i);
            if (farm) {
                const available = await blockchainService.getAvailableCarbon(farm.farmId);
                farms.push({
                    id: farm.farmId,
                    farmer: farm.farmer,
                    name: farm.name,
                    area: farm.area.toString(),
                    location: farm.location,
                    soilType: farm.soilType,
                    totalCarbon: farm.totalCarbon.toString(),
                    carbonDebt: farm.carbonDebt.toString(),
                    availableCarbon: available.toString(),
                    lastReadingTimestamp: farm.lastReadingTimestamp,
                    isActive: farm.isActive,
                    createdAt: farm.createdAt,
                });
            }
        }

        res.json({
            success: true,
            data: farms,
            pagination: {
                page,
                limit,
                total: totalFarms,
                pages: Math.ceil(totalFarms / limit),
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/farms/:id
 * @desc Get farm by ID
 */
router.get(
    '/:id',
    validate(schemas.id, 'params'),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as unknown as { id: number };

        // Try database first
        const dbFarm = await supabaseService.getFarmById(id) as DbFarm | null;

        if (dbFarm) {
            const farm: FarmResponse = {
                id: dbFarm.id,
                farmer: dbFarm.farmer,
                name: dbFarm.name,
                area: dbFarm.area,
                location: dbFarm.location,
                soilType: dbFarm.soil_type,
                totalCarbon: dbFarm.total_carbon,
                carbonDebt: dbFarm.carbon_debt,
                availableCarbon: (BigInt(dbFarm.total_carbon) - BigInt(dbFarm.carbon_debt)).toString(),
                lastReadingTimestamp: new Date(dbFarm.last_reading_timestamp).getTime() / 1000,
                isActive: dbFarm.is_active,
                createdAt: new Date(dbFarm.created_at).getTime() / 1000,
            };

            res.json({
                success: true,
                data: farm,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Fallback to blockchain
        const farm = await blockchainService.getFarm(id);

        if (!farm) {
            throw ApiError.notFound(`Farm with ID ${id} not found`);
        }

        const available = await blockchainService.getAvailableCarbon(id);

        res.json({
            success: true,
            data: {
                id: farm.farmId,
                farmer: farm.farmer,
                name: farm.name,
                area: farm.area.toString(),
                location: farm.location,
                soilType: farm.soilType,
                totalCarbon: farm.totalCarbon.toString(),
                carbonDebt: farm.carbonDebt.toString(),
                availableCarbon: available.toString(),
                lastReadingTimestamp: farm.lastReadingTimestamp,
                isActive: farm.isActive,
                createdAt: farm.createdAt,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/farms/by-address/:address
 * @desc Get farm by farmer address
 */
router.get(
    '/by-address/:address',
    validate(schemas.address, 'params'),
    asyncHandler(async (req: Request, res: Response) => {
        const { address } = req.params;

        // Try database first
        const dbFarm = await supabaseService.getFarmByAddress(address!) as DbFarm | null;

        if (dbFarm) {
            const farm: FarmResponse = {
                id: dbFarm.id,
                farmer: dbFarm.farmer,
                name: dbFarm.name,
                area: dbFarm.area,
                location: dbFarm.location,
                soilType: dbFarm.soil_type,
                totalCarbon: dbFarm.total_carbon,
                carbonDebt: dbFarm.carbon_debt,
                availableCarbon: (BigInt(dbFarm.total_carbon) - BigInt(dbFarm.carbon_debt)).toString(),
                lastReadingTimestamp: new Date(dbFarm.last_reading_timestamp).getTime() / 1000,
                isActive: dbFarm.is_active,
                createdAt: new Date(dbFarm.created_at).getTime() / 1000,
            };

            res.json({
                success: true,
                data: farm,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Fallback to blockchain
        const farm = await blockchainService.getFarmByAddress(address!);

        if (!farm) {
            throw ApiError.notFound(`No farm found for address ${address}`);
        }

        const available = await blockchainService.getAvailableCarbon(farm.farmId);

        res.json({
            success: true,
            data: {
                id: farm.farmId,
                farmer: farm.farmer,
                name: farm.name,
                area: farm.area.toString(),
                location: farm.location,
                soilType: farm.soilType,
                totalCarbon: farm.totalCarbon.toString(),
                carbonDebt: farm.carbonDebt.toString(),
                availableCarbon: available.toString(),
                lastReadingTimestamp: farm.lastReadingTimestamp,
                isActive: farm.isActive,
                createdAt: farm.createdAt,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/farms/:id/stats
 * @desc Get farm statistics
 */
router.get(
    '/:id/stats',
    validate(schemas.id, 'params'),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as unknown as { id: number };

        const stats = await blockchainService.getFarmStats(id);

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/farms/:id/readings
 * @desc Get carbon readings for a farm
 */
router.get(
    '/:id/readings',
    validate(schemas.id, 'params'),
    validate(schemas.pagination, 'query'),
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as unknown as { id: number };
        const { page, limit } = req.query as unknown as { page: number; limit: number };

        // Try database first
        const dbResult = await supabaseService.getReadingsByFarm(id, page, limit);

        if (dbResult.data.length > 0) {
            const readings: CarbonReadingResponse[] = dbResult.data.map((r: DbReading) => ({
                id: r.id,
                farmId: r.farm_id,
                amount: r.amount,
                source: r.source,
                verificationHash: r.verification_hash,
                timestamp: new Date(r.timestamp).getTime() / 1000,
                verifiedBy: r.verified_by,
            }));

            res.json({
                success: true,
                data: readings,
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
        const readings = await blockchainService.getRecentReadings(id, limit);

        res.json({
            success: true,
            data: readings.map(r => ({
                id: r.readingId,
                farmId: r.farmId,
                amount: r.amount.toString(),
                source: r.source,
                verificationHash: r.verificationHash,
                timestamp: r.timestamp,
                verifiedBy: r.verifiedBy,
            })),
            pagination: {
                page,
                limit,
                total: readings.length,
                pages: 1,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

export default router;
