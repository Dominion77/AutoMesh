import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import rateLimit from 'express-rate-limit';

// Routes
import healthRoutes from './routes/health.routes.js';
import ipfsRoutes from './routes/ipfs.routes.js';
import farmRoutes from './routes/farms.routes.js';
import creditRoutes from './routes/credits.routes.js';
import statsRoutes from './routes/stats.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        timestamp: new Date().toISOString(),
    },
});
app.use('/api/', limiter);

// Standard middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(config.isDevelopment ? 'dev' : 'combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
}));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/stats', statsRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
