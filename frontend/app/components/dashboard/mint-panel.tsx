'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt, useAccount} from 'wagmi';
import { CarbonSealTokenABI } from '../../lib/abis';
import { AnimatedButton } from '../../components/ui/animated-button';
import { GlassCard } from '../../components/ui/glass-card';
import { Modal } from '../ui/modal';
import { Zap, Sparkles, CheckCircle } from 'lucide-react';

interface MintPanelProps {
  availableCarbon: number;
  farmId?: number;
}

export function MintPanel({ availableCarbon, farmId }: MintPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintAmount, setMintAmount] = useState(1000);
  const [methodology, setMethodology] = useState('IPCC Tier 1');
  
  const canMint = availableCarbon >= 1000 && farmId;

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });
  const {address} = useAccount();

  const handleMint = async () => {
    if (!canMint || !farmId) return;

    const tokenURI = `ipfs://QmGeneratedHash/${Date.now()}`;

    writeContract({
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
      abi: CarbonSealTokenABI,
      functionName: 'mintCredit',
      args: [
        address as `0x${string}`,
        BigInt(farmId),
        BigInt(mintAmount),
        methodology,
        tokenURI,
      ],
    });
  };

  return (
    <>
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-lilac-500 to-blue-500 flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Mint Credits</h3>
            <p className="text-gray-500">Transform carbon into NFT credits</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Carbon
            </label>
            <div className="text-3xl font-bold text-gradient">
              {availableCarbon.toLocaleString()} kg
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-linear-to-r from-lilac-500/10 to-blue-500/10">
            <div>
              <div className="font-medium">Minimum Required</div>
              <div className="text-2xl font-bold">1,000 kg</div>
            </div>
            <div className={canMint ? 'text-green-500' : 'text-orange-500'}>
              {canMint ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <div className="text-sm font-medium">Insufficient</div>
              )}
            </div>
          </div>

          <AnimatedButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setIsModalOpen(true)}
            disabled={!canMint || isPending || isConfirming}
            loading={isPending || isConfirming}
          >
            {isPending ? 'Minting...' : isConfirming ? 'Confirming...' : 'Mint Carbon Credits'}
            <Sparkles className="w-5 h-5" />
          </AnimatedButton>

          {isConfirmed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-linear-to-r from-green-500/10 to-emerald-500/10"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium">Credit Minted Successfully!</p>
                  <p className="text-sm text-gray-600">View in your wallet</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">Mint Carbon Credit</h3>
          <p className="text-gray-600 mb-6">Configure your carbon credit details</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (kg)</label>
              <input
                type="number"
                min="1000"
                max={availableCarbon}
                value={mintAmount}
                onChange={(e) => setMintAmount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Methodology</label>
              <select
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-500"
              >
                <option value="IPCC Tier 1">IPCC Tier 1</option>
                <option value="VM0042">VM0042 Improved Forest Management</option>
                <option value="Custom">Custom Methodology</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <AnimatedButton
                variant="secondary"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                variant="primary"
                className="flex-1"
                onClick={handleMint}
                loading={isPending || isConfirming}
              >
                Confirm Mint
              </AnimatedButton>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}