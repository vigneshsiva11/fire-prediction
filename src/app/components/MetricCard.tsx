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
      className="saas-surface saas-surface-hover p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="rounded-xl p-2.5"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${
            trend.startsWith('+') ? 'bg-[#3B82F6]/20 text-[#93C5FD]' : 'bg-[#EF4444]/20 text-[#FCA5A5]'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="mb-1 text-xl text-white">{value}</h3>
      <p className="text-sm text-slate-400">{title}</p>
    </motion.div>
  );
}

