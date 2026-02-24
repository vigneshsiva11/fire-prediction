import { motion } from 'motion/react';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Wind, Droplets, Thermometer, Leaf } from 'lucide-react';
import { MetricCard } from '@/app/components/MetricCard';

const riskFactorsData = [
  { factor: 'Temperature', value: 85, fullMark: 100 },
  { factor: 'Humidity', value: 35, fullMark: 100 },
  { factor: 'Wind Speed', value: 65, fullMark: 100 },
  { factor: 'Vegetation', value: 78, fullMark: 100 },
  { factor: 'Terrain', value: 55, fullMark: 100 },
  { factor: 'History', value: 72, fullMark: 100 },
];

const zoneComparison = [
  { zone: 'Zone A', risk: 12, incidents: 2 },
  { zone: 'Zone B', risk: 45, incidents: 5 },
  { zone: 'Zone C', risk: 78, incidents: 12 },
  { zone: 'Zone D', risk: 18, incidents: 3 },
  { zone: 'Zone E', risk: 82, incidents: 11 },
];

export function RiskAnalysis() {
  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-[#FFA500]" />
          <h2 className="text-white">Risk Analysis Dashboard</h2>
        </div>
        <p className="text-gray-400">Comprehensive fire risk assessment and analytics</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Overall Risk Level"
          value="High"
          icon={AlertTriangle}
          color="#FF4C4C"
          delay={0.1}
        />
        <MetricCard
          title="Critical Zones"
          value="2"
          icon={TrendingUp}
          color="#FF4C4C"
          trend="+1"
          delay={0.2}
        />
        <MetricCard
          title="Risk Increase"
          value="+15%"
          icon={Wind}
          color="#FFA500"
          trend="+5%"
          delay={0.3}
        />
        <MetricCard
          title="Monitored Areas"
          value="5"
          icon={Leaf}
          color="#3B82F6"
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Factors Radar */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Risk Contributing Factors</h3>
            <p className="text-sm text-gray-400">Multi-dimensional risk assessment</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={riskFactorsData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="factor" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#FFA500"
                  fill="#FFA500"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Zone Comparison */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Zone Risk Comparison</h3>
            <p className="text-sm text-gray-400">Current risk scores and incident history</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={zoneComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="zone" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="risk" fill="#FFA500" name="Risk Score %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="incidents" fill="#FF4C4C" name="Past Incidents" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Environmental Factors Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-gradient-to-br from-[#FF4C4C]/20 to-[#FF4C4C]/5 rounded-xl p-6 border border-[#FF4C4C]/20">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer className="w-6 h-6 text-[#FF4C4C]" />
            <h4 className="text-white">Temperature</h4>
          </div>
          <p className="text-3xl text-white mb-2">38°C</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF4C4C] w-[85%]" />
            </div>
            <span className="text-xs text-gray-400">85%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Critical threshold</p>
        </div>

        <div className="bg-gradient-to-br from-[#1E90FF]/20 to-[#1E90FF]/5 rounded-xl p-6 border border-[#1E90FF]/20">
          <div className="flex items-center gap-3 mb-3">
            <Droplets className="w-6 h-6 text-[#1E90FF]" />
            <h4 className="text-white">Humidity</h4>
          </div>
          <p className="text-3xl text-white mb-2">25%</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#1E90FF] w-[25%]" />
            </div>
            <span className="text-xs text-gray-400">25%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Very low - high risk</p>
        </div>

        <div className="bg-gradient-to-br from-[#FFA500]/20 to-[#FFA500]/5 rounded-xl p-6 border border-[#FFA500]/20">
          <div className="flex items-center gap-3 mb-3">
            <Wind className="w-6 h-6 text-[#FFA500]" />
            <h4 className="text-white">Wind Speed</h4>
          </div>
          <p className="text-3xl text-white mb-2">25 km/h</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FFA500] w-[65%]" />
            </div>
            <span className="text-xs text-gray-400">65%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Moderate to high</p>
        </div>

        <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 rounded-xl p-6 border border-[#3B82F6]/20">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-6 h-6 text-[#3B82F6]" />
            <h4 className="text-white">Vegetation</h4>
          </div>
          <p className="text-3xl text-white mb-2">78%</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FFA500] w-[78%]" />
            </div>
            <span className="text-xs text-gray-400">78%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Dryness level</p>
        </div>
      </motion.div>

      {/* Risk Assessment Summary */}
      <motion.div
        className="bg-gradient-to-r from-[#FF4C4C]/10 via-[#FFA500]/10 to-[#FF4C4C]/10 border border-[#FF4C4C]/30 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-[#FF4C4C] flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-white mb-2">Critical Risk Assessment</h3>
            <p className="text-gray-300 mb-4">
              Current environmental conditions indicate <span className="text-[#FF4C4C] font-semibold">CRITICAL</span> fire risk levels across 2 zones. 
              Combination of high temperature (38°C), low humidity (25%), strong winds (25 km/h), and dry vegetation (78%) creates 
              extremely favorable conditions for rapid fire spread.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-gray-400">Recommended Action: </span>
                <span className="text-white">Deploy additional monitoring drones</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-gray-400">Priority Zones: </span>
                <span className="text-white">Zone C, Zone E</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-gray-400">Risk Duration: </span>
                <span className="text-white">Next 6-8 hours</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

