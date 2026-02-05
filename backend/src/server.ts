import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { indexerService } from './services/indexer.service.js';
import { blockchainService } from './services/blockchain.service.js';

const PORT = config.port;

async function bootstrap() {
    try {
        logger.info(`Starting CarbonSeal backend in ${config.nodeEnv} mode...`);

        // Check blockchain connectivity
        const blockchainConnected = await blockchainService.isConnected();
        if (!blockchainConnected) {
            logger.warn('Blockchain provider not connected. Check your RPC_URL.');
        } else {
            logger.info('Blockchain provider connected');
        }

        // Start Express server
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
            logger.info(`API Documentation: http://localhost:${PORT}/api/health/detailed`);
        });

        // Start Indexer
        indexerService.start().catch(err => {
            logger.error('Failed to start indexer', { error: err });
        });

        // Graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down gracefully...');
            await indexerService.stop();
            server.close(() => {
                logger.info('Server stopped.');
                process.exit(0);
            });

            // Force exit after 10s
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        logger.error('Failed to bootstrap application', { error });
        process.exit(1);
    }
}

bootstrap();
