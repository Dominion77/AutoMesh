import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class ApiError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string): ApiError {
        return new ApiError(message, 400);
    }

    static notFound(message: string): ApiError {
        return new ApiError(message, 404);
    }

    static unauthorized(message: string): ApiError {
        return new ApiError(message, 401);
    }

    static forbidden(message: string): ApiError {
        return new ApiError(message, 403);
    }

    static internal(message: string): ApiError {
        return new ApiError(message, 500, false);
    }

    static serviceUnavailable(message: string): ApiError {
        return new ApiError(message, 503);
    }
}

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error
    if (statusCode >= 500) {
        logger.error('Server error', {
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.warn('Client error', {
            error: err.message,
            path: req.path,
            method: req.method,
            statusCode,
        });
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        error: config.isProduction && statusCode >= 500
            ? 'Internal Server Error'
            : message,
        timestamp: new Date().toISOString(),
    });
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
}

// Async handler wrapper to catch errors
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
