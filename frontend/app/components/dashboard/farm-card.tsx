'use client';

import { motion } from 'framer-motion';
import { MapPin, Droplets, Trees, Calendar } from 'lucide-react';
import { GlassCard } from '../../components/ui/glass-card';
import {GradientText} from '../../components/ui/gradient-text';
import { formatNumber } from '../../lib/utils';

interface FarmData {
  id?: number;
  name?: string;
  area?: number;
  location?: string;
  soilType?: string;
  totalCarbon?: number;
  lastReadingTimestamp?: number;
  createdAt?: number;
}

interface FarmCardProps {
  farmData?: FarmData;
}

export function FarmCard({ farmData }: FarmCardProps) {
  const hasFarm = farmData && farmData.id;

  if (!hasFarm) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-lilac-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
            <Trees className="w-10 h-10 text-lilac-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Farm Registered</h3>
          <p className="text-gray-500 mb-4">Register your farm to start tracking carbon</p>
          <button className="px-6 py-2 rounded-xl bg-linear-to-r from-lilac-500 to-blue-500 text-white font-medium hover:shadow-lg transition-shadow">
            Register Farm
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative h-48 lg:h-full rounded-2xl overflow-hidden bg-linear-to-br from-lilac-500/20 to-blue-500/20"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Trees className="w-16 h-16 text-lilac-500" />
            </div>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-medium">
                Farm ID: #{farmData.id}
              </span>
            </div>
          </motion.div>
        </div>

        
        <div className="lg:w-3/4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{farmData.name}</h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{farmData.location}</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full bg-linear-to-r from-lilac-500/10 to-blue-500/10">
              <span className="text-sm font-medium">{farmData.soilType} Soil</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-linear-to-br from-lilac-50 to-white">
              <div className="text-2xl font-bold text-gradient">
                {farmData.area ? formatNumber(farmData.area) : '0'}
              </div>
              <div className="text-sm text-gray-600">Area (m²)</div>
            </div>
            
            <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50 to-white">
              <div className="text-2xl font-bold text-lilac-600">
                {farmData.totalCarbon ? formatNumber(farmData.totalCarbon) : '0'}
              </div>
              <div className="text-sm text-gray-600">Carbon (kg)</div>
            </div>
            
            <div className="p-4 rounded-2xl bg-linear-to-br from-green-50 to-white">
              <div className="text-2xl font-bold text-blue-600">
                {farmData.lastReadingTimestamp ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            
            <div className="p-4 rounded-2xl bg-linear-to-br from-purple-50 to-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-lilac-500" />
                <div>
                  <div className="text-lg font-bold">
                    {farmData.createdAt ? new Date(farmData.createdAt * 1000).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Registered</div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 rounded-xl bg-linear-to-r from-lilac-500 to-blue-500 text-white font-medium hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center gap-2">
                <Droplets className="w-5 h-5" />
                Add Sensor Data
              </div>
            </motion.button>
            <button className="px-6 py-3 rounded-xl border border-lilac-200 text-lilac-600 hover:bg-lilac-50 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}