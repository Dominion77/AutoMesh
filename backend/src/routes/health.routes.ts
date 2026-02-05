import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { blockchainService } from '../services/blockchain.service.js';
import { supabaseService } from '../services/supabase.service.js';
import { ipfsService } from '../services/ipfs.service.js';

const router = Router();
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env['NODE_ENV'] || 'development',
        },
    });
}));

/**
 * @route GET /api/health/detailed
 * @desc Detailed health check with service status
 */
router.get('/detailed', asyncHandler(async (_req: Request, res: Response) => {
    const [blockchainOk, databaseOk, ipfsOk] = await Promise.all([
        blockchainService.isConnected().catch(() => false),
        supabaseService.healthCheck().catch(() => false),
        ipfsService.healthCheck().catch(() => false),
    ]);

    const allHealthy = blockchainOk && databaseOk && ipfsOk;

    res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        data: {
            status: allHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                blockchain: {
                    status: blockchainOk ? 'connected' : 'disconnected',
                    rpcUrl: process.env['RPC_URL']?.substring(0, 30) + '...',
                },
                database: {
                    status: databaseOk ? 'connected' : 'disconnected',
                    provider: 'supabase',
                },
                ipfs: {
                    status: ipfsOk ? 'connected' : 'disconnected',
                    provider: 'pinata',
                },
            },
        },
    });
}));

/**
 * @route GET /api/health/blockchain
 * @desc Blockchain connectivity check
 */
router.get('/blockchain', asyncHandler(async (_req: Request, res: Response) => {
    const connected = await blockchainService.isConnected();
    let blockNumber = 0;

    if (connected) {
        blockNumber = await blockchainService.getBlockNumber();
    }

    res.status(connected ? 200 : 503).json({
        success: connected,
        data: {
            status: connected ? 'connected' : 'disconnected',
            blockNumber,
            timestamp: new Date().toISOString(),
        },
    });
}));

export default router;
