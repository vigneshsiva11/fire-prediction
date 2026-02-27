import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import L from 'leaflet';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { TrendingUp, AlertTriangle, Wind, Droplets, Thermometer, Leaf } from 'lucide-react';
import { MetricCard } from '@/app/components/MetricCard';
import { useMonitoringContext } from '@/context/MonitoringContext';
import { calculateRisk } from '@/utils/riskEngine';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPercent(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return clamp((value / max) * 100, 0, 100);
}

function buildDroneIcon(color: string) {
  return L.divIcon({
    className: 'risk-drone-marker',
    html: `<div style="width:12px;height:12px;border-radius:9999px;background:${color};box-shadow:0 0 0 5px rgba(15,23,42,0.5),0 0 14px ${color};border:2px solid rgba(226,232,240,0.95);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function MapViewport({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lon], zoom, { animate: true });
  }, [map, lat, lon, zoom]);

  return null;
}

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const duration = 450;
    const start = performance.now();
    const initialValue = displayValue;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = initialValue + (value - initialValue) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{displayValue.toFixed(decimals)}</>;
}

export function RiskAnalysis() {
  const { environmentalData, activeLocation, riskData, previousRiskScore, riskChange, refreshEnvironmentalData, activeDrones } = useMonitoringContext();

  const calculatedRisk = useMemo(() => calculateRisk(environmentalData), [environmentalData]);

  const dynamicRisk = useMemo(
    () => ({
      score: Number((riskData?.riskScore ?? riskData?.score ?? calculatedRisk.score ?? 0).toFixed(1)),
      level: riskData?.riskLevel || riskData?.level || calculatedRisk.level || 'N/A',
      recommendedAction: riskData?.recommendedAction || 'Continue monitoring environmental changes.',
    }),
    [riskData, calculatedRisk],
  );

  const riskColor =
    dynamicRisk.level === 'Critical'
      ? '#ef4444'
      : dynamicRisk.level === 'High'
        ? '#f97316'
        : dynamicRisk.level === 'Moderate'
          ? '#f59e0b'
          : '#3b82f6';

  const criticalZones = dynamicRisk.score > 85 ? 2 : dynamicRisk.score > 70 ? 1 : 0;
  const monitoredAreas = activeLocation?.type === 'forest' ? 5 : 1;
  const riskChangeValue = Number((riskChange ?? 0).toFixed(1));
  const riskChangeText = `${riskChangeValue >= 0 ? '+' : ''}${riskChangeValue}%`;
  const riskTrendColor = riskChangeValue > 0 ? '#FF4C4C' : '#10B981';
  const riskMapZoom = activeLocation?.type === 'forest' ? 9 : 14;
  const circleProgress = clamp(dynamicRisk.score, 0, 100);
  const circleCircumference = 2 * Math.PI * 38;
  const circleOffset = circleCircumference - (circleProgress / 100) * circleCircumference;

  const activeLocationDrones = useMemo(() => activeDrones.filter((drone: any) => drone.status === 'active'), [activeDrones]);

  const radarData = useMemo(
    () => [
      { factor: 'Temperature', value: toPercent(Number(environmentalData?.temperature ?? 0), 50), fullMark: 100 },
      { factor: 'Humidity', value: clamp(Number(environmentalData?.humidity ?? 0), 0, 100), fullMark: 100 },
      { factor: 'Wind Speed', value: toPercent(Number(environmentalData?.windSpeed ?? 0), 50), fullMark: 100 },
      { factor: 'Dryness', value: clamp(Number(environmentalData?.drynessIndex ?? 0), 0, 100), fullMark: 100 },
      { factor: 'Humidity Inv.', value: clamp(100 - Number(environmentalData?.humidity ?? 0), 0, 100), fullMark: 100 },
    ],
    [environmentalData],
  );

  const zoneComparison = useMemo(() => {
    const base = Number(dynamicRisk.score || 0);
    return [
      { zone: 'Zone A', risk: clamp(base, 0, 100) },
      { zone: 'Zone B', risk: clamp(base - Math.random() * 6, 0, 100) },
      { zone: 'Zone C', risk: clamp(base + Math.random() * 8, 0, 100) },
      { zone: 'Zone D', risk: clamp(base - Math.random() * 4, 0, 100) },
      { zone: 'Zone E', risk: clamp(base + Math.random() * 5, 0, 100) },
    ];
  }, [dynamicRisk.score]);

  useEffect(() => {
    if (activeLocation) {
      refreshEnvironmentalData(activeLocation);
    }
  }, [activeLocation?.id, activeLocation?.lat, activeLocation?.lon, refreshEnvironmentalData]);

  const temperature = Number(environmentalData?.temperature ?? 0);
  const humidity = Number(environmentalData?.humidity ?? 0);
  const windSpeed = Number(environmentalData?.windSpeed ?? 0);
  const drynessIndex = Number(environmentalData?.drynessIndex ?? 0);

  return (
    <div className="saas-page">
      <motion.div className="mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-2 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-[#f59e0b]" />
          <h2 className="text-slate-100">Risk Analysis Dashboard</h2>
          <span className="saas-live-dot text-xs text-emerald-400">Real-Time Monitoring</span>
        </div>
        <p className="text-sm text-slate-400">Live risk intelligence, drone coverage, and environmental drivers</p>
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div className="saas-surface saas-surface-hover p-5" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="saas-label">Risk Score</p>
            <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: `${riskColor}20`, color: riskColor }}>
              {dynamicRisk.level}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold text-slate-100">
                <CountUp value={dynamicRisk.score} decimals={1} />%
              </p>
              <p className="text-xs text-slate-400">Overall Risk Index</p>
            </div>
            <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
              <circle cx="46" cy="46" r="38" stroke="rgba(148,163,184,0.22)" strokeWidth="8" fill="transparent" />
              <circle
                cx="46"
                cy="46"
                r="38"
                stroke={riskColor}
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circleCircumference}
                strokeDashoffset={circleOffset}
                style={{ transition: 'stroke-dashoffset 450ms ease' }}
              />
            </svg>
          </div>
        </motion.div>

        <MetricCard title="Critical Zones" value={`${criticalZones}`} icon={AlertTriangle} color="#EF4444" delay={0.12} />
        <MetricCard title="Risk Delta" value={riskChangeText} icon={Wind} color={riskTrendColor} trend={riskChangeText} delay={0.18} />
        <MetricCard title="Monitored Areas" value={`${monitoredAreas}`} icon={Leaf} color="#3B82F6" delay={0.24} />
      </div>

      {dynamicRisk.level === 'Critical' ? (
        <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Critical fire risk detected. Escalate monitoring and response readiness for this location.
        </div>
      ) : null}

      <motion.div className="saas-surface mb-6 overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="border-b border-slate-500/20 p-4">
          <h3 className="text-slate-100">Active Drone Coverage</h3>
          <p className="text-sm text-slate-400">All active drones for the selected monitoring location</p>
        </div>

        {activeLocation ? (
          <div className="h-[320px] w-full">
            <MapContainer center={[activeLocation.lat, activeLocation.lon]} zoom={riskMapZoom} className="h-full w-full">
              <MapViewport lat={activeLocation.lat} lon={activeLocation.lon} zoom={riskMapZoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[activeLocation.lat, activeLocation.lon]} icon={buildDroneIcon('#3B82F6')}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{activeLocation.name}</p>
                    <p>Monitoring Location</p>
                  </div>
                </Popup>
              </Marker>
              {activeLocationDrones.map((drone: any) => (
                <Marker key={drone._id} position={[drone.lat, drone.lon]} icon={buildDroneIcon(drone.battery < 20 ? '#EF4444' : '#F59E0B')}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{drone.name}</p>
                      <p>Battery: {drone.battery}%</p>
                      <p>Signal: {drone.signal}%</p>
                      <p>Status: {drone.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="p-4 text-sm text-slate-400">Select a monitoring location to view drone coverage.</div>
        )}

        {activeLocation && activeLocationDrones.length === 0 ? (
          <div className="border-t border-slate-500/20 px-4 py-3 text-sm text-slate-400">No active drones for this location.</div>
        ) : null}
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div className="saas-surface overflow-hidden" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}>
          <div className="border-b border-slate-500/20 p-4">
            <h3 className="text-slate-100">Risk Contributing Factors</h3>
            <p className="text-sm text-slate-400">Normalized environmental signals</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.22)" />
                <PolarAngleAxis dataKey="factor" stroke="#94A3B8" />
                <PolarRadiusAxis stroke="#94A3B8" />
                <Radar name="Risk Level" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.28} strokeWidth={2} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(148,163,184,0.24)',
                    borderRadius: '12px',
                    color: '#E2E8F0',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="saas-surface overflow-hidden" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
          <div className="border-b border-slate-500/20 p-4">
            <h3 className="text-slate-100">Zone Comparison</h3>
            <p className="text-sm text-slate-400">Relative risk distribution</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={zoneComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="zone" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(148,163,184,0.24)',
                    borderRadius: '12px',
                    color: '#E2E8F0',
                  }}
                />
                <Bar dataKey="risk" fill="#3B82F6" radius={[8, 8, 0, 0]} animationDuration={650} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div className="saas-surface border-l-4 border-l-[#3B82F6] p-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          <h3 className="text-slate-100">{dynamicRisk.level} Assessment Summary</h3>
        </div>
        <p className="mb-3 text-sm leading-6 text-slate-300">
          Current conditions indicate <span className="font-semibold text-slate-100">{dynamicRisk.level.toUpperCase()}</span> fire risk with score{' '}
          <span className="font-semibold text-slate-100">{dynamicRisk.score}</span>. Temperature ({temperature.toFixed(1)} deg C), humidity ({humidity.toFixed(1)}%),
          wind speed ({windSpeed.toFixed(1)} km/h), and dryness ({drynessIndex.toFixed(1)}%) are being continuously evaluated.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-lg bg-slate-900/55 px-3 py-2">
            <span className="text-slate-400">Recommended Action:</span> <span className="text-slate-100">{dynamicRisk.recommendedAction}</span>
          </div>
          <div className="rounded-lg bg-slate-900/55 px-3 py-2">
            <span className="text-slate-400">Location:</span> <span className="text-slate-100">{activeLocation?.name || 'N/A'}</span>
          </div>
          <div className="rounded-lg bg-slate-900/55 px-3 py-2">
            <span className="text-slate-400">Previous Risk:</span> <span className="text-slate-100">{previousRiskScore ?? 'N/A'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
