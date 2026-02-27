import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, User, LogOut, Shield, Waves, Sparkles, LocateFixed, AlertCircle, Search } from 'lucide-react';
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

interface CommunityLocation {
  name: string;
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
  activeCommunityLocation: CommunityLocation | null;
  locationLoading: boolean;
  citySearchLoading: boolean;
  locationPermissionDenied: boolean;
  locationPermissionError: string;
  onCommunityCitySearch: (cityQuery: string) => Promise<void>;
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
  activeCommunityLocation,
  locationLoading,
  citySearchLoading,
  locationPermissionDenied,
  locationPermissionError,
  onCommunityCitySearch,
}: TopNavProps) {
  const [cityQuery, setCityQuery] = useState('');

  const handleCitySearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCommunityCitySearch(cityQuery);
  };

  return (
    <div className="relative z-40 border-b border-slate-600/20 bg-[#0f172a]/90 backdrop-blur-md">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-2 min-h-14">
          <div className="flex items-center gap-1.5">
            <motion.div className="flex items-center gap-1.5" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <Waves className="w-5 h-5 text-[#3B82F6]" />
              </motion.div>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              </motion.div>
            </motion.div>
            <div>
              <h2 className="text-base text-slate-100 font-semibold leading-tight">FireGuard AI</h2>
              <p className="text-xs text-slate-400">Environmental Intelligence Console</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-600/25 bg-slate-800/55 px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => onMonitoringModeChange('forest')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
                monitoringMode === 'forest' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Forest
            </button>
            <button
              type="button"
              onClick={() => onMonitoringModeChange('live')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
                monitoringMode === 'live' ? 'bg-[#F59E0B] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Community
            </button>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/8 px-3 py-1"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div className="saas-live-dot h-2 w-2 rounded-full bg-[#3B82F6]" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-xs text-slate-100">Live Ingestion Active</span>
            </motion.div>

            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-600/30 bg-slate-800/55 px-2.5 py-1">
              <Shield className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs text-slate-100 capitalize">{userRole}</span>
            </div>

            <div className="hidden xl:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-[#3B82F6] to-[#1d4ed8] rounded-full flex items-center justify-center border border-[#93c5fd]/40">
                  <User className="w-3.5 h-3.5 text-[#eff6ff]" />
                </div>
                <span className="text-sm text-slate-100">Operations Admin</span>
              </div>
              <span className="text-[11px] text-slate-400">Last Login: {formatLastLogin(lastLogin)}</span>
            </div>

            <Button onClick={onLogout} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700/70">
              <LogOut className="w-4 h-4" />
            </Button>
            <Sparkles className="hidden xl:block w-4 h-4 text-[#F59E0B]" />
          </div>
        </div>
      </div>

      <div className="relative z-50 border-t border-slate-800/70 px-6 py-1">
        <div className="mb-1.5 flex w-fit items-center gap-1.5 rounded-full border border-slate-600/25 bg-slate-800/60 px-1.5 py-0.5 md:hidden">
          <button
            type="button"
            onClick={() => onMonitoringModeChange('forest')}
            className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
              monitoringMode === 'forest' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Forest
          </button>
          <button
            type="button"
            onClick={() => onMonitoringModeChange('live')}
            className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${
              monitoringMode === 'live' ? 'bg-[#F59E0B] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Community
          </button>
        </div>

        <div className="max-w-md">
          {monitoringMode === 'forest' ? (
            <ForestSelector forests={forests} activeForest={activeForest} onSelect={onForestSelect} />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
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
                <span className="text-xs text-slate-400">{activeCommunityLocation ? `Monitoring: ${activeCommunityLocation.name}` : 'Awaiting geolocation'}</span>
              </div>

              {locationPermissionDenied ? (
                <form onSubmit={handleCitySearchSubmit} className="flex w-[280px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    placeholder="Enter city name (e.g., Mumbai, London)"
                    className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    aria-label="Search city"
                  />
                  <Button type="submit" size="sm" className="h-7 px-2" disabled={citySearchLoading}>
                    {citySearchLoading ? '...' : 'Go'}
                  </Button>
                </form>
              ) : null}

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
    </div>
  );
}
