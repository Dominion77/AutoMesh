'use client';

import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { GlassCard } from '../../components/ui/glass-card';
import { cn } from '../../lib/utils';

interface CarbonMeterProps {
  current: number;
  threshold: number;
  isLoading?: boolean;
}

export function CarbonMeter({ current, threshold = 1000, isLoading }: CarbonMeterProps) {
  const percentage = Math.min((current / threshold) * 100, 100);
  
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Carbon Progress</h3>
          <p className="text-gray-500">Mint when you reach {threshold} kg</p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full bg-gradient-lilac flex items-center justify-center"
        >
          <Leaf className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      <div className="relative">
        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full bg-linear-to-r from-lilac-400 to-blue-500',
              percentage >= 100 && 'animate-pulse-glow'
            )}
          />
        </div>
        
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((value) => (
            <div key={value} className="flex flex-col items-center">
              <div className={cn(
                'w-2 h-2 rounded-full',
                percentage >= value ? 'bg-lilac-500' : 'bg-gray-300'
              )} />
              <span className="text-xs text-gray-500 mt-1">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center p-4 rounded-2xl bg-linear-to-br from-lilac-50 to-white">
          <div className="text-3xl font-bold text-gradient">{current.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Current (kg)</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-linear-to-br from-blue-50 to-white">
          <div className="text-3xl font-bold text-lilac-600">{threshold.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Threshold (kg)</div>
        </div>
      </div>

      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 rounded-2xl bg-linear-to-r from-lilac-500/10 to-blue-500/10"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-3 h-3 rounded-full',
            percentage >= 100 ? 'animate-pulse bg-green-500' : 'bg-blue-500'
          )} />
          <div>
            <p className="font-medium">
              {percentage >= 100 ? 'Ready to mint!' : `${threshold - current} kg more to mint`}
            </p>
            <p className="text-sm text-gray-600">
              {percentage >= 100 
                ? 'Your carbon credits are ready for minting' 
                : 'Keep adding sensor data to reach threshold'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </GlassCard>
  );
}