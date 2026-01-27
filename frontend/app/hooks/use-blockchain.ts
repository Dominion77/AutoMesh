'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CarbonSealRegistryABI, CarbonSealTokenABI } from '../lib/abis';
import { useState } from 'react';
import { getAddress } from 'viem';

export function useCarbonSealRegistry() {
  const { address } = useAccount();
  const { writeContract: registerFarm, isPending: isRegistering } = useWriteContract();

  const registerFarmTx = (params: {
    name: string;
    area: number;
    location: string;
    soilType: string;
  }) => {
    return registerFarm({
      address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
      abi: CarbonSealRegistryABI,
      functionName: 'registerFarm',
      args: [params.name, BigInt(params.area), params.location, params.soilType],
    });
  };

  const { writeContract: addCarbonReading, isPending: isAddingReading } = useWriteContract();

  const addCarbonReadingTx = (params: {
    farmId: number;
    amount: number;
    source: string;
    verificationHash: string;
  }) => {
    return addCarbonReading({
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
  };

  const { data: farmStats, isLoading: isLoadingStats } = useReadContract({
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: CarbonSealRegistryABI,
    functionName: 'getFarmByAddress',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    registerFarm: registerFarmTx,
    isRegistering,
    addCarbonReading: addCarbonReadingTx,
    isAddingReading,
    farmData: farmStats,
    isLoadingFarmData: isLoadingStats,
  };
}

export function useCarbonSealToken() {
  const { writeContract: mintCredit, isPending: isMinting } = useWriteContract();
  const { writeContract: retireCredit, isPending: isRetiring } = useWriteContract();

  const mintCreditTx = (params: {
    to: string;
    farmId: number;
    amount: number;
    methodology: string;
    tokenURI: string;
  }) => {
    return mintCredit({
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
      abi: CarbonSealTokenABI,
      functionName: 'mintCredit',
      args: [
        getAddress(params.to),
        BigInt(params.farmId),
        BigInt(params.amount),
        params.methodology,
        params.tokenURI,
      ],
    });
  };

  const retireCreditTx = (params: { tokenId: number; reason: string }) => {
    return retireCredit({
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
      abi: CarbonSealTokenABI,
      functionName: 'retireCredit',
      args: [BigInt(params.tokenId), params.reason],
    });
  };

  return {
    mintCredit: mintCreditTx,
    isMinting,
    retireCredit: retireCreditTx,
    isRetiring,
  };
}

export function useTransactionStatus(hash?: `0x${string}`) {
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  return {
    isConfirming,
    isConfirmed,
    isPending: isConfirming,
    isSuccess: isConfirmed,
  };
}

export function useIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMetadata = async (metadata: any) => {
    setIsUploading(true);
    setError(null);

    try {
      // In production, upload to IPFS via Pinata, Web3.Storage, or similar
      // For now, return a mock IPFS hash
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockCID = `Qm${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      return { success: true, cid: mockCID, url: `ipfs://${mockCID}` };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMetadata, isUploading, error };
}