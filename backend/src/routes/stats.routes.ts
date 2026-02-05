import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { blockchainService } from '../services/blockchain.service.js';
import { supabaseService } from '../services/supabase.service.js';
import type { DbFarm } from '../types/index.js';

const router = Router();

/**
 * @route GET /api/stats
 * @desc Get ecosystem statistics
 */
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    // Try to get from database first for faster response
    const dbStats = await supabaseService.getEcosystemStats();

    // Get carbon price from blockchain
    let carbonPrice = '5000000000'; // Default $50 in 8 decimals
    try {
        const price = await blockchainService.getCarbonPrice();
        carbonPrice = price.toString();
    } catch {
        // Use default if oracle not available
    }

    // If database has data, use it
    if (dbStats.totalFarms > 0) {
        res.json({
            success: true,
            data: {
                ...dbStats,
                carbonPrice,
                carbonPriceFormatted: `$${(Number(carbonPrice) / 1e8).toFixed(2)}`,
            },
            source: 'database',
            timestamp: new Date().toISOString(),
        });
        return;
    }

    // Fallback to blockchain
    const [totalFarms, totalCredits] = await Promise.all([
        blockchainService.getTotalFarms(),
        blockchainService.getTotalCredits(),
    ]);

    // Calculate total carbon from farms
    let totalCarbon = BigInt(0);
    const activeFarmers: string[] = [];

    try {
        const farmers = await blockchainService.getActiveFarmers();
        activeFarmers.push(...farmers);

        for (let i = 1; i <= Math.min(totalFarms, 100); i++) {
            const farm = await blockchainService.getFarm(i);
            if (farm && farm.isActive) {
                totalCarbon += farm.totalCarbon;
            }
        }
    } catch {
        // Partial data is acceptable
    }

    res.json({
        success: true,
        data: {
            totalFarms,
            totalCredits,
            totalCarbonSequestered: totalCarbon.toString(),
            activeFarmers: activeFarmers.length,
            carbonPrice,
            carbonPriceFormatted: `$${(Number(carbonPrice) / 1e8).toFixed(2)}`,
        },
        source: 'blockchain',
        timestamp: new Date().toISOString(),
    });
}));

/**
 * @route GET /api/stats/leaderboard
 * @desc Get top farms by carbon sequestration
 */
router.get('/leaderboard', asyncHandler(async (_req: Request, res: Response) => {
    // Get farms from database, sorted by total carbon
    const { data: farms } = await supabaseService.getFarms(1, 10);

    if (farms.length > 0) {
        const leaderboard = farms
            .sort((a: DbFarm, b: DbFarm) => {
                const carbonA = BigInt(a.total_carbon);
                const carbonB = BigInt(b.total_carbon);
                return carbonB > carbonA ? 1 : carbonB < carbonA ? -1 : 0;
            })
            .map((farm: DbFarm, index: number) => ({
                rank: index + 1,
                farmId: farm.id,
                name: farm.name,
                farmer: farm.farmer,
                totalCarbon: farm.total_carbon,
                location: farm.location,
            }));

        res.json({
            success: true,
            data: leaderboard,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    // Fallback to blockchain
    const totalFarms = await blockchainService.getTotalFarms();
    const farmData: { id: number; name: string; farmer: string; carbon: bigint; location: string }[] = [];

    for (let i = 1; i <= Math.min(totalFarms, 50); i++) {
        const farm = await blockchainService.getFarm(i);
        if (farm && farm.isActive) {
            farmData.push({
                id: farm.farmId,
                name: farm.name,
                farmer: farm.farmer,
                carbon: farm.totalCarbon,
                location: farm.location,
            });
        }
    }

    const leaderboard = farmData
        .sort((a, b) => (b.carbon > a.carbon ? 1 : b.carbon < a.carbon ? -1 : 0))
        .slice(0, 10)
        .map((farm, index) => ({
            rank: index + 1,
            farmId: farm.id,
            name: farm.name,
            farmer: farm.farmer,
            totalCarbon: farm.carbon.toString(),
            location: farm.location,
        }));

    res.json({
        success: true,
        data: leaderboard,
        timestamp: new Date().toISOString(),
    });
}));

/**
 * @route GET /api/stats/summary
 * @desc Get quick summary stats for dashboard
 */
router.get('/summary', asyncHandler(async (_req: Request, res: Response) => {
    const [totalFarms, totalCredits] = await Promise.all([
        blockchainService.getTotalFarms(),
        blockchainService.getTotalCredits(),
    ]);

    let carbonPrice = 5000000000n; // Default $50
    try {
        carbonPrice = await blockchainService.getCarbonPrice();
    } catch {
        // Use default
    }

    res.json({
        success: true,
        data: {
            totalFarms,
            totalCredits,
            carbonPrice: carbonPrice.toString(),
            carbonPriceUSD: (Number(carbonPrice) / 1e8).toFixed(2),
        },
        timestamp: new Date().toISOString(),
    });
}));

export default router;
