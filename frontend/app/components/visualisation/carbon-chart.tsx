'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CarbonDataPoint {
  date: string;
  carbon: number;
  sensorType: string;
  readingId: number;
}

interface CarbonChartProps {
  data?: CarbonDataPoint[];
  isLoading?: boolean;
}

const generateMockData = () => {
  const data: CarbonDataPoint[] = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const baseCarbon = 200 + Math.random() * 100;
    const trend = i * 10; 
    const noise = (Math.random() - 0.5) * 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      carbon: Math.max(0, Math.floor(baseCarbon + trend + noise)),
      sensorType: ['soil', 'satellite', 'drone'][Math.floor(Math.random() * 3)],
      readingId: i,
    });
  }
  
  return data;
};

export function CarbonChart({ data: propData, isLoading }: CarbonChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedSensor, setSelectedSensor] = useState<string>('all');

  const chartData = useMemo(() => {
    const sourceData = propData || generateMockData();
    
    let filteredData = sourceData;
    if (timeRange === '7d') {
      filteredData = sourceData.slice(-7);
    } else if (timeRange === '90d') {
      if (!propData) {
        filteredData = generateMockData().slice(-90);
      }
    }
    
    if (selectedSensor !== 'all') {
      filteredData = filteredData.filter(d => d.sensorType === selectedSensor);
    }
    
    return filteredData;
  }, [propData, timeRange, selectedSensor]);

  const totalCarbon = chartData.reduce((sum, point) => sum + point.carbon, 0);
  const averageDaily = totalCarbon / chartData.length;
  const growthRate = ((chartData[chartData.length - 1]?.carbon || 0) - 
                      (chartData[0]?.carbon || 0)) / (chartData[0]?.carbon || 1) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-4 shadow-xl"
        >
          <p className="font-bold text-gray-900">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-lilac-600 font-medium">Carbon: </span>
              <span className="font-bold">{payload[0].value.toLocaleString()} kg</span>
            </p>
            <p className="text-sm text-gray-600">
              Source: <span className="capitalize">{payload[0].payload.sensorType}</span>
            </p>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold">Carbon Sequestration Timeline</h4>
          <p className="text-gray-500">Track your farm's carbon accumulation over time</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/50">
            <Calendar className="w-4 h-4 text-gray-500" />
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-linear-to-r from-lilac-500 to-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/50">
            <Filter className="w-4 h-4 text-gray-500" />
            {['all', 'soil', 'satellite', 'drone'].map((sensor) => (
              <button
                key={sensor}
                onClick={() => setSelectedSensor(sensor)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors',
                  selectedSensor === sensor
                    ? 'bg-linear-to-r from-lilac-500 to-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {sensor}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-linear-to-br from-lilac-50 to-white"
        >
          <div className="text-2xl font-bold text-gradient">
            {totalCarbon.toLocaleString()} kg
          </div>
          <div className="text-sm text-gray-600">Total Carbon Sequestered</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-linear-to-br from-blue-50 to-white"
        >
          <div className="text-2xl font-bold text-lilac-600">
            {Math.round(averageDaily).toLocaleString()} kg
          </div>
          <div className="text-sm text-gray-600">Average Daily</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-linear-to-br from-green-50 to-white"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className={cn(
              'w-5 h-5',
              growthRate >= 0 ? 'text-green-500' : 'text-red-500'
            )} />
            <div className="text-2xl font-bold">
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-sm text-gray-600">Growth Rate</div>
        </motion.div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCarbonLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={1} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.05)"
              vertical={false}
            />
            
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `${value}kg`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600 capitalize">{value}</span>
              )}
            />
            
            <Area
              type="monotone"
              dataKey="carbon"
              stroke="url(#colorCarbonLine)"
              strokeWidth={3}
              fill="url(#colorCarbon)"
              name="Carbon Sequestered"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.readingId % 5 === 0) {
                  return (
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#a855f7"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: payload.readingId * 0.01 }}
                    />
                  );
                }
                return null;
              }}
              activeDot={{
                r: 8,
                fill: '#a855f7',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-linear-to-r from-lilac-500 to-blue-500" />
          <span>Carbon sequestration trend</span>
        </div>
        <div>
          {chartData.length} data points • {timeRange} view
        </div>
      </div>
    </div>
  );
}