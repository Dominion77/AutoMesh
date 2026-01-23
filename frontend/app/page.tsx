'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { WalletConnector } from './components/web3/wallet-connector';
import { GlassCard } from './components/ui/glass-card';
import { GradientText } from './components/ui/gradient-text';
import { CarbonMeter } from './components/dashboard/carbon-meter';
import { FarmCard } from './components/dashboard/farm-card';
import { MintPanel } from './components/dashboard/mint-panel';
import { CarbonChart } from '@/components/visualizations/carbon-chart';
import { Leaf, Droplets, Zap, Sparkles } from 'lucide-react';
import { useCarbonData } from '@/hooks/use-carbon-data';

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const { carbonData, farmData, isLoading } = useCarbonData(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-soft-blue">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full bg-gradient-lilac flex items-center justify-center"
                >
                  <Leaf className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              <div>
                <GradientText className="text-4xl font-bold">CarbonSeal</GradientText>
                <p className="text-gray-600 mt-2">Mint verifiable carbon credits from regenerative farming</p>
              </div>
              <div className="pt-4">
                <WalletConnector />
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="pt-8"
              >
                <Sparkles className="w-6 h-6 text-lilac-400 mx-auto" />
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-lilac-50/30">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-lilac-200/20 to-transparent" />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="lg:w-1/2">
              <GradientText className="text-5xl lg:text-6xl font-bold leading-tight">
                Your Carbon Journey
              </GradientText>
              <p className="text-gray-600 mt-4 text-lg">
                Transform agricultural data into verifiable carbon credits on peaq blockchain
              </p>
            </div>
            <div className="lg:w-1/2">
              <GlassCard className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-lilac flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Real-time Monitoring</h3>
                    <p className="text-gray-500">IoT sensors tracking carbon sequestration</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FarmCard farmData={farmData} />
            </motion.div>

            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">Carbon Accumulation</h3>
                    <p className="text-gray-500">Real-time tracking of carbon sequestration</p>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-lilac-500">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CarbonChart data={carbonData} />
              </GlassCard>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CarbonMeter 
                current={carbonData?.current || 0}
                threshold={1000}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Mint Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MintPanel 
                availableCarbon={carbonData?.available || 0}
                farmId={farmData?.id}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <h4 className="font-semibold mb-4">Ecosystem Stats</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Farms</span>
                    <span className="font-bold text-lg">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Credits Minted</span>
                    <span className="font-bold text-lg">45,891</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Carbon Sequestered</span>
                    <span className="font-bold text-lg">12,450 tCO₂</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-4 h-4 rounded-full bg-linear-to-r from-lilac-500 to-blue-500"
        />
      </div>
    </div>
  );
}