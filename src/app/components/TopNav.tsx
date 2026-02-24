import { motion } from 'motion/react';
import { Flame, User, LogOut, Shield, Waves, Sparkles, LocateFixed, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ForestSelector } from '@/app/components/ForestSelector';

type UserRole = 'admin';
type MonitoringMode = 'forest' | 'live';

interface Forest {
  id: string;
  name: string;
  country: string;
  biome: string;
  priority: string;
}

interface LiveCoordinates {
  lat: number;
  lon: number;
}

interface TopNavProps {
  onLogout: () => void;
  userRole: UserRole;
  lastLogin: string | null;
  monitoringMode: MonitoringMode;
  onMonitoringModeChange: (mode: MonitoringMode) => void;
  forests: Forest[];
  activeForest: Forest;
  onForestSelect: (forest: Forest) => void;
  onRequestLiveLocation: () => void;
  liveCoordinates: LiveCoordinates | null;
  locationLoading: boolean;
  locationPermissionError: string;
}

function formatLastLogin(lastLogin: string | null) {
  if (!lastLogin) {
    return 'First successful login';
  }

  return new Date(lastLogin).toLocaleString();
}

export function TopNav({
  onLogout,
  userRole,
  lastLogin,
  monitoringMode,
  onMonitoringModeChange,
  forests,
  activeForest,
  onForestSelect,
  onRequestLiveLocation,
  liveCoordinates,
  locationLoading,
  locationPermissionError,
}: TopNavProps) {
  return (
    <div className="border-b border-slate-600/30 bg-[#111b32]/95 px-6 py-3 backdrop-blur-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Waves className="w-7 h-7 text-[#3B82F6]" />
          </motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Flame className="w-5 h-5 text-[#F59E0B]" />
          </motion.div>
        </motion.div>
        <div>
          <h2 className="text-xl text-slate-100 font-semibold leading-tight">FireGuard AI</h2>
          <p className="text-sm text-slate-400">Environmental Intelligence Console</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center rounded-2xl border border-slate-600/40 bg-slate-900/50 px-4 py-3">
          <div className="mt-3 flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onMonitoringModeChange('forest')}
              className={`min-w-[170px] rounded-xl px-6 py-2.5 text-base transition-all duration-200 ${
                monitoringMode === 'forest' ? 'bg-[#3B82F6] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Forest Monitoring
            </button>
            <button
              type="button"
              onClick={() => onMonitoringModeChange('live')}
              className={`min-w-[170px] rounded-xl px-6 py-2.5 text-base transition-all duration-200 ${
                monitoringMode === 'live' ? 'bg-[#F59E0B] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Community Monitoring
            </button>
          </div>

          {monitoringMode === 'forest' ? (
            <div className="mt-3">
              <ForestSelector forests={forests} activeForest={activeForest} onSelect={onForestSelect} />
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRequestLiveLocation}
                  disabled={locationLoading}
                  className="h-8 border-slate-600/60 bg-slate-800 text-slate-100"
                >
                  <LocateFixed className={`mr-1 h-3.5 w-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
                  {locationLoading ? 'Locating...' : 'Refresh Location'}
                </Button>
                <span className="text-xs text-slate-400">
                  {liveCoordinates ? `Live: ${liveCoordinates.lat}, ${liveCoordinates.lon}` : 'Awaiting geolocation'}
                </span>
              </div>
              {locationPermissionError ? (
                <span className="text-[11px] text-[#fca5a5] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {locationPermissionError}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div className="w-2 h-2 bg-[#3B82F6] rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs text-slate-100">Live Ingestion Active</span>
        </motion.div>

        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-800/70 px-3 py-2">
          <Shield className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs text-slate-100 capitalize">{userRole}</span>
        </div>

        <div className="hidden xl:flex flex-col items-end">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#1d4ed8] rounded-full flex items-center justify-center border border-[#93c5fd]/40">
              <User className="w-4 h-4 text-[#eff6ff]" />
            </div>
            <span className="text-sm text-slate-100">Operations Admin</span>
          </div>
          <span className="text-[11px] text-slate-400">Last Login: {formatLastLogin(lastLogin)}</span>
        </div>

        <Button onClick={onLogout} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/70">
          <LogOut className="w-5 h-5" />
        </Button>
        <Sparkles className="hidden xl:block w-4 h-4 text-[#F59E0B]" />
      </div>
    </div>
  );
}
