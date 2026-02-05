import { blockchainService } from './blockchain.service.js';
import { supabaseService } from './supabase.service.js';
import { logger } from '../utils/logger.js';

class IndexerService {
    private isIndexing = false;
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        logger.info('Indexer service initialized');
    }

    async start() {
        if (this.isIndexing) return;
        this.isIndexing = true;

        logger.info('Starting blockchain indexer...');

        // 1. Initial sync from last known block
        await this.syncFromBlockchain();

        // 2. Setup real-time listeners
        this.setupListeners();

        // 3. Setup periodic sync as backup (every 5 minutes)
        this.syncInterval = setInterval(() => {
            this.syncFromBlockchain().catch(err => {
                logger.error('Periodic sync failed', { error: err });
            });
        }, 5 * 60 * 1000);

        logger.info('Indexer started successfully');
    }

    /**
     * Stop the indexer
     */
    async stop() {
        this.isIndexing = false;
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        blockchainService.removeAllListeners();
        logger.info('Indexer stopped');
    }

    /**
     * Sync events from blockchain since last indexed block
     */
    private async syncFromBlockchain() {
        try {
            const syncState = await supabaseService.getSyncState();
            const lastIndexedBlock = syncState ? BigInt(syncState.last_block) : BigInt(0);
            const currentBlock = BigInt(await blockchainService.getBlockNumber());

            if (lastIndexedBlock >= currentBlock) {
                logger.debug('Indexer already caught up', { lastIndexedBlock, currentBlock });
                return;
            }

            logger.info('Syncing from blockchain...', {
                fromBlock: lastIndexedBlock.toString(),
                toBlock: currentBlock.toString()
            });

            // Sync state
            await this.syncAllFarms();
            await this.syncAllCredits();

            // Update sync state
            await supabaseService.updateSyncState(currentBlock);
            logger.info('Sync completed', { currentBlock: currentBlock.toString() });
        } catch (error) {
            logger.error('Sync failed', { error });
            throw error;
        }
    }

    /**
     * Sync all farms
     */
    private async syncAllFarms() {
        const totalFarms = await blockchainService.getTotalFarms();
        for (let i = 1; i <= totalFarms; i++) {
            const farm = await blockchainService.getFarm(i);
            if (farm) {
                await supabaseService.upsertFarm({
                    id: farm.farmId,
                    farmer: farm.farmer.toLowerCase(),
                    name: farm.name,
                    area: farm.area.toString(),
                    location: farm.location,
                    soil_type: farm.soilType,
                    total_carbon: farm.totalCarbon.toString(),
                    carbon_debt: farm.carbonDebt.toString(),
                    last_reading_timestamp: new Date(farm.lastReadingTimestamp * 1000).toISOString(),
                    is_active: farm.isActive,
                });

                const readings = await blockchainService.getRecentReadings(i, 50);
                for (const reading of readings) {
                    await supabaseService.insertReading({
                        id: reading.readingId,
                        farm_id: reading.farmId,
                        amount: reading.amount.toString(),
                        source: reading.source,
                        verification_hash: reading.verificationHash,
                        timestamp: new Date(reading.timestamp * 1000).toISOString(),
                        verified_by: reading.verifiedBy.toLowerCase(),
                    }).catch(err => {
                        if (err.code !== '23505') throw err;
                    });
                }
            }
        }
    }

    /**
     * Sync all credits
     */
    private async syncAllCredits() {
        const totalSupply = await blockchainService.getTotalCredits();
        for (let i = 1; i <= totalSupply; i++) {
            const credit = await blockchainService.getCreditDetails(i);
            if (credit) {
                const tokenUri = await blockchainService.getTokenURI(i).catch(() => '');
                await supabaseService.upsertCredit({
                    token_id: credit.tokenId,
                    farm_id: credit.farmId,
                    farmer: credit.farmer.toLowerCase(),
                    carbon_amount: credit.carbonAmount.toString(),
                    methodology: credit.methodology,
                    vintage: new Date(credit.vintage * 1000).toISOString(),
                    minted_at: new Date(credit.mintedAt * 1000).toISOString(),
                    is_retired: credit.isRetired,
                    retired_at: credit.isRetired ? new Date(credit.retiredAt * 1000).toISOString() : null,
                    retirement_reason: credit.isRetired ? credit.retirementReason : null,
                    token_uri: tokenUri,
                });
            }
        }
    }

    /**
     * Setup Listeners
     */
    private setupListeners() {
        blockchainService.onFarmRegistered(async (_farmer, farmId) => {
            const farm = await blockchainService.getFarm(farmId);
            if (farm) {
                await supabaseService.upsertFarm({
                    id: farm.farmId,
                    farmer: farm.farmer.toLowerCase(),
                    name: farm.name,
                    area: farm.area.toString(),
                    location: farm.location,
                    soil_type: farm.soilType,
                    total_carbon: farm.totalCarbon.toString(),
                    carbon_debt: farm.carbonDebt.toString(),
                    last_reading_timestamp: new Date(farm.lastReadingTimestamp * 1000).toISOString(),
                    is_active: farm.isActive,
                });
            }
        });

        blockchainService.onCarbonAdded(async (farmId, readingId) => {
            const readings = await blockchainService.getRecentReadings(farmId, 1);
            const reading = readings.find(r => r.readingId === readingId);
            if (reading) {
                await supabaseService.insertReading({
                    id: reading.readingId,
                    farm_id: reading.farmId,
                    amount: reading.amount.toString(),
                    source: reading.source,
                    verification_hash: reading.verificationHash,
                    timestamp: new Date(reading.timestamp * 1000).toISOString(),
                    verified_by: reading.verifiedBy.toLowerCase(),
                }).catch(() => { });
            }
        });

        blockchainService.onCreditMinted(async (tokenId) => {
            const credit = await blockchainService.getCreditDetails(tokenId);
            if (credit) {
                const tokenUri = await blockchainService.getTokenURI(tokenId).catch(() => '');
                await supabaseService.upsertCredit({
                    token_id: credit.tokenId,
                    farm_id: credit.farmId,
                    farmer: credit.farmer.toLowerCase(),
                    carbon_amount: credit.carbonAmount.toString(),
                    methodology: credit.methodology,
                    vintage: new Date(credit.vintage * 1000).toISOString(),
                    minted_at: new Date(credit.mintedAt * 1000).toISOString(),
                    is_retired: credit.isRetired,
                    retired_at: credit.isRetired ? new Date(credit.retiredAt * 1000).toISOString() : null,
                    retirement_reason: credit.isRetired ? credit.retirementReason : null,
                    token_uri: tokenUri,
                });
            }
        });

        blockchainService.onCreditRetired(async (tokenId) => {
            const credit = await blockchainService.getCreditDetails(tokenId);
            if (credit) {
                await supabaseService.upsertCredit({
                    token_id: credit.tokenId,
                    farm_id: credit.farmId,
                    farmer: credit.farmer.toLowerCase(),
                    carbon_amount: credit.carbonAmount.toString(),
                    methodology: credit.methodology,
                    vintage: new Date(credit.vintage * 1000).toISOString(),
                    minted_at: new Date(credit.mintedAt * 1000).toISOString(),
                    is_retired: credit.isRetired,
                    retired_at: credit.isRetired ? new Date(credit.retiredAt * 1000).toISOString() : null,
                    retirement_reason: credit.isRetired ? credit.retirementReason : null,
                    token_uri: await blockchainService.getTokenURI(tokenId).catch(() => ''),
                });
            }
        });
    }
}

export const indexerService = new IndexerService();
export default indexerService;
