import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  delay?: number;
}

export function MetricCard({ title, value, icon: Icon, color, trend, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      className="bg-[#1E293B] rounded-2xl p-6 border border-slate-500/20 hover:border-slate-400/40 transition-all shadow-[0_16px_40px_-30px_rgba(15,23,42,0.95)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded ${
            trend.startsWith('+') ? 'bg-[#3B82F6]/20 text-[#93C5FD]' : 'bg-[#EF4444]/20 text-[#FCA5A5]'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </motion.div>
  );
}

