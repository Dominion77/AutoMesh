import { ethers, Contract, JsonRpcProvider } from 'ethers';
import { config } from '../config/env.js';
import { CarbonSealRegistryABI, CarbonSealTokenABI, CarbonSealOracleABI } from '../config/abis.js';
import { logger } from '../utils/logger.js';
import type { Farm, CarbonReading, CarbonCredit, FarmStats } from '../types/index.js';

class BlockchainService {
    private provider: JsonRpcProvider;
    private registryContract: any;
    private tokenContract: any;
    private oracleContract: any;

    constructor() {
        this.provider = new JsonRpcProvider(config.blockchain.rpcUrl);

        this.registryContract = new Contract(
            config.blockchain.contracts.registry,
            CarbonSealRegistryABI,
            this.provider
        );

        this.tokenContract = new Contract(
            config.blockchain.contracts.token,
            CarbonSealTokenABI,
            this.provider
        );

        this.oracleContract = new Contract(
            config.blockchain.contracts.oracle,
            CarbonSealOracleABI,
            this.provider
        );

        logger.info('Blockchain service initialized', {
            registry: config.blockchain.contracts.registry,
            token: config.blockchain.contracts.token,
            oracle: config.blockchain.contracts.oracle,
        });
    }

    // Provider methods
    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async isConnected(): Promise<boolean> {
        try {
            await this.provider.getBlockNumber();
            return true;
        } catch {
            return false;
        }
    }

    // Registry contract methods
    async getTotalFarms(): Promise<number> {
        const count = await this.registryContract.farmCounter();
        return Number(count);
    }

    async getFarm(farmId: number): Promise<Farm | null> {
        try {
            const farm = await this.registryContract.farms(farmId);
            if (!farm || farm.farmId === BigInt(0)) return null;

            return {
                farmId: Number(farm.farmId),
                farmer: farm.farmer,
                name: farm.name,
                area: farm.area,
                location: farm.location,
                soilType: farm.soilType,
                totalCarbon: farm.totalCarbon,
                carbonDebt: farm.carbonDebt,
                lastReadingTimestamp: Number(farm.lastReadingTimestamp),
                isActive: farm.isActive,
                createdAt: Number(farm.createdAt),
            };
        } catch (error) {
            logger.error('Error fetching farm', { farmId, error });
            return null;
        }
    }

    async getFarmByAddress(address: string): Promise<Farm | null> {
        try {
            const farm = await this.registryContract.getFarmByAddress(address);
            if (!farm || farm.farmId === BigInt(0)) return null;

            return {
                farmId: Number(farm.farmId),
                farmer: farm.farmer,
                name: farm.name,
                area: farm.area,
                location: farm.location,
                soilType: farm.soilType,
                totalCarbon: farm.totalCarbon,
                carbonDebt: farm.carbonDebt,
                lastReadingTimestamp: Number(farm.lastReadingTimestamp),
                isActive: farm.isActive,
                createdAt: Number(farm.createdAt),
            };
        } catch (error) {
            // Farm not found is expected for unregistered addresses
            return null;
        }
    }

    async getAvailableCarbon(farmId: number): Promise<bigint> {
        return await this.registryContract.getAvailableCarbon(farmId);
    }

    async getFarmStats(farmId: number): Promise<FarmStats> {
        const stats = await this.registryContract.getFarmStats(farmId);
        return {
            totalCarbon: stats[0].toString(),
            carbonDebt: stats[1].toString(),
            availableCarbon: stats[2].toString(),
            readingCount: Number(stats[3]),
            creditCount: Number(stats[4]),
            lastUpdate: Number(stats[5]),
        };
    }

    async getRecentReadings(farmId: number, count: number): Promise<CarbonReading[]> {
        const readings = await this.registryContract.getRecentReadings(farmId, count);
        return readings.map((r: {
            readingId: bigint;
            farmId: bigint;
            amount: bigint;
            source: string;
            verificationHash: string;
            timestamp: bigint;
            verifiedBy: string;
        }) => ({
            readingId: Number(r.readingId),
            farmId: Number(r.farmId),
            amount: r.amount,
            source: r.source,
            verificationHash: r.verificationHash,
            timestamp: Number(r.timestamp),
            verifiedBy: r.verifiedBy,
        }));
    }

    async getActiveFarmers(): Promise<string[]> {
        return await this.registryContract.getActiveFarmers();
    }

    // Token contract methods
    async getTotalCredits(): Promise<number> {
        try {
            const supply = await this.tokenContract.totalSupply();
            return Number(supply);
        } catch {
            // If totalSupply not available, return 0
            return 0;
        }
    }

    async getCreditDetails(tokenId: number): Promise<CarbonCredit | null> {
        try {
            const credit = await this.tokenContract.getCreditDetails(tokenId);
            return {
                tokenId: Number(credit.tokenId),
                farmId: Number(credit.farmId),
                farmer: credit.farmer,
                carbonAmount: credit.carbonAmount,
                methodology: credit.methodology,
                vintage: Number(credit.vintage),
                mintedAt: Number(credit.mintedAt),
                isRetired: credit.isRetired,
                retiredAt: Number(credit.retiredAt),
                retirementReason: credit.retirementReason,
            };
        } catch (error) {
            logger.error('Error fetching credit details', { tokenId, error });
            return null;
        }
    }

    async getFarmCredits(farmId: number): Promise<number[]> {
        const tokenIds = await this.tokenContract.getFarmCredits(farmId);
        return tokenIds.map((id: bigint) => Number(id));
    }

    async getOwnerCredits(owner: string): Promise<number[]> {
        const tokenIds = await this.tokenContract.getOwnerCredits(owner);
        return tokenIds.map((id: bigint) => Number(id));
    }

    async getTokenURI(tokenId: number): Promise<string> {
        return await this.tokenContract.tokenURI(tokenId);
    }

    async getTokenOwner(tokenId: number): Promise<string> {
        return await this.tokenContract.ownerOf(tokenId);
    }

    // Oracle contract methods
    async getCarbonPrice(): Promise<bigint> {
        return await this.oracleContract.getCarbonPrice();
    }

    async isProofVerified(proofHash: string): Promise<boolean> {
        return await this.oracleContract.isProofVerified(proofHash);
    }

    // Event listening
    onFarmRegistered(callback: (farmer: string, farmId: number, name: string, area: bigint, location: string) => void) {
        this.registryContract.on('FarmRegistered', callback);
    }

    onCarbonAdded(callback: (farmId: number, readingId: number, amount: bigint, source: string, hash: string) => void) {
        this.registryContract.on('CarbonAdded', (farmId: any, readingId: any, amount: any, source: any, hash: any) => {
            callback(Number(farmId), Number(readingId), amount, source, hash);
        });
    }

    onCreditMinted(callback: (tokenId: number, farmer: string, farmId: number, amount: bigint, methodology: string) => void) {
        this.tokenContract.on('CreditMinted', (tokenId: any, farmer: any, farmId: any, amount: any, methodology: any) => {
            callback(Number(tokenId), farmer, Number(farmId), amount, methodology);
        });
    }

    onCreditRetired(callback: (tokenId: number, retiredBy: string, reason: string) => void) {
        this.tokenContract.on('CreditRetired', (tokenId: any, retiredBy: any, reason: any) => {
            callback(Number(tokenId), retiredBy, reason);
        });
    }

    removeAllListeners() {
        this.registryContract.removeAllListeners();
        this.tokenContract.removeAllListeners();
        this.oracleContract.removeAllListeners();
    }
}

export const blockchainService = new BlockchainService();
export default blockchainService;
