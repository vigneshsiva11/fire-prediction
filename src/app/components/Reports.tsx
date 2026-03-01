import { motion } from 'motion/react';
import { FileText, Download, TrendingUp, Target, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useMonitoringContext } from '@/context/MonitoringContext';
import { calculateFireIntelligence } from '@/utils/firePredictionEngine';

export function Reports() {
  const { environmentalData, aiInsights } = useMonitoringContext();

  const intelligence = useMemo(() => aiInsights || calculateFireIntelligence(environmentalData), [aiInsights, environmentalData]);

  const fireIncidentsData = useMemo(
    () =>
      (intelligence?.hourlyForecast || []).map((point: any, index: number) => ({
        month: `${index + 1}h`,
        incidents: Math.max(1, Math.round(point.predicted / 10)),
      })),
    [intelligence],
  );

  const zoneRiskData = useMemo(() => {
    const base = Number(intelligence?.riskScore || 0);
    return [
      { name: 'Zone A', value: Math.max(0, Number((base * 0.65).toFixed(1))), color: '#3B82F6' },
      { name: 'Zone B', value: Math.max(0, Number((base * 0.78).toFixed(1))), color: '#FFA500' },
      { name: 'Zone C', value: Math.max(0, Number((base * 0.9).toFixed(1))), color: '#FF4C4C' },
      { name: 'Zone D', value: Math.max(0, Number((base * 0.55).toFixed(1))), color: '#3B82F6' },
      { name: 'Zone E', value: Math.max(0, Number((base * 0.98).toFixed(1))), color: '#FF4C4C' },
    ];
  }, [intelligence]);

  const modelAccuracy = useMemo(
    () => [
      { metric: 'Fire Detection', accuracy: Number(Math.min(99, 86 + Number(intelligence?.confidenceScore || 0) * 0.12).toFixed(1)) },
      { metric: 'Risk Prediction', accuracy: Number((Number(intelligence?.confidenceScore || 0) || 0).toFixed(1)) },
      { metric: 'Spread Modeling', accuracy: Number(Math.min(98, 78 + Number(intelligence?.spreadVelocity || 0) * 0.8).toFixed(1)) },
      { metric: 'Thermal Analysis', accuracy: Number(Math.min(99, 82 + Number(intelligence?.confidenceScore || 0) * 0.14).toFixed(1)) },
    ],
    [intelligence],
  );

  const quickStats = useMemo(
    () => ({
      detections: fireIncidentsData.reduce((sum: number, row: any) => sum + row.incidents, 0),
      prevention: Math.max(55, Math.min(99, Math.round(100 - Number(intelligence?.riskScore || 0) * 0.25))),
      monitoringDays: 365,
    }),
    [fireIncidentsData, intelligence],
  );

  const handleDownloadReport = (type: string) => {
    console.log(`Downloading ${type} report...`);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-[#1E90FF]" />
          <h2 className="text-white">Reports & Data Analytics</h2>
        </div>
        <p className="text-gray-400">Historical data, trends, and model performance metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div className="bg-gradient-to-br from-[#1E293B] to-[#1E293B]/60 rounded-xl p-6 border border-[#3B82F6]/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <TrendingUp className="w-8 h-8 text-[#3B82F6] mb-3" />
          <p className="text-gray-300 text-sm mb-1">Total Detections</p>
          <h3 className="text-3xl text-white">{quickStats.detections}</h3>
          <p className="text-xs text-gray-400 mt-2">Forecast window</p>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-[#1E90FF]/20 to-[#1E90FF]/5 rounded-xl p-6 border border-[#1E90FF]/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Target className="w-8 h-8 text-[#1E90FF] mb-3" />
          <p className="text-gray-300 text-sm mb-1">Prevention Success</p>
          <h3 className="text-3xl text-white">{quickStats.prevention}%</h3>
          <p className="text-xs text-gray-400 mt-2">AI mitigation estimate</p>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-[#FFA500]/20 to-[#FFA500]/5 rounded-xl p-6 border border-[#FFA500]/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Calendar className="w-8 h-8 text-[#FFA500] mb-3" />
          <p className="text-gray-300 text-sm mb-1">Monitoring Days</p>
          <h3 className="text-3xl text-white">{quickStats.monitoringDays}</h3>
          <p className="text-xs text-gray-400 mt-2">Continuous operation</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white">Fire Incidents Over Time</h3>
              <p className="text-sm text-gray-400">Hourly predicted incident trend</p>
            </div>
            <Button size="sm" variant="outline" className="text-white border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fireIncidentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="incidents" fill="#FF4C4C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Current Risk Distribution</h3>
            <p className="text-sm text-gray-400">Risk levels across zones</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={zoneRiskData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {zoneRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white">ML Model Performance</h3>
          <p className="text-sm text-gray-400">AI detection and prediction accuracy metrics</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {modelAccuracy.map((item, index) => (
              <motion.div key={item.metric} className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }}>
                <div className="flex items-center justify-between">
                  <span className="text-white">{item.metric}</span>
                  <span className="text-[#3B82F6]">{item.accuracy}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1E293B] rounded-full" initial={{ width: 0 }} animate={{ width: `${item.accuracy}%` }} transition={{ delay: 0.8 + index * 0.1, duration: 1 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-[#1E293B] rounded-xl border border-white/10 p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <h3 className="text-white mb-2">Generate Reports</h3>
        <p className="text-sm text-gray-300 mb-4">{intelligence?.reportSummary}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => handleDownloadReport('daily')} className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white justify-start h-auto py-4">
            <div className="flex items-start gap-3 text-left">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Daily Report</p>
                <p className="text-xs text-gray-300 mt-1">Last 24 hours activity</p>
              </div>
            </div>
          </Button>

          <Button onClick={() => handleDownloadReport('weekly')} className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white justify-start h-auto py-4">
            <div className="flex items-start gap-3 text-left">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Weekly Report</p>
                <p className="text-xs text-gray-300 mt-1">Last 7 days summary</p>
              </div>
            </div>
          </Button>

          <Button onClick={() => handleDownloadReport('monthly')} className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white justify-start h-auto py-4">
            <div className="flex items-start gap-3 text-left">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Monthly Report</p>
                <p className="text-xs text-gray-300 mt-1">Comprehensive analysis</p>
              </div>
            </div>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
