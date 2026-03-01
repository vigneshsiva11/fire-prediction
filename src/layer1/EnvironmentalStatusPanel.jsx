import { motion } from 'motion/react';
import { Activity, AlertTriangle, Cloud, Droplets, Gauge, RefreshCcw, Thermometer, Wind } from 'lucide-react';
import { useEnvironmentalDataContext } from '@/layer1/EnvironmentalDataContext';
import { Button } from '@/app/components/ui/button';
import { useMonitoringContext } from '@/context/MonitoringContext';
import { calculateFireIntelligence } from '@/utils/firePredictionEngine';

const INFO_MESSAGES = new Set([
  'Select a forest zone to begin monitoring.',
  'Location permission required for community monitoring.',
  'Allow location access or search a city to start community monitoring.',
]);

function MetricItem({ icon: Icon, label, value, unit }) {
  return (
    <div className="saas-surface saas-surface-hover p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4 text-[#60a5fa]" />
        <span className="text-xs tracking-wide uppercase">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-slate-100">
        {value ?? '--'}
        {value !== null && value !== undefined && unit ? <span className="ml-1 text-sm text-slate-400">{unit}</span> : null}
      </p>
    </div>
  );
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'N/A';
  }

  return new Date(timestamp).toLocaleString();
}

export function EnvironmentalStatusPanel() {
  const { data, riskData, loading, refreshing, error, zoneInfo, monitoringMode, refreshData, location, communityStatus } = useEnvironmentalDataContext();
  const { aiInsights } = useMonitoringContext();

  const intelligence = aiInsights || calculateFireIntelligence(data);
  const resolvedRiskScore = intelligence?.riskScore ?? riskData?.riskScore;
  const resolvedRiskLevel = intelligence?.riskLevel ?? riskData?.riskLevel;
  const resolvedRecommendation = intelligence?.recommendations?.[0] ?? riskData?.recommendedAction;
  const resolvedExplanation = intelligence?.explanation ?? riskData?.explanation;

  const lastUpdated = data?.createdAt || data?.timestamp;
  const isInfoMessage = error && INFO_MESSAGES.has(error);

  return (
    <section id="live-feed-panel" className="saas-surface p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="saas-label">Layer 1</p>
          <h2 className="text-2xl font-semibold text-slate-100">Backend Environmental Feed</h2>
          <p className="mt-1 text-sm text-slate-400">
            {monitoringMode === 'forest'
              ? `Mode: Forest Monitoring | Forest: ${zoneInfo?.name || '--'} | Country: ${zoneInfo?.country || '--'}`
              : `Mode: Community Monitoring | Location: ${location?.name || '--'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1.5 text-xs text-[#bfdbfe]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="saas-live-dot relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
            </span>
            Live Ingestion Active
          </motion.div>

          <Button
            type="button"
            variant="outline"
            className="border-slate-500/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/80"
            onClick={refreshData}
            disabled={loading || refreshing}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-600/30 bg-[#0b1220]/70 p-4 text-sm text-slate-300">Fetching data from backend API...</div> : null}

      {error ? (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm ${
            isInfoMessage ? 'border-slate-600/40 bg-slate-900/40 text-slate-300' : 'border-[#ef4444]/40 bg-[#ef4444]/10 text-[#fca5a5]'
          }`}
        >
          {error}
        </div>
      ) : null}

      {monitoringMode === 'live' && communityStatus?.permissionDenied ? (
        <div className="mb-5 rounded-2xl border border-slate-600/40 bg-slate-900/40 p-4 text-sm text-slate-300">
          Location permission denied. You can manually enter a city to monitor.
        </div>
      ) : null}

      {monitoringMode === 'live' && location?.name ? (
        <div className="mb-5 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm text-[#bfdbfe]">
          Monitoring: {location.name}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricItem icon={Thermometer} label="Temperature" value={data?.temperature} unit="deg C" />
        <MetricItem icon={Droplets} label="Humidity" value={data?.humidity} unit="%" />
        <MetricItem icon={Wind} label="Wind Speed" value={data?.windSpeed} unit="km/h" />
        <MetricItem icon={Activity} label="Dryness Index" value={data?.drynessIndex} unit="pts" />
        <MetricItem icon={Gauge} label="Heat Index" value={data?.heatIndex} unit="deg C" />
        <MetricItem icon={Cloud} label="Weather" value={data?.weatherDescription ? data.weatherDescription.replace(/\b\w/g, (char) => char.toUpperCase()) : '--'} unit="" />
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-500/20 bg-[#0b1220]/70 p-4 text-sm text-slate-300 md:grid-cols-2">
        <span>Last Updated: {formatTimestamp(lastUpdated)}</span>
        <span>Risk Score: {resolvedRiskScore ?? '--'}</span>
        <span>Risk Level: {resolvedRiskLevel ?? '--'}</span>
        <span>Recommended Action: {resolvedRecommendation ?? '--'}</span>
      </div>

      {resolvedExplanation ? (
        <div className="mt-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-3 text-sm text-[#fde68a] flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{resolvedExplanation}</span>
        </div>
      ) : null}
    </section>
  );
}
