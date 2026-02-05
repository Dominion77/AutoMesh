import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ApiError } from './error.middleware.js';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const data = req[target];
            const parsed = schema.parse(data);
            req[target] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                next(ApiError.badRequest(`Validation failed: ${messages.join(', ')}`));
            } else {
                next(error);
            }
        }
    };
}

// Common validation schemas
export const schemas = {
    // Pagination
    pagination: z.object({
        page: z.string().optional().transform(v => v ? parseInt(v, 10) : 1),
        limit: z.string().optional().transform(v => Math.min(v ? parseInt(v, 10) : 20, 100)),
    }),

    // Address parameter
    address: z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
    }),

    // ID parameter
    id: z.object({
        id: z.string().transform(v => parseInt(v, 10)).refine(v => v > 0, 'ID must be positive'),
    }),

    // Token ID parameter
    tokenId: z.object({
        tokenId: z.string().transform(v => parseInt(v, 10)).refine(v => v > 0, 'Token ID must be positive'),
    }),

    // Farm ID parameter
    farmId: z.object({
        farmId: z.string().transform(v => parseInt(v, 10)).refine(v => v > 0, 'Farm ID must be positive'),
    }),

    // IPFS upload body
    ipfsUpload: z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        image: z.string().url().optional(),
        attributes: z.array(z.object({
            trait_type: z.string(),
            value: z.union([z.string(), z.number()]),
        })).optional(),
        properties: z.object({
            farmId: z.number().positive(),
            carbonAmount: z.string(),
            methodology: z.string(),
            vintage: z.string(),
            verificationHash: z.string(),
        }).optional(),
    }),

    // CID parameter
    cid: z.object({
        cid: z.string().min(1).regex(/^(Qm|bafy)[a-zA-Z0-9]+$/, 'Invalid IPFS CID'),
    }),
};

export default validate;
