export interface Farm {
    farmId: number;
    farmer: string;
    name: string;
    area: bigint;
    location: string;
    soilType: string;
    totalCarbon: bigint;
    carbonDebt: bigint;
    lastReadingTimestamp: number;
    isActive: boolean;
    createdAt: number;
}

export interface FarmResponse {
    id: number;
    farmer: string;
    name: string;
    area: string;
    location: string;
    soilType: string;
    totalCarbon: string;
    carbonDebt: string;
    availableCarbon: string;
    lastReadingTimestamp: number;
    isActive: boolean;
    createdAt: number;
}

// Carbon reading types
export interface CarbonReading {
    readingId: number;
    farmId: number;
    amount: bigint;
    source: string;
    verificationHash: string;
    timestamp: number;
    verifiedBy: string;
}

export interface CarbonReadingResponse {
    id: number;
    farmId: number;
    amount: string;
    source: string;
    verificationHash: string;
    timestamp: number;
    verifiedBy: string;
}

// Carbon credit types
export interface CarbonCredit {
    tokenId: number;
    farmId: number;
    farmer: string;
    carbonAmount: bigint;
    methodology: string;
    vintage: number;
    mintedAt: number;
    isRetired: boolean;
    retiredAt: number;
    retirementReason: string;
}

export interface CarbonCreditResponse {
    tokenId: number;
    farmId: number;
    farmer: string;
    carbonAmount: string;
    methodology: string;
    vintage: number;
    mintedAt: number;
    isRetired: boolean;
    retiredAt: number | null;
    retirementReason: string | null;
    tokenUri?: string;
}

// Ecosystem stats
export interface EcosystemStats {
    totalFarms: number;
    totalCredits: number;
    totalCarbonSequestered: string;
    activeFarmers: number;
    carbonPrice: string;
}

// Farm stats from contract
export interface FarmStats {
    totalCarbon: string;
    carbonDebt: string;
    availableCarbon: string;
    readingCount: number;
    creditCount: number;
    lastUpdate: number;
}

// IPFS types
export interface IPFSUploadResult {
    success: boolean;
    cid?: string;
    url?: string;
    error?: string;
}

export interface CreditMetadata {
    name: string;
    description: string;
    image?: string;
    attributes: {
        trait_type: string;
        value: string | number;
    }[];
    properties: {
        farmId: number;
        carbonAmount: string;
        methodology: string;
        vintage: string;
        verificationHash: string;
    };
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    timestamp: string;
}

// Supabase table types
export interface DbFarm {
    id: number;
    farmer: string;
    name: string;
    area: string;
    location: string;
    soil_type: string;
    total_carbon: string;
    carbon_debt: string;
    last_reading_timestamp: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbReading {
    id: number;
    farm_id: number;
    amount: string;
    source: string;
    verification_hash: string;
    timestamp: string;
    verified_by: string;
    created_at: string;
}

export interface DbCredit {
    id: number;
    token_id: number;
    farm_id: number;
    farmer: string;
    carbon_amount: string;
    methodology: string;
    vintage: string;
    minted_at: string;
    is_retired: boolean;
    retired_at: string | null;
    retirement_reason: string | null;
    token_uri: string;
    created_at: string;
    updated_at: string;
}

export interface DbSyncState {
    id: number;
    last_block: string;
    updated_at: string;
}
