import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    // Server
    PORT: z.string().default('3001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Blockchain
    RPC_URL: z.string().min(1),
    REGISTRY_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    TOKEN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    ORACLE_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),

    // Pinata IPFS
    PINATA_JWT: z.string().min(1),
    PINATA_GATEWAY: z.string().url().default('https://gateway.pinata.cloud'),

    // CORS
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
    RATE_LIMIT_MAX: z.string().default('100'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;

export const config = {
    port: parseInt(env.PORT, 10),
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',

    supabase: {
        url: env.SUPABASE_URL,
        anonKey: env.SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },

    blockchain: {
        rpcUrl: env.RPC_URL,
        contracts: {
            registry: env.REGISTRY_ADDRESS as `0x${string}`,
            token: env.TOKEN_ADDRESS as `0x${string}`,
            oracle: env.ORACLE_ADDRESS as `0x${string}`,
        },
    },

    pinata: {
        jwt: env.PINATA_JWT,
        gateway: env.PINATA_GATEWAY,
    },

    cors: {
        origin: env.FRONTEND_URL,
    },

    rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
        max: parseInt(env.RATE_LIMIT_MAX, 10),
    },
} as const;

export type Config = typeof config;
