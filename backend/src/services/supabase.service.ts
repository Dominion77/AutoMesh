import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { DbFarm, DbReading, DbCredit, DbSyncState } from '../types/index.js';

// Database types for Supabase
// Database types for Supabase
export interface Database {
    public: {
        Tables: {
            farms: {
                Row: DbFarm;
                Insert: Omit<DbFarm, 'id' | 'created_at' | 'updated_at'> & { id?: number };
                Update: Partial<DbFarm>;
                Relationships: [];
            };
            readings: {
                Row: DbReading;
                Insert: Omit<DbReading, 'id' | 'created_at'> & { id?: number };
                Update: Partial<DbReading>;
                Relationships: [];
            };
            credits: {
                Row: DbCredit;
                Insert: Omit<DbCredit, 'id' | 'created_at' | 'updated_at'> & { id?: number };
                Update: Partial<DbCredit>;
                Relationships: [];
            };
            sync_state: {
                Row: DbSyncState;
                Insert: Omit<DbSyncState, 'id' | 'updated_at'> & { id?: number };
                Update: Partial<DbSyncState>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

class SupabaseService {
    private client: SupabaseClient<any>;
    private adminClient: SupabaseClient<any>;

    constructor() {
        this.client = createClient<any>(
            config.supabase.url,
            config.supabase.anonKey
        );

        this.adminClient = createClient<any>(
            config.supabase.url,
            config.supabase.serviceRoleKey
        );

        logger.info('Supabase clients initialized');
    }

    // Farm operations
    async getFarms(page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.client
            .from('farms')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data as DbFarm[]) ?? [], total: count ?? 0 };
    }

    async getFarmById(id: number): Promise<DbFarm | null> {
        const { data, error } = await this.client
            .from('farms')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as DbFarm | null;
    }

    async getFarmByAddress(address: string): Promise<DbFarm | null> {
        const { data, error } = await this.client
            .from('farms')
            .select('*')
            .eq('farmer', address.toLowerCase())
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as DbFarm | null;
    }

    async upsertFarm(farm: Database['public']['Tables']['farms']['Insert']) {
        const { data, error } = await this.adminClient
            .from('farms')
            .upsert(farm, { onConflict: 'id' })
            .select()
            .single();

        if (error) throw error;
        return data as DbFarm;
    }

    // Reading operations
    async getReadingsByFarm(farmId: number, page = 1, limit = 50) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.client
            .from('readings')
            .select('*', { count: 'exact' })
            .eq('farm_id', farmId)
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data as DbReading[]) ?? [], total: count ?? 0 };
    }

    async insertReading(reading: Database['public']['Tables']['readings']['Insert']) {
        const { data, error } = await this.adminClient
            .from('readings')
            .insert(reading)
            .select()
            .single();

        if (error) throw error;
        return data as DbReading;
    }

    // Credit operations
    async getCredits(page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.client
            .from('credits')
            .select('*', { count: 'exact' })
            .order('minted_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data as DbCredit[]) ?? [], total: count ?? 0 };
    }

    async getCreditByTokenId(tokenId: number): Promise<DbCredit | null> {
        const { data, error } = await this.client
            .from('credits')
            .select('*')
            .eq('token_id', tokenId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as DbCredit | null;
    }

    async getCreditsByOwner(owner: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.client
            .from('credits')
            .select('*', { count: 'exact' })
            .eq('farmer', owner.toLowerCase())
            .order('minted_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data as DbCredit[]) ?? [], total: count ?? 0 };
    }

    async getCreditsByFarm(farmId: number, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.client
            .from('credits')
            .select('*', { count: 'exact' })
            .eq('farm_id', farmId)
            .order('minted_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data as DbCredit[]) ?? [], total: count ?? 0 };
    }

    async upsertCredit(credit: Database['public']['Tables']['credits']['Insert']) {
        const { data, error } = await this.adminClient
            .from('credits')
            .upsert(credit, { onConflict: 'token_id' })
            .select()
            .single();

        if (error) throw error;
        return data as DbCredit;
    }

    // Stats operations
    async getEcosystemStats() {
        const [farmsResult, creditsResult] = await Promise.all([
            this.client
                .from('farms')
                .select('total_carbon, is_active', { count: 'exact' }),
            this.client
                .from('credits')
                .select('carbon_amount', { count: 'exact' }),
        ]);

        const totalFarms = farmsResult.count ?? 0;
        const activeFarms = (farmsResult.data as any[] | null)?.filter(f => f.is_active).length ?? 0;
        const totalCredits = creditsResult.count ?? 0;

        let totalCarbon = BigInt(0);
        for (const farm of (farmsResult.data as DbFarm[] | null) ?? []) {
            totalCarbon += BigInt(farm.total_carbon || '0');
        }

        return {
            totalFarms,
            activeFarmers: activeFarms,
            totalCredits,
            totalCarbonSequestered: totalCarbon.toString(),
        };
    }

    // Sync state
    async getSyncState(): Promise<DbSyncState | null> {
        const { data, error } = await this.client
            .from('sync_state')
            .select('*')
            .eq('id', 1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as DbSyncState | null;
    }

    async updateSyncState(lastBlock: bigint) {
        const { data, error } = await this.adminClient
            .from('sync_state')
            .upsert({
                id: 1,
                last_block: lastBlock.toString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data as DbSyncState;
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            const { error } = await this.client.from('farms').select('id').limit(1);
            return !error;
        } catch {
            return false;
        }
    }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
