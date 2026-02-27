import { useEffect } from 'react';
import L from 'leaflet';
import { AlertTriangle, CheckCircle2, Clock3, Flame, Wind } from 'lucide-react';
import { Circle, MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEnvironmentalDataContext } from '@/layer1/EnvironmentalDataContext';

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'N/A';
  }

  return new Date(timestamp).toLocaleString();
}

function getZoneStyle(riskLevel = 'Low') {
  const normalized = String(riskLevel).toLowerCase();

  if (normalized === 'critical') {
    return {
      fillColor: '#7F1D1D',
      fillOpacity: 0.3,
      weight: 3.5,
      color: '#DC2626',
      className: 'zone-risk-critical',
    };
  }

  if (normalized === 'high') {
    return {
      fillColor: '#9A3412',
      fillOpacity: 0.25,
      weight: 3,
      color: '#EA580C',
      className: 'zone-risk-high',
    };
  }

  if (normalized === 'moderate') {
    return {
      fillColor: '#B45309',
      fillOpacity: 0.22,
      weight: 2.8,
      color: '#F59E0B',
      className: 'zone-risk-moderate',
    };
  }

  return {
    fillColor: '#2563EB',
    fillOpacity: 0.16,
    weight: 2.5,
    color: '#3B82F6',
    className: 'zone-risk-low',
  };
}

function ViewportSync({ activeForest, monitoringMode, location }) {
  const map = useMap();

  useEffect(() => {
    if (monitoringMode === 'forest' && activeForest) {
      map.setView([activeForest.center.lat, activeForest.center.lng], 7);
      map.fitBounds(activeForest.bounds, { padding: [40, 40] });
      return;
    }

    if (monitoringMode === 'live' && location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 10);
    }
  }, [map, activeForest, monitoringMode, location?.lat, location?.lon]);

  return null;
}

