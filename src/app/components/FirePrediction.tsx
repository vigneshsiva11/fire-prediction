import { motion } from 'motion/react';
import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from '@/app/components/ui/slider';
import { Wind, Clock, Flame } from 'lucide-react';

const spreadData = [
  { time: '0h', area: 0 },
  { time: '1h', area: 2.5 },
  { time: '2h', area: 5.8 },
  { time: '3h', area: 10.2 },
  { time: '4h', area: 16.5 },
  { time: '5h', area: 24.3 },
  { time: '6h', area: 34.1 },
];

const riskOverTime = [
  { hour: '12:00', risk: 45 },
  { hour: '13:00', risk: 52 },
  { hour: '14:00', risk: 61 },
  { hour: '15:00', risk: 73 },
  { hour: '16:00', risk: 78 },
  { hour: '17:00', risk: 85 },
  { hour: '18:00', risk: 76 },
];

export function FirePrediction() {
  const [timeRange, setTimeRange] = useState([3]);

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-white mb-2">Fire Spread Prediction & Analysis</h2>
        <p className="text-gray-400">AI-powered fire behavior modeling based on current conditions</p>
      </motion.div>

      {/* Time Slider */}
      <motion.div
        className="bg-[#1E293B] rounded-xl p-6 border border-white/10 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <Clock className="w-5 h-5 text-[#1E90FF]" />
          <h3 className="text-white">Time Prediction Range</h3>
        </div>
        <div className="flex items-center gap-6">
          <Slider
            value={timeRange}
            onValueChange={setTimeRange}
            max={6}
            min={1}
            step={1}
            className="flex-1"
          />
          <div className="bg-[#1E293B] px-4 py-2 rounded-lg">
            <span className="text-white">Next {timeRange[0]} Hour{timeRange[0] > 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {/* Fire Spread Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Fire Spread Simulation</h3>
            <p className="text-sm text-gray-400">Predicted fire progression pattern</p>
          </div>
          
          <div className="relative h-96 bg-cover bg-center p-6"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2000)',
              filter: 'brightness(0.4)',
            }}
          >
            {/* Fire origin point */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Expanding fire circles */}
              {[1, 2, 3, 4].map((ring, index) => (
                <motion.div
                  key={ring}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                  style={{
                    borderColor: `rgba(255, ${200 - index * 40}, 76, ${0.8 - index * 0.15})`,
                    backgroundColor: `rgba(255, ${200 - index * 40}, 76, ${0.3 - index * 0.07})`,
                  }}
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{
                    width: ring * 60 * (timeRange[0] / 3),
                    height: ring * 60 * (timeRange[0] / 3),
                    opacity: ring <= timeRange[0] ? 0.8 - index * 0.15 : 0,
                  }}
                  transition={{ delay: 0.7 + index * 0.2, duration: 0.8 }}
                />
              ))}
              
              {/* Center fire point */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF4C4C] rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Wind direction arrow */}
            <motion.div
              className="absolute top-8 right-8 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Wind className="w-5 h-5 text-[#1E90FF]" />
              <span className="text-white text-sm">Wind: NE 15km/h</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-6 h-6 text-[#1E90FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Area prediction */}
            <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg">
              <p className="text-gray-300 text-sm mb-1">Predicted Affected Area</p>
              <p className="text-white text-2xl">
                {(spreadData[Math.min(timeRange[0], spreadData.length - 1)].area).toFixed(1)} km²
              </p>
            </div>
          </div>
        </motion.div>

        {/* Spread Chart */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Fire Spread Area Over Time</h3>
            <p className="text-sm text-gray-400">Projected growth in square kilometers</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={spreadData}>
                <defs>
                  <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4C4C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF4C4C" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: 'Area (km²)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="area"
                  stroke="#FF4C4C"
                  strokeWidth={2}
                  fill="url(#spreadGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Risk Timeline */}
      <motion.div
        className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-[#FF4C4C]" />
            <div>
              <h3 className="text-white">Fire Risk Score Timeline</h3>
              <p className="text-sm text-gray-400">Hourly risk assessment based on weather conditions</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#FFA500"
                strokeWidth={3}
                dot={{ fill: '#FFA500', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        className="mt-6 bg-gradient-to-r from-[#FF4C4C]/20 to-[#FFA500]/20 border border-[#FF4C4C]/50 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0.8, 1, 0.8], y: 0 }}
        transition={{ opacity: { duration: 2, repeat: Infinity }, y: { delay: 0.5 } }}
      >
        <div className="flex items-start gap-4">
          <Flame className="w-6 h-6 text-[#FF4C4C] flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white mb-2">High Risk Prediction Alert</h4>
            <p className="text-gray-300 mb-4">
              Based on current weather patterns, temperature, and vegetation dryness, fire risk is expected to reach critical levels between 2 PM - 6 PM. Recommend increased surveillance and fire crew readiness.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="bg-white/10 px-3 py-1 rounded-full text-white">
                🌡️ Temperature: 38°C (High)
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-white">
                💨 Wind Speed: 25 km/h (Increasing)
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-white">
                🌱 Humidity: 18% (Critical)
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

