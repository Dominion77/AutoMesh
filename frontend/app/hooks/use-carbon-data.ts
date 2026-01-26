'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { CarbonSealRegistryABI, CarbonSealTokenABI } from '../lib/abis';

interface FarmData {
  id?: number;
  name?: string;
  area?: number;
  location?: string;
  soilType?: string;
  totalCarbon?: number;
  carbonDebt?: number;
  lastReadingTimestamp?: number;
  createdAt?: number;
}

interface CarbonData {
  current: number;
  available: number;
  threshold: number;
  percentage: number;
  history: Array<{
    date: string;
    carbon: number;
    sensorType: string;
    readingId: number;
  }>;
}

export function useCarbonData(farmerAddress?: string) {
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [carbonData, setCarbonData] = useState<CarbonData>({
    current: 0,
    available: 0,
    threshold: 1000,
    percentage: 0,
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const { data: farmDataFromChain, isLoading: farmLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: CarbonSealRegistryABI,
    functionName: 'getFarmByAddress',
    args: farmerAddress ? [farmerAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!farmerAddress,
      refetchInterval: 10000,
    },
  });

  const { data: availableCarbon, isLoading: carbonLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: CarbonSealRegistryABI,
    functionName: 'getAvailableCarbon',
    args: farmData?.id ? [BigInt(farmData.id)] : undefined,
    query: {
      enabled: !!farmData?.id,
      refetchInterval: 10000,
    },
  });

  useEffect(() => {
    if (farmDataFromChain) {
      const data = farmDataFromChain as {
        farmId: bigint;
        farmer: `0x${string}`;
        name: string;
        area: bigint;
        location: string;
        soilType: string;
        totalCarbon: bigint;
        carbonDebt: bigint;
        lastReadingTimestamp: bigint;
        isActive: boolean;
        createdAt: bigint;
      };
      
      const farm: FarmData = {
        id: Number(data.farmId),
        name: data.name,
        area: Number(data.area),
        location: data.location,
        soilType: data.soilType,
        totalCarbon: Number(data.totalCarbon),
        carbonDebt: Number(data.carbonDebt),
        lastReadingTimestamp: Number(data.lastReadingTimestamp) * 1000, 
        createdAt: Number(data.createdAt) * 1000,
      };
      setFarmData(farm);
    }
  }, [farmDataFromChain]);

  
  useEffect(() => {
    if (farmData && availableCarbon !== undefined) {
      const current = farmData.totalCarbon || 0;
      const available = Number(availableCarbon);
      const threshold = 1000; 
      const percentage = Math.min((available / threshold) * 100, 100);

      const history = generateMockHistoryData(current, farmData.createdAt);

      setCarbonData({
        current,
        available,
        threshold,
        percentage,
        history,
      });
      setIsLoading(false);
    }
  }, [farmData, availableCarbon]);

  const isLoadingData = farmLoading || carbonLoading || isLoading;

  return {
    farmData,
    carbonData,
    isLoading: isLoadingData,
    refetch: () => {
      setIsLoading(true);
    },
  };
}

function generateMockHistoryData(currentCarbon: number, startDate?: number): CarbonData['history'] {
  const history: CarbonData['history'] = [];
  const now = Date.now();
  const start = startDate || now - 30 * 24 * 60 * 60 * 1000; 
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  const dailyIncrement = currentCarbon / days;

  for (let i = 0; i <= days; i++) {
    const date = new Date(start + i * 24 * 60 * 60 * 1000);
    const carbon = Math.min(currentCarbon, dailyIncrement * i);
    const randomVariation = (Math.random() - 0.5) * dailyIncrement * 0.3;
    
    history.push({
      date: date.toISOString().split('T')[0],
      carbon: Math.max(0, Math.floor(carbon + randomVariation)),
      sensorType: ['soil', 'satellite', 'drone'][Math.floor(Math.random() * 3)],
      readingId: i,
    });
  }

  return history;
}


export function useCarbonCredits(ownerAddress?: string) {
  const [credits, setCredits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!ownerAddress) {
      setIsLoading(false);
      return;
    }

    const mockCredits = [
      {
        tokenId: 1,
        farmId: 1,
        carbonAmount: 1500,
        methodology: 'IPCC Tier 1',
        vintage: Date.now() - 30 * 24 * 60 * 60 * 1000,
        mintedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        isRetired: false,
        tokenURI: 'ipfs://QmExample1',
      },
      {
        tokenId: 2,
        farmId: 1,
        carbonAmount: 2000,
        methodology: 'VM0042',
        vintage: Date.now() - 15 * 24 * 60 * 60 * 1000,
        mintedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        isRetired: true,
        retiredAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        retirementReason: 'Corporate sustainability pledge',
        tokenURI: 'ipfs://QmExample2',
      },
    ];

    setTimeout(() => {
      setCredits(mockCredits);
      setIsLoading(false);
    }, 1000);
  }, [ownerAddress]);

  return { credits, isLoading };
}

export function useAddCarbonReading() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { writeContractAsync } = useWriteContract();

  const addReading = async (params: {
    farmId: number;
    amount: number;
    source: string;
    verificationHash: string;
  }) => {
    setIsAdding(true);
    setError(null);

    try {
      // Use the hook's async method
      await writeContractAsync({
        address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
        abi: CarbonSealRegistryABI,
        functionName: 'addCarbonReading',
        args: [
          BigInt(params.farmId),
          BigInt(params.amount),
          params.source,
          params.verificationHash,
        ],
      });

      return { success: true, readingId: Date.now() };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reading');
      return { success: false };
    } finally {
      setIsAdding(false);
    }
  };

  return { addReading, isAdding, error };
}