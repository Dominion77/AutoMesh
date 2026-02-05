import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler, ApiError } from '../middleware/error.middleware.js';
import { validate, schemas } from '../middleware/validate.middleware.js';
import { ipfsService } from '../services/ipfs.service.js';
import type { CreditMetadata } from '../types/index.js';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/json'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

/**
 * @route POST /api/ipfs/upload
 * @desc Upload JSON metadata to IPFS
 */
router.post(
    '/upload',
    validate(schemas.ipfsUpload, 'body'),
    asyncHandler(async (req: Request, res: Response) => {
        const metadata = req.body as CreditMetadata;
        const result = await ipfsService.uploadCreditMetadata(metadata);

        if (!result.success) {
            throw ApiError.internal(result.error || 'IPFS upload failed');
        }

        res.status(201).json({
            success: true,
            data: {
                cid: result.cid,
                url: result.url,
                gatewayUrl: ipfsService.getGatewayUrl(result.cid!),
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route POST /api/ipfs/upload-file
 * @desc Upload file to IPFS
 */
router.post(
    '/upload-file',
    upload.single('file'),
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw ApiError.badRequest('No file provided');
        }

        const result = await ipfsService.uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        if (!result.success) {
            throw ApiError.internal(result.error || 'IPFS upload failed');
        }

        res.status(201).json({
            success: true,
            data: {
                cid: result.cid,
                url: result.url,
                gatewayUrl: ipfsService.getGatewayUrl(result.cid!),
                filename: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

/**
 * @route GET /api/ipfs/:cid
 * @desc Fetch content from IPFS by CID
 */
router.get(
    '/:cid',
    validate(schemas.cid, 'params'),
    asyncHandler(async (req: Request, res: Response) => {
        const { cid } = req.params;

        try {
            const content = await ipfsService.fetchContent(cid!);

            res.json({
                success: true,
                data: {
                    cid,
                    content,
                    gatewayUrl: ipfsService.getGatewayUrl(cid!),
                },
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            throw ApiError.notFound(`Content not found for CID: ${cid}`);
        }
    })
);

export default router;