function getForestMarkerIcon(priority = 'Medium') {
  const color = priority === 'High' ? '#F59E0B' : '#3B82F6';

  return L.divIcon({
    className: 'forest-center-marker',
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};box-shadow:0 0 0 6px rgba(15,23,42,0.5),0 0 18px ${color};border:2px solid rgba(226,232,240,0.9);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function SatelliteMap() {
  const { monitoringMode, activeForest, activeCommunityLocation, location, data, riskData, loading, refreshing, error, refreshData } = useEnvironmentalDataContext();

  const riskStyle = getZoneStyle(riskData?.riskLevel || 'Low');
  const lastUpdated = data?.createdAt || riskData?.createdAt || null;

  const tileLayer = monitoringMode === 'forest'
    ? {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      }
    : {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
      };

  if (monitoringMode === 'forest' && !activeForest) {
    return (
      <div className="p-6 bg-[#0B1220] min-h-full text-[#E5E7EB]">
        <div className="rounded-2xl border border-slate-700/50 bg-[#111827] p-6">
          <p className="text-lg">No active forest selected.</p>
          <p className="text-sm text-slate-400 mt-2">Please select a forest from Live Feed.</p>
        </div>
      </div>
    );
  }

  const initialCenter = monitoringMode === 'forest' && activeForest
    ? [activeForest.center.lat, activeForest.center.lng]
    : [location?.lat ?? 20.5937, location?.lon ?? 78.9629];

  return (
    <div className="p-6 space-y-5 bg-[#0B1220] min-h-full text-[#E5E7EB]">
      <div className="rounded-2xl border border-slate-700/50 bg-[#111827] p-5 flex flex-wrap items-center justify-between gap-4 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.85)]">
        <div>
          <h2 className="text-2xl font-semibold">Satellite Monitoring</h2>
          <p className="text-sm text-slate-400">
            Currently Monitoring:{' '}
            {monitoringMode === 'forest' && activeForest
              ? `${activeForest.name} (${activeForest.country})`
              : activeCommunityLocation?.name || 'Community Geolocation'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshData()}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 transition-colors"
          disabled={loading || refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? <div className="rounded-xl border border-[#DC2626]/50 bg-[#DC2626]/10 p-3 text-sm text-[#FCA5A5]">{error}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-[1.9fr_1fr] gap-5">
        <div className="rounded-2xl border border-slate-700/50 overflow-hidden bg-[#111827]">
          <div className="h-[70vh] min-h-[500px]">
            <MapContainer center={initialCenter} zoom={7} scrollWheelZoom className="h-full w-full">
              <ViewportSync activeForest={activeForest} monitoringMode={monitoringMode} location={location} />
              <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />

              {monitoringMode === 'forest' && activeForest ? (
                <>
                  <Rectangle bounds={activeForest.bounds} pathOptions={{ ...riskStyle, className: `${riskStyle.className} shadow-[0_0_20px_rgba(59,130,246,0.6)]` }} />

                  <Marker position={[activeForest.center.lat, activeForest.center.lng]} icon={getForestMarkerIcon(activeForest.priority)}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{activeForest.name}</p>
                        <p>Country: {activeForest.country}</p>
                        <p>Biome: {activeForest.biome}</p>
                        <p>Priority: {activeForest.priority}</p>
                      </div>
                    </Popup>
                  </Marker>
                </>
              ) : null}

              {monitoringMode === 'live' && location?.lat && location?.lon ? (
                <>
                  <Circle
                    center={[location.lat, location.lon]}
                    radius={5000}
                    pathOptions={{
                      color: '#f59e0b',
                      fillColor: '#f59e0b',
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  />
                  <Marker
                    position={[location.lat, location.lon]}
                    icon={L.divIcon({
                      className: 'community-center-marker',
                      html: '<div style="width:14px;height:14px;border-radius:9999px;background:#f59e0b;box-shadow:0 0 0 6px rgba(15,23,42,0.5),0 0 18px rgba(245,158,11,0.85);border:2px solid rgba(226,232,240,0.9);"></div>',
                      iconSize: [14, 14],
                      iconAnchor: [7, 7],
                    })}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{location?.name || 'Selected City'}</p>
                        <p>Coordinates: {location.lat}, {location.lon}</p>
                        <p>Monitoring Active</p>
                      </div>
                    </Popup>
                  </Marker>
                </>
              ) : null}
            </MapContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[#111827] p-5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.85)]">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Zone Intelligence</p>

          {monitoringMode === 'forest' && activeForest ? (
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-400">Forest:</span> {activeForest.name}</p>
              <p><span className="text-slate-400">Country:</span> {activeForest.country}</p>
              <p><span className="text-slate-400">Biome:</span> {activeForest.biome}</p>
              <p><span className="text-slate-400">Priority:</span> {activeForest.priority}</p>
              <p><span className="text-slate-400">Coordinates:</span> {activeForest.center.lat}, {activeForest.center.lng}</p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/15 px-3 py-1 text-xs text-[#6EE7B7]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Monitoring Active
              </div>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Risk Level</span>
                  <span className="rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-xs text-[#FCD34D]">{riskData?.riskLevel || '--'}</span>
                </div>
                <p className="mt-2 text-sm">Risk Score: {riskData?.riskScore ?? '--'}</p>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2"><Flame className="h-4 w-4 text-[#F59E0B]" /> Temperature: {data?.temperature ?? '--'} deg C</p>
                <p className="flex items-center gap-2"><Wind className="h-4 w-4 text-[#60A5FA]" /> Wind Speed: {data?.windSpeed ?? '--'} km/h</p>
                <p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#FB923C]" /> Dryness Index: {data?.drynessIndex ?? '--'}</p>
                <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" /> Last Updated: {formatTimestamp(lastUpdated)}</p>
              </div>
            </div>
          ) : monitoringMode === 'live' && location?.lat && location?.lon ? (
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-400">City:</span> {location?.name || 'Selected Location'}</p>
              <p><span className="text-slate-400">Coordinates:</span> {location.lat}, {location.lon}</p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/15 px-3 py-1 text-xs text-[#fcd34d]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Monitoring Active
              </div>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Risk Level</span>
                  <span className="rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-xs text-[#FCD34D]">{riskData?.riskLevel || '--'}</span>
                </div>
                <p className="mt-2 text-sm">Risk Score: {riskData?.riskScore ?? '--'}</p>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2"><Flame className="h-4 w-4 text-[#F59E0B]" /> Temperature: {data?.temperature ?? '--'} deg C</p>
                <p className="flex items-center gap-2"><Wind className="h-4 w-4 text-[#60A5FA]" /> Wind Speed: {data?.windSpeed ?? '--'} km/h</p>
                <p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#FB923C]" /> Dryness Index: {data?.drynessIndex ?? '--'}</p>
                <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" /> Last Updated: {formatTimestamp(lastUpdated)}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
              No active location selected.
              <p className="mt-1 text-slate-400">Enable geolocation or search a city to start community monitoring.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { getZoneStyle };
