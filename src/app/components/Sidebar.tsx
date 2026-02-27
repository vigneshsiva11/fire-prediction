import { motion } from 'motion/react';
import { Map, BarChart3, Radio, Flame, Bell, Settings, ChevronLeft, ChevronRight, Lock, Radar } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: 'admin' | 'user';
}

const menuItems = [
  { id: 'dashboard', label: 'Live Feed', icon: Map, allowedRoles: ['admin', 'user'] },
  { id: 'satellite-monitoring', label: 'Satellite Monitoring', icon: Radar, allowedRoles: ['admin', 'user'] },
  { id: 'risk-analysis', label: 'Risk Analysis', icon: BarChart3, allowedRoles: ['admin', 'user'] },
  { id: 'drone', label: 'Drone Monitoring', icon: Radio, allowedRoles: ['admin'] },
  { id: 'fire-prediction', label: 'Fire Prediction', icon: Flame, allowedRoles: ['admin', 'user'] },
  { id: 'alerts', label: 'Alerts', icon: Bell, allowedRoles: ['admin', 'user'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, allowedRoles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, allowedRoles: ['admin'] },
];

export function Sidebar({ currentPage, onNavigate, userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAccessible = (item: typeof menuItems[0]) => {
    return item.allowedRoles.includes(userRole);
  };

  return (
    <motion.div
      className="relative h-full border-r border-slate-600/25 bg-[#0f172a]/95 backdrop-blur-md"
      initial={{ width: 224 }}
      animate={{ width: isCollapsed ? 76 : 224 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 z-10 rounded-full border border-slate-500/35 bg-[#111827] p-1 text-slate-100 transition-colors hover:bg-[#1f2937]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </motion.button>

      <div className="mt-16 space-y-1.5 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const accessible = isAccessible(item);

          return (
            <motion.button
              key={item.id}
              onClick={() => accessible && onNavigate(item.id)}
              className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                !accessible
                  ? 'cursor-not-allowed text-slate-500 opacity-40'
                  : isActive
                    ? 'bg-[#1d4ed8] text-slate-100 shadow-[0_12px_24px_-20px_rgba(59,130,246,0.95)]'
                    : 'text-slate-300 hover:bg-[#111827] hover:text-slate-100'
              }`}
              whileHover={accessible ? { x: 2 } : {}}
              whileTap={accessible ? { scale: 0.992 } : {}}
              disabled={!accessible}
              title={!accessible ? 'Admin access only' : ''}
            >
              <Icon className={`${isCollapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]'} shrink-0`} />
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 text-left text-[13px]">
                  {item.label}
                </motion.span>
              )}
              {!accessible && !isCollapsed && <Lock className="h-3 w-3 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {!isCollapsed && (
        <motion.div
          className="absolute bottom-5 left-3 right-3 rounded-xl border border-slate-500/30 bg-slate-800/40 p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Access Level</p>
          <p className="text-sm font-semibold capitalize text-slate-100">{userRole === 'admin' ? 'Administrator' : 'User (Limited)'}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

