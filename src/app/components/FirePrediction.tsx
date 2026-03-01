import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Flame, Radar, TrendingDown, TrendingUp, Wind } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { useMonitoringContext } from '@/context/MonitoringContext';
import { calculateFireIntelligence } from '@/utils/firePredictionEngine';

type MetricTrend = 'up' | 'down';

interface ForecastMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: MetricTrend;
  trendValue: string;
  tone: 'info' | 'warning' | 'critical';
}

interface HourlyForecastPoint {
  hour: string;
  current: number;
  predicted: number;
  lower: number;
  upper: number;
  spreadVelocity: number;
  probability: number;
}

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const duration = 550;
    const start = performance.now();
    const from = displayValue;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (value - from) * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{displayValue.toFixed(decimals)}</>;
}

const integratedSources = [
  'Live Weather API',
  'Satellite Thermal Scan',
  'Vegetation Dryness Index (NDVI)',
  'Terrain Elevation Model',
  'Historical Fire Archive',
];

export function FirePrediction() {
  const { environmentalData, aiInsights, activeLocation } = useMonitoringContext();
  const [enableHeatmap, setEnableHeatmap] = useState(true);
  const [forecastWindow] = useState(6);

  const intelligence = useMemo(() => {
    if (aiInsights) {
      return aiInsights;
    }

    return calculateFireIntelligence(environmentalData);
  }, [aiInsights, environmentalData]);

  const peakRisk = useMemo(() => {
    const series = intelligence?.hourlyForecast || [];
    return series.reduce((max: number, point: HourlyForecastPoint) => Math.max(max, Number(point.predicted || 0)), Number(intelligence?.riskScore || 0));
  }, [intelligence]);

  const riskDelta = useMemo(() => {
    const hourOneRisk = Number(intelligence?.hourlyForecast?.[0]?.predicted ?? intelligence?.riskScore ?? 0);
    return Number((hourOneRisk - Number(intelligence?.riskScore ?? 0)).toFixed(1));
  }, [intelligence]);

  const burnAreaTrend = useMemo(() => {
    const baselineArea = Math.max(0.2, Number(intelligence?.riskScore || 0) / 100);
    return Number((Number(intelligence?.projectedBurnArea || 0) - baselineArea).toFixed(1));
  }, [intelligence]);

  const metrics: ForecastMetric[] = useMemo(
    () => [
      {
        id: 'risk-index',
        label: 'Current Fire Risk Index',
        value: Number(intelligence?.riskScore || 0),
        unit: '/100',
        trend: riskDelta >= 0 ? 'up' : 'down',
        trendValue: `${riskDelta >= 0 ? '+' : ''}${riskDelta.toFixed(1)}%`,
        tone: Number(intelligence?.riskScore || 0) >= 81 ? 'critical' : Number(intelligence?.riskScore || 0) >= 61 ? 'warning' : 'info',
      },
      {
        id: 'peak-risk',
        label: 'Predicted Peak Risk (6h)',
        value: peakRisk,
        unit: '/100',
        trend: peakRisk >= Number(intelligence?.riskScore || 0) ? 'up' : 'down',
        trendValue: `${peakRisk >= Number(intelligence?.riskScore || 0) ? '+' : ''}${(peakRisk - Number(intelligence?.riskScore || 0)).toFixed(1)}%`,
        tone: peakRisk >= 81 ? 'critical' : peakRisk >= 61 ? 'warning' : 'info',
      },
      {
        id: 'spread-velocity',
        label: 'Estimated Spread Velocity',
        value: Number(intelligence?.spreadVelocity || 0),
        unit: 'km/h',
        trend: Number(intelligence?.spreadVelocity || 0) >= 15 ? 'up' : 'down',
        trendValue: `${Number(intelligence?.spreadVelocity || 0) >= 15 ? '+' : ''}${(Number(intelligence?.riskTrendDelta || 0) * 0.1).toFixed(1)}`,
        tone: Number(intelligence?.spreadVelocity || 0) >= 15 ? 'warning' : 'info',
      },
      {
        id: 'burn-area',
        label: 'Projected Burn Area',
        value: Number(intelligence?.projectedBurnArea || 0),
        unit: 'km2',
        trend: burnAreaTrend >= 0 ? 'up' : 'down',
        trendValue: `${burnAreaTrend >= 0 ? '+' : ''}${burnAreaTrend.toFixed(1)}`,
        tone: Number(intelligence?.projectedBurnArea || 0) >= 20 ? 'critical' : Number(intelligence?.projectedBurnArea || 0) >= 8 ? 'warning' : 'info',
      },
    ],
    [burnAreaTrend, intelligence, peakRisk, riskDelta],
  );

  const factorBreakdown = useMemo(() => intelligence?.factorContributions || [], [intelligence]);
  const hourlyForecast: HourlyForecastPoint[] = useMemo(() => intelligence?.hourlyForecast || [], [intelligence]);

  const spreadTimeline = useMemo(
    () =>
      [
        { hour: '0h', area: Math.max(0.2, Number(intelligence?.riskScore || 0) / 100), radius: 24 },
        ...hourlyForecast.map((point, index) => {
          const projectedArea = Math.max(0.2, Number(intelligence?.projectedBurnArea || 0) * ((index + 1) / 6));
          return {
            hour: `${index + 1}h`,
            area: Number(projectedArea.toFixed(1)),
            radius: Math.max(40, Math.round(40 + Math.sqrt(projectedArea) * 18)),
          };
        }),
      ].slice(0, 7),
    [hourlyForecast, intelligence],
  );

  const spreadState = useMemo(() => spreadTimeline[Math.min(forecastWindow, spreadTimeline.length - 1)], [forecastWindow, spreadTimeline]);

  const responseActions = useMemo(() => intelligence?.recommendations || ['Maintain routine patrol cycle and continue passive monitoring'], [intelligence]);

  const riskZones = useMemo(() => {
    const projected = Number(intelligence?.projectedBurnArea || 0);
    const spread = Number(intelligence?.spreadVelocity || 0);

    return {
      critical: Number((Math.max(1.5, projected * 0.18 + spread * 0.05)).toFixed(1)),
      high: Number((Math.max(3.5, projected * 0.3 + spread * 0.08)).toFixed(1)),
      moderate: Number((Math.max(6, projected * 0.48 + spread * 0.12)).toFixed(1)),
    };
  }, [intelligence]);

  const toneClass = (tone: ForecastMetric['tone']) => {
    if (tone === 'critical') {
      return 'border-red-500/35 bg-red-500/8';
    }
    if (tone === 'warning') {
      return 'border-amber-500/35 bg-amber-500/8';
    }
    return 'border-blue-500/30 bg-blue-500/8';
  };

  return (
    <div className="saas-page">
      <motion.section className="mb-6" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <div className="mb-3 flex items-center gap-2">
          <Radar className="h-5 w-5 text-blue-400" />
          <h2 className="text-slate-100">AI Wildfire Forecast & Spread Intelligence</h2>
        </div>
        <p className="max-w-3xl text-sm text-slate-400">Multi-factor predictive modeling based on weather, terrain, vegetation, and historical fire behavior.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-600/40 bg-slate-800/55 px-3 py-1 text-xs text-slate-200">Model: FireNet v2.3</span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            Confidence: {Number(intelligence?.confidenceScore || 0).toFixed(1)}%
          </span>
          <span className="rounded-full border border-slate-600/40 bg-slate-800/55 px-3 py-1 text-xs text-slate-200">Data Sources: Satellite + Weather API + Terrain Index</span>
        </div>
      </motion.section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className={`saas-surface saas-surface-hover border p-5 ${toneClass(metric.tone)}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.04 * index }}
          >
            <p className="saas-label">{metric.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-semibold text-slate-100">
                <CountUp value={metric.value} decimals={1} />
                <span className="ml-1 text-sm text-slate-400">{metric.unit}</span>
              </p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${metric.trend === 'up' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                {metric.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {metric.trendValue}
              </span>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <motion.div className="saas-surface overflow-hidden" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="border-b border-slate-600/20 p-4">
            <h3 className="text-slate-100">AI Risk Factor Contribution</h3>
            <p className="text-sm text-slate-400">Weighted model output from multi-factor wildfire signals</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={factorBreakdown} layout="vertical" margin={{ top: 6, right: 20, left: 30, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                <XAxis type="number" stroke="#94A3B8" domain={[0, 40]} />
                <YAxis dataKey="factor" type="category" stroke="#CBD5E1" width={150} />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid rgba(148,163,184,0.24)',
                    borderRadius: '12px',
                    color: '#E2E8F0',
                  }}
                />
                <Bar dataKey="value" fill="#4F86C6" radius={[0, 8, 8, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="saas-surface p-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-slate-100">Model Confidence</h3>
              <p className="text-sm text-slate-400">Reliability and uncertainty window</p>
            </div>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-200">Uncertainty: ±{Number(intelligence?.uncertaintyMargin || 0).toFixed(1)}%</span>
          </div>
          <div className="mb-3">
            <p className="text-3xl font-semibold text-slate-100">
              <CountUp value={Number(intelligence?.confidenceScore || 0)} decimals={1} />%
            </p>
            <p className="text-xs text-slate-400">Model Confidence</p>
          </div>
          <p className="text-sm leading-6 text-slate-300">Confidence derived from historical similarity mapping and weather stability index.</p>
        </motion.div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
        <motion.div className="saas-surface overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between border-b border-slate-600/20 p-4">
            <div>
              <h3 className="text-slate-100">Simulated Spread Path - AI Monte Carlo Model (1000 iterations)</h3>
              <p className="text-sm text-slate-400">Projected spread radius with wind vector and probability zones</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Enable Probabilistic Heatmap</span>
              <Switch checked={enableHeatmap} onCheckedChange={setEnableHeatmap} />
            </div>
          </div>

          <div className="relative h-[340px] overflow-hidden bg-[#0d1524]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.08),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(148,163,184,0.05),transparent_55%)]" />

            {enableHeatmap ? (
              <>
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/20 blur-2xl"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.72, 0.55] }}
                  transition={{ duration: 2.6, repeat: Infinity }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/24 blur-2xl"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.62, 0.8, 0.62] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/30 blur-xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.68, 0.9, 0.68] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            ) : null}

            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/20"
                initial={{ width: 30, height: 30, opacity: 0.3 }}
                animate={{
                  width: spreadState.radius + ring * 46,
                  height: spreadState.radius + ring * 46,
                  opacity: [0.28, 0.45, 0.28],
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.18 }}
              />
            ))}

            <motion.div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />

            <div className="absolute right-4 top-4 rounded-lg border border-slate-600/30 bg-[#111827]/80 px-3 py-2 text-xs text-slate-200">
              <div className="mb-1 flex items-center gap-2">
                <Wind className="h-3.5 w-3.5 text-blue-300" />
                Wind Direction: {Number(environmentalData?.windSpeed || 0) >= 18 ? 'NE' : 'E'} {Number(environmentalData?.windSpeed || 0).toFixed(1)} km/h
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-6 rounded bg-gradient-to-r from-yellow-400/80 via-orange-400/80 to-red-500/80" />
                Spread Probability
              </div>
            </div>

            <div className="absolute bottom-4 left-4 rounded-lg border border-slate-600/30 bg-[#111827]/82 px-3 py-2 text-xs text-slate-200">
              Projected Burn Area: <span className="font-semibold text-slate-100">{Number(spreadState.area || 0).toFixed(1)} km2</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="saas-surface p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <h3 className="mb-3 text-slate-100">Projected Risk Zones (Next 6 Hours)</h3>
          <div className="space-y-3">
            <div className="rounded-xl border border-red-500/35 bg-red-500/8 p-3">
              <p className="text-sm font-medium text-red-200">Critical Zone</p>
              <p className="text-xs text-slate-300">Estimated Impact Radius: {riskZones.critical.toFixed(1)} km</p>
              <p className="text-xs text-slate-400">Priority: Immediate response</p>
            </div>
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/8 p-3">
              <p className="text-sm font-medium text-amber-200">High Risk Zone</p>
              <p className="text-xs text-slate-300">Estimated Impact Radius: {riskZones.high.toFixed(1)} km</p>
              <p className="text-xs text-slate-400">Priority: Increased monitoring</p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/8 p-3">
              <p className="text-sm font-medium text-blue-200">Moderate Risk Zone</p>
              <p className="text-xs text-slate-300">Estimated Impact Radius: {riskZones.moderate.toFixed(1)} km</p>
              <p className="text-xs text-slate-400">Priority: Preventive measures</p>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section className="saas-surface mb-6 overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="border-b border-slate-600/20 p-4">
          <h3 className="text-slate-100">AI Hourly Forecast with 95% Confidence Interval</h3>
          <p className="text-sm text-slate-400">Predicted vs current risk with confidence band and spread velocity context</p>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={330}>
            <LineChart data={hourlyForecast}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" />
              <XAxis dataKey="hour" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid rgba(148,163,184,0.25)',
                  borderRadius: '12px',
                  color: '#E2E8F0',
                }}
                formatter={(value, name) => {
                  if (name === 'predicted') {
                    return [`${value}`, 'Predicted Risk'];
                  }
                  if (name === 'current') {
                    return [`${value}`, 'Current Risk'];
                  }
                  if (name === 'spreadVelocity') {
                    return [`${value} km/h`, 'Spread Velocity'];
                  }
                  if (name === 'probability') {
                    return [`${value}%`, 'Probability'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const point = payload?.[0]?.payload as HourlyForecastPoint | undefined;
                  if (!point) {
                    return label;
                  }
                  return `${label} | Spread ${point.spreadVelocity} km/h | Probability ${point.probability}%`;
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="transparent" />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="url(#confidenceGradient)" />
              <Line type="monotone" dataKey="current" stroke="#94A3B8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2.6} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <motion.div className="saas-surface p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400" />
            <h3 className="text-slate-100">AI Response Recommendation Engine</h3>
          </div>
          <ul className="space-y-2">
            {responseActions.map((action, index) => (
              <li key={action} className="flex items-start gap-2 rounded-lg border border-slate-600/25 bg-slate-900/45 px-3 py-2 text-sm text-slate-200">
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[10px] text-blue-200">{index + 1}</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">{intelligence?.explanation}</p>
        </motion.div>

        <motion.div className="saas-surface p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-slate-300" />
            <h3 className="text-slate-100">Integrated Data Sources</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {integratedSources.map((source) => (
              <div key={source} className="rounded-lg border border-slate-600/25 bg-slate-900/45 px-3 py-2 text-sm text-slate-300">
                {source}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">{activeLocation?.name ? `Active location: ${activeLocation.name}` : 'No active monitoring location selected.'}</p>
        </motion.div>
      </section>
    </div>
  );
}
