import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Battery, Signal, Camera, MapPin, Thermometer, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useMonitoringContext } from '@/context/MonitoringContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function buildDroneIcon(color: string) {
  return L.divIcon({
    className: 'drone-map-marker',
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};box-shadow:0 0 0 6px rgba(15,23,42,0.55),0 0 16px ${color};border:2px solid rgba(226,232,240,0.95);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

interface DroneCapture {
  _id: string;
  location: string;
  droneId: string;
  droneName?: string;
  imageBase64: string;
  createdAt: string;
}

function MapViewport({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lon], zoom, { animate: true });
  }, [map, lat, lon, zoom]);

  return null;
}

async function parseResponse(response: Response, fallbackMessage: string) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function DroneMonitoring() {
  const {
    activeLocation,
    environmentalData,
    availableDrones,
    activeDrones,
    droneLoading,
    droneError,
    loadDrones,
    activateDrone,
    stopDrone,
  } = useMonitoringContext();

  const [captures, setCaptures] = useState<DroneCapture[]>([]);
  const [selectedCapture, setSelectedCapture] = useState<DroneCapture | null>(null);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [error, setError] = useState('');

  const zoom = activeLocation?.type === 'forest' ? 9 : 14;
  const activeLocationName = activeLocation?.name || '';

  const activeLocationDrones = useMemo(
    () => activeDrones.filter((drone: any) => drone.status === 'active'),
    [activeDrones],
  );

  const metrics = useMemo(
    () => ({
      temperature: Number(environmentalData?.temperature ?? 0),
      humidity: Number(environmentalData?.humidity ?? 0),
      windSpeed: Number(environmentalData?.windSpeed ?? 0),
      drynessIndex: Number(environmentalData?.drynessIndex ?? 0),
    }),
    [environmentalData],
  );

  const fetchCaptures = async () => {
    if (!activeLocationName) {
      setCaptures([]);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/drone/captures?location=${encodeURIComponent(activeLocationName)}`, {
      credentials: 'include',
    });
    const payload = await parseResponse(response, 'Unable to fetch captured images.');
    setCaptures(Array.isArray(payload?.data) ? payload.data : []);
  };

  useEffect(() => {
    setError(droneError || '');
  }, [droneError]);

  useEffect(() => {
    if (!activeLocation) {
      setCaptures([]);
      return;
    }

    fetchCaptures().catch((captureError) => {
      setError(captureError instanceof Error ? captureError.message : 'Unable to fetch captured images.');
    });
  }, [activeLocation?.id, activeLocation?.name]);

  useEffect(() => {
    if (!selectedCapture) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCapture]);

  const handleActivateDrone = async (droneId: string) => {
    try {
      setError('');
      await activateDrone(droneId, activeLocation);
      await loadDrones(activeLocation);
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : 'Unable to activate drone.');
    }
  };

  const handleStopDrone = async (droneId: string) => {
    try {
      setError('');
      await stopDrone(droneId);
      await loadDrones(activeLocation);
    } catch (stopError) {
      setError(stopError instanceof Error ? stopError.message : 'Unable to stop drone.');
    }
  };

  const handleCaptureImage = async () => {
    if (!activeLocation) {
      setError('Select a forest or community location to deploy drones.');
      return;
    }

    if (!activeLocationDrones.length) {
      setError('Activate at least one drone before capturing a satellite image.');
      return;
    }

    const mapElement = document.getElementById('satellite-map');
    if (!mapElement) {
      setError('Map is not ready for capture.');
      return;
    }

    try {
      setCaptureLoading(true);
      setError('');

      const canvas = await html2canvas(mapElement, { useCORS: true, allowTaint: false });
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.82);

      const response = await fetch(`${API_BASE_URL}/api/drone/capture`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: activeLocation.name,
          droneId: activeLocationDrones[0]._id,
          imageBase64,
          timestamp: new Date().toISOString(),
        }),
      });

      await parseResponse(response, 'Unable to store satellite capture.');
      await fetchCaptures();
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Unable to capture satellite image.');
    } finally {
      setCaptureLoading(false);
    }
  };

  if (!activeLocation) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-xl border border-slate-500/20 bg-[#1E293B] p-6 text-slate-200">
          Select a forest or community location to deploy drones.
        </div>
      </div>
    );
  }

  return (
    <div className="saas-page">
      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/35 bg-red-600/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="saas-surface lg:col-span-2 overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-white">Live Drone Tracking</h3>
              <p className="text-sm text-gray-400">
                Monitoring {activeLocation.name} ({activeLocation.type === 'forest' ? 'Forest' : 'Community'})
              </p>
            </div>
            <Button type="button" onClick={handleCaptureImage} className="h-8" disabled={captureLoading || droneLoading}>
              <Camera className="w-4 h-4 mr-2" />
              {captureLoading ? 'Capturing...' : 'Capture Satellite Image'}
            </Button>
          </div>

          <div id="satellite-map" className="h-[500px] w-full">
            <MapContainer center={[activeLocation.lat, activeLocation.lon]} zoom={zoom} className="h-full w-full">
              <MapViewport lat={activeLocation.lat} lon={activeLocation.lon} zoom={zoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[activeLocation.lat, activeLocation.lon]} icon={buildDroneIcon('#3B82F6')}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{activeLocation.name}</p>
                    <p>Type: {activeLocation.type === 'forest' ? 'Forest Monitoring' : 'Community Monitoring'}</p>
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
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="saas-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white">Active Drones ({activeLocationDrones.length})</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => loadDrones(activeLocation)} disabled={droneLoading}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${droneLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-auto">
              {activeLocationDrones.length === 0 ? (
                <p className="text-sm text-slate-400">No active drones deployed.</p>
              ) : (
                activeLocationDrones.map((drone: any) => (
                  <div key={drone._id} className="rounded-xl border border-slate-600/30 bg-slate-900/45 p-3 transition-all duration-200 hover:border-slate-500/40">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">{drone.name}</p>
                      <span className="text-[11px] rounded bg-[#3B82F6]/20 px-2 py-0.5 text-[#93C5FD]">{drone.status}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-300 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5" />{drone.battery}%</span>
                      <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" />{drone.signal}%</span>
                      {drone.battery < 20 ? (
                        <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3.5 h-3.5" />Low Battery</span>
                      ) : null}
                    </div>
                    {drone.status === 'active' ? (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-3 h-8 w-full"
                        variant="danger"
                        onClick={() => handleStopDrone(drone._id)}
                      >
                        Stop Drone
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="saas-surface p-4">
            <h4 className="text-white mb-3">Available Drones ({availableDrones.length})</h4>
            <div className="space-y-2 max-h-72 overflow-auto">
              {availableDrones.length === 0 ? (
                <p className="text-sm text-slate-400">No available drones at the moment.</p>
              ) : (
                availableDrones.map((drone: any) => (
                  <div key={drone._id} className="rounded-xl border border-slate-600/30 bg-slate-900/45 p-3 transition-all duration-200 hover:border-slate-500/40">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">{drone.name}</p>
                      <span className="text-[11px] rounded bg-slate-700 px-2 py-0.5 text-slate-200">{drone.status}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-300 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5" />{drone.battery}%</span>
                      <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" />{drone.signal}%</span>
                    </div>
                    <Button type="button" size="sm" className="mt-3 h-8 w-full bg-[#F59E0B] text-slate-900 hover:bg-[#F59E0B]/90" onClick={() => handleActivateDrone(drone._id)}>
                      Activate Drone
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="saas-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-[#FF4C4C]" />
            <p className="text-white text-sm">Temperature</p>
          </div>
          <p className="text-2xl text-white">{metrics.temperature.toFixed(1)} deg C</p>
        </div>
        <div className="saas-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-[#1E90FF]" />
            <p className="text-white text-sm">Humidity</p>
          </div>
          <p className="text-2xl text-white">{metrics.humidity.toFixed(1)}%</p>
        </div>
        <div className="saas-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Signal className="w-5 h-5 text-[#FFA500]" />
            <p className="text-white text-sm">Wind Speed</p>
          </div>
          <p className="text-2xl text-white">{metrics.windSpeed.toFixed(1)} km/h</p>
        </div>
        <div className="saas-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-5 h-5 text-[#3B82F6]" />
            <p className="text-white text-sm">Dryness Index</p>
          </div>
          <p className="text-2xl text-white">{metrics.drynessIndex.toFixed(1)}</p>
        </div>
      </div>

      <div className="saas-surface mt-6 p-4">
        <h3 className="text-white mb-3">Captured Images</h3>
        {captures.length === 0 ? (
          <p className="text-sm text-slate-400">No captured images yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {captures.map((capture) => (
              <button
                key={capture._id}
                type="button"
                onClick={() => setSelectedCapture(capture)}
                className="rounded-lg border border-slate-700 bg-slate-900/40 p-2 text-left transition-colors hover:border-slate-500"
              >
                <img src={capture.imageBase64} alt="Satellite capture" className="h-28 w-full rounded object-cover" />
                <p className="mt-2 text-xs text-slate-200 truncate">{capture.location}</p>
                <p className="text-[11px] text-slate-400 truncate">Drone: {capture.droneName || 'Unknown Drone'}</p>
                <p className="text-[11px] text-slate-500">{new Date(capture.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCapture
        ? createPortal(
            <motion.div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm pointer-events-auto"
              onClick={() => setSelectedCapture(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-[#0F172A]/95 p-4 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)]"
                onClick={(event) => event.stopPropagation()}
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ duration: 0.18 }}
              >
                <img src={selectedCapture.imageBase64} alt="Selected satellite capture" className="w-full max-h-[70vh] object-contain rounded-lg" />
                <div className="mt-3 text-sm text-slate-300">
                  <p>Location: {selectedCapture.location}</p>
                  <p>Drone: {selectedCapture.droneName || 'Unknown Drone'}</p>
                  <p>Captured: {new Date(selectedCapture.createdAt).toLocaleString()}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => setSelectedCapture(null)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>,
            document.body,
          )
        : null}
    </div>
  );
}
