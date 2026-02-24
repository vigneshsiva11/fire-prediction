import { motion } from 'motion/react';
import { FileText, Download, TrendingUp, Target, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fireIncidentsData = [
  { month: 'Jan', incidents: 3 },
  { month: 'Feb', incidents: 2 },
  { month: 'Mar', incidents: 5 },
  { month: 'Apr', incidents: 8 },
  { month: 'May', incidents: 12 },
  { month: 'Jun', incidents: 15 },
];

const zoneRiskData = [
  { name: 'Zone A', value: 12, color: '#3B82F6' },
  { name: 'Zone B', value: 45, color: '#FFA500' },
  { name: 'Zone C', value: 78, color: '#FF4C4C' },
  { name: 'Zone D', value: 18, color: '#3B82F6' },
  { name: 'Zone E', value: 82, color: '#FF4C4C' },
];

const modelAccuracy = [
  { metric: 'Fire Detection', accuracy: 94.5 },
  { metric: 'Risk Prediction', accuracy: 89.2 },
  { metric: 'Spread Modeling', accuracy: 87.8 },
  { metric: 'Thermal Analysis', accuracy: 92.3 },
];

export function Reports() {
  const handleDownloadReport = (type: string) => {
    console.log(`Downloading ${type} report...`);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-[#1E90FF]" />
          <h2 className="text-white">Reports & Data Analytics</h2>
        </div>
        <p className="text-gray-400">Historical data, trends, and model performance metrics</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-gradient-to-br from-[#1E293B] to-[#1E293B]/60 rounded-xl p-6 border border-[#3B82F6]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrendingUp className="w-8 h-8 text-[#3B82F6] mb-3" />
          <p className="text-gray-300 text-sm mb-1">Total Detections</p>
          <h3 className="text-3xl text-white">45</h3>
          <p className="text-xs text-gray-400 mt-2">This year</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-[#1E90FF]/20 to-[#1E90FF]/5 rounded-xl p-6 border border-[#1E90FF]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Target className="w-8 h-8 text-[#1E90FF] mb-3" />
          <p className="text-gray-300 text-sm mb-1">Prevention Success</p>
          <h3 className="text-3xl text-white">91%</h3>
          <p className="text-xs text-gray-400 mt-2">Early interventions</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-[#FFA500]/20 to-[#FFA500]/5 rounded-xl p-6 border border-[#FFA500]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Calendar className="w-8 h-8 text-[#FFA500] mb-3" />
          <p className="text-gray-300 text-sm mb-1">Monitoring Days</p>
          <h3 className="text-3xl text-white">365</h3>
          <p className="text-xs text-gray-400 mt-2">Continuous operation</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Fire Incidents Chart */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white">Fire Incidents Over Time</h3>
              <p className="text-sm text-gray-400">Monthly detection count</p>
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
                    color: '#fff'
                  }}
                />
                <Bar dataKey="incidents" fill="#FF4C4C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Zone Risk Distribution */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Current Risk Distribution</h3>
            <p className="text-sm text-gray-400">Risk levels across zones</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={zoneRiskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {zoneRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Model Accuracy */}
      <motion.div
        className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white">ML Model Performance</h3>
          <p className="text-sm text-gray-400">AI detection and prediction accuracy metrics</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {modelAccuracy.map((item, index) => (
              <motion.div
                key={item.metric}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">{item.metric}</span>
                  <span className="text-[#3B82F6]">{item.accuracy}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1E293B] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.accuracy}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Downloadable Reports */}
      <motion.div
        className="bg-[#1E293B] rounded-xl border border-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-white mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleDownloadReport('daily')}
            className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white justify-start h-auto py-4"
          >
            <div className="flex items-start gap-3 text-left">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Daily Report</p>
                <p className="text-xs text-gray-300 mt-1">Last 24 hours activity</p>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handleDownloadReport('weekly')}
            className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white justify-start h-auto py-4"
          >
            <div className="flex items-start gap-3 text-left">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Weekly Report</p>
                <p className="text-xs text-gray-300 mt-1">Last 7 days summary</p>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => handleDownloadReport('monthly')}
            className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white justify-start h-auto py-4"
          >
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

