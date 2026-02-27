import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EnvironmentalStatusPanel } from '@/layer1/EnvironmentalStatusPanel';
import { useEnvironmentalDataContext } from '@/layer1/EnvironmentalDataContext';

interface DashboardProps {
  userRole: 'admin' | 'user';
}

interface TimelinePoint {
  time: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
}

function formatTime(isoTimestamp: string) {
  return new Date(isoTimestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function Dashboard({ userRole }: DashboardProps) {
  const { history, historyLoading, historyError, zoneInfo, monitoringMode } = useEnvironmentalDataContext();

  const timeline = useMemo<TimelinePoint[]>(() => {
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }

    return [...history].reverse().map((point) => ({
      time: formatTime(point.createdAt),
      temperature: point.temperature ?? null,
      humidity: point.humidity ?? null,
      windSpeed: point.windSpeed ?? null,
    }));
  }, [history]);

  const summary = useMemo(
    () => [
      { label: 'Role', value: userRole === 'admin' ? 'Administrator' : 'User', tone: 'bg-[#3B82F6]/20 text-[#93C5FD]' },
      {
        label: 'Monitoring Mode',
        value: monitoringMode === 'forest' ? 'Forest Monitoring' : 'Community Monitoring',
        tone: 'bg-[#F59E0B]/20 text-[#FBBF24]',
      },
      { label: 'Active Zone', value: zoneInfo?.name || 'Community Live Location', tone: 'bg-[#EF4444]/20 text-[#FCA5A5]' },
    ],
    [userRole, monitoringMode, zoneInfo?.name],
  );

  return (
    <div className="saas-page">
      <div className="space-y-6">
        <motion.div className="grid grid-cols-1 gap-4 lg:grid-cols-3" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          {summary.map((item, index) => (
            <motion.div
              key={item.label}
              className="saas-surface saas-surface-hover p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <p className="saas-label">{item.label}</p>
              <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm ${item.tone}`}>{item.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <EnvironmentalStatusPanel />

        <motion.section
          className="saas-surface p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-100">Historical Environmental Trend</h3>
            <p className="text-sm text-slate-400">Last 20 records from the backend history endpoint.</p>
          </div>

          <div className="h-[320px] rounded-2xl border border-slate-500/20 bg-[#0b1220]/80 p-3">
            {historyLoading ? <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading historical trend data...</div> : null}

            {!historyLoading && historyError ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 p-4 text-sm text-[#fca5a5]">{historyError}</div>
            ) : null}

            {!historyLoading && !historyError && timeline.length < 2 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Not enough historical records to render chart data.</div>
            ) : null}

            {!historyLoading && !historyError && timeline.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="humFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="time" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      background: '#1E293B',
                      border: '1px solid rgba(148,163,184,0.25)',
                      borderRadius: '12px',
                      color: '#E2E8F0',
                    }}
                  />
                  <Area type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={2} fill="url(#tempFill)" name="Temperature (deg C)" />
                  <Area type="monotone" dataKey="humidity" stroke="#F59E0B" strokeWidth={2} fill="url(#humFill)" name="Humidity (%)" />
                  <Area type="monotone" dataKey="windSpeed" stroke="#EF4444" strokeWidth={2} fill="none" name="Wind Speed (km/h)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
