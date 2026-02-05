import PinataSDK from '@pinata/sdk';
import { Readable } from 'stream';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { IPFSUploadResult, CreditMetadata } from '../types/index.js';

class IPFSService {
    private pinata: any;

    constructor() {
        const PinataClient = (PinataSDK as any).default || PinataSDK;
        this.pinata = new PinataClient({
            pinataJWTKey: config.pinata.jwt
        });

        logger.info('IPFS service initialized with Pinata SDK');
    }

    /**
     * Upload JSON metadata to IPFS
     */
    async uploadJSON(data: object, name?: string): Promise<IPFSUploadResult> {
        try {
            const result = await this.pinata.pinJSONToIPFS(data, {
                pinataMetadata: {
                    name: name || `carbonseal-metadata-${Date.now()}`,
                }
            });

            const cid = result.IpfsHash;
            const url = `ipfs://${cid}`;

            logger.info('JSON uploaded to IPFS', { cid, name });

            return {
                success: true,
                cid,
                url,
            };
        } catch (error) {
            logger.error('Failed to upload JSON to IPFS', { error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    }

    /**
     * Upload file to IPFS
     */
    async uploadFile(file: Buffer, filename: string, _mimeType: string): Promise<IPFSUploadResult> {
        try {
            // Convert Buffer to Readable stream for @pinata/sdk
            const stream = Readable.from(file);

            // Re-bind properties needed by some stream consumers if necessary, 
            // but for pinata it usually just works with a readable stream
            (stream as any).path = filename;

            const result = await this.pinata.pinFileToIPFS(stream, {
                pinataMetadata: {
                    name: filename,
                }
            });

            const cid = result.IpfsHash;
            const url = `ipfs://${cid}`;

            logger.info('File uploaded to IPFS', { cid, filename });

            return {
                success: true,
                cid,
                url,
            };
        } catch (error) {
            logger.error('Failed to upload file to IPFS', { error, filename });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    }

    /**
     * Upload carbon credit metadata
     */
    async uploadCreditMetadata(metadata: CreditMetadata): Promise<IPFSUploadResult> {
        const name = `carbonseal-credit-${metadata.properties.farmId}-${Date.now()}`;
        return this.uploadJSON(metadata, name);
    }

    /**
     * Generate gateway URL for CID
     */
    getGatewayUrl(cid: string): string {
        return `${config.pinata.gateway}/ipfs/${cid}`;
    }

    /**
     * Fetch content from IPFS
     */
    async fetchContent(cid: string): Promise<unknown> {
        try {
            const response = await fetch(this.getGatewayUrl(cid));
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            logger.error('Failed to fetch from IPFS', { cid, error });
            throw error;
        }
    }

    /**
     * Check if service is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            // Test authentication by attempting to list pins
            await this.pinata.testAuthentication();
            return true;
        } catch {
            return false;
        }
    }
}

export const ipfsService = new IPFSService();
export default ipfsService;
