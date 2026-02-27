import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { forestZones } from '@/data/forestZones';

const MonitoringContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function parseApiResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function MonitoringProvider({ children }) {
  const [activeForest, setActiveForest] = useState(forestZones[0]);
  const [activeCommunityLocation, setActiveCommunityLocation] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [previousRiskScore, setPreviousRiskScore] = useState(null);
  const [riskChange, setRiskChange] = useState(0);
  const [activeLocation, setActiveLocation] = useState(null);
  const [refreshEnvironmentalData, setRefreshEnvironmentalData] = useState(() => async () => {});
  const [availableDrones, setAvailableDrones] = useState([]);
  const [activeDrones, setActiveDrones] = useState([]);
  const [droneLoading, setDroneLoading] = useState(false);
  const [droneError, setDroneError] = useState('');

  const getLocationLabel = useCallback((location = activeLocation) => String(location?.name || '').trim(), [activeLocation]);

  const loadDrones = useCallback(
    async (locationOverride = null) => {
      const locationName = getLocationLabel(locationOverride);

      if (!locationName) {
        setAvailableDrones([]);
        setActiveDrones([]);
        return;
      }

      setDroneLoading(true);
      setDroneError('');

      try {
        const [availableResponse, activeResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/drones/available?location=${encodeURIComponent(locationName)}`, {
            credentials: 'include',
          }),
          fetch(`${API_BASE_URL}/api/drones/active?location=${encodeURIComponent(locationName)}`, {
            credentials: 'include',
          }),
        ]);

        const availablePayload = await parseApiResponse(availableResponse, 'Unable to fetch available drones.');
        const activePayload = await parseApiResponse(activeResponse, 'Unable to fetch active drones.');

        setAvailableDrones(Array.isArray(availablePayload?.data) ? availablePayload.data : []);
        setActiveDrones(Array.isArray(activePayload?.data) ? activePayload.data : []);
      } catch (error) {
        setDroneError(error instanceof Error ? error.message : 'Unable to fetch drone data.');
      } finally {
        setDroneLoading(false);
      }
    },
    [getLocationLabel],
  );

  const activateDrone = useCallback(
    async (droneId, locationOverride = null) => {
      const targetLocation = locationOverride || activeLocation;

      if (!targetLocation?.name || typeof targetLocation?.lat !== 'number' || typeof targetLocation?.lon !== 'number') {
        throw new Error('Active location is required for drone activation.');
      }

      const response = await fetch(`${API_BASE_URL}/api/drones/activate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          droneId,
          locationName: targetLocation.name,
          lat: targetLocation.lat,
          lon: targetLocation.lon,
        }),
      });

      const payload = await parseApiResponse(response, 'Unable to activate drone.');
      const activatedDrone = payload?.data;

      if (activatedDrone) {
        setActiveDrones((prev) => [activatedDrone, ...prev.filter((drone) => drone._id !== activatedDrone._id)]);
        setAvailableDrones((prev) => prev.filter((drone) => drone._id !== activatedDrone._id));
      }
    },
    [activeLocation],
  );

  const stopDrone = useCallback(async (droneId) => {
    const response = await fetch(`${API_BASE_URL}/api/drones/stop`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ droneId }),
    });

    const payload = await parseApiResponse(response, 'Unable to stop drone.');
    const stoppedDrone = payload?.data;

    setActiveDrones((prev) => prev.filter((drone) => drone._id !== droneId));

    if (stoppedDrone) {
      setAvailableDrones((prev) => {
        const withoutStopped = prev.filter((drone) => drone._id !== stoppedDrone._id);
        return [stoppedDrone, ...withoutStopped];
      });
    }
  }, []);

  useEffect(() => {
    loadDrones(activeLocation);
  }, [activeLocation?.id, activeLocation?.name, loadDrones]);

  useEffect(() => {
    if (!activeDrones.length) {
      return;
    }

    const intervalId = setInterval(() => {
      const autoStandbyIds = [];

      setActiveDrones((previousDrones) =>
        previousDrones
          .map((drone) => {
            const nextBattery = Math.max(0, Number((drone.battery - Math.random() * 4).toFixed(1)));
            const nextSignal = Math.min(100, Math.max(0, Number((drone.signal - Math.random() * 2 + Math.random() * 2).toFixed(1))));

            if (nextBattery < 10) {
              autoStandbyIds.push(drone._id);
              return null;
            }

            return {
              ...drone,
              battery: nextBattery,
              signal: nextSignal,
              lat: Number((drone.lat + (Math.random() - 0.5) * 0.003).toFixed(6)),
              lon: Number((drone.lon + (Math.random() - 0.5) * 0.003).toFixed(6)),
              status: 'active',
            };
          })
          .filter(Boolean),
      );

      if (autoStandbyIds.length) {
        Promise.all(
          autoStandbyIds.map((droneId) =>
            fetch(`${API_BASE_URL}/api/drones/stop`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ droneId }),
            }),
          ),
        ).catch(() => {
          setDroneError('Failed to auto-set low battery drones to standby.');
        });

        loadDrones(activeLocation);
      }
    }, 10_000);

    return () => clearInterval(intervalId);
  }, [activeDrones.length, activeLocation, loadDrones]);

  const setMonitoringSnapshot = useCallback(({ data, risk, location, refresh }) => {
    setEnvironmentalData(data ?? null);
    setActiveLocation(location ?? null);

    if (typeof refresh === 'function') {
      setRefreshEnvironmentalData(() => refresh);
    }

    setRiskData((previousRiskData) => {
      const nextScore = typeof risk?.riskScore === 'number' ? risk.riskScore : null;
      const previousScore = typeof previousRiskData?.riskScore === 'number' ? previousRiskData.riskScore : null;

      if (nextScore !== null && previousScore !== null) {
        setPreviousRiskScore(previousScore);
        setRiskChange(nextScore - previousScore);
      } else if (nextScore !== null && previousScore === null) {
        setPreviousRiskScore(nextScore);
        setRiskChange(0);
      }

      return risk ?? null;
    });
  }, []);

  const value = useMemo(
    () => ({
      activeForest,
      setActiveForest,
      activeCommunityLocation,
      setActiveCommunityLocation,
      environmentalData,
      riskData,
      previousRiskScore,
      riskChange,
      activeLocation,
      refreshEnvironmentalData,
      setMonitoringSnapshot,
      availableDrones,
      activeDrones,
      droneLoading,
      droneError,
      loadDrones,
      activateDrone,
      stopDrone,
      forests: forestZones,
    }),
    [
      activeForest,
      activeCommunityLocation,
      environmentalData,
      riskData,
      previousRiskScore,
      riskChange,
      activeLocation,
      refreshEnvironmentalData,
      setMonitoringSnapshot,
      availableDrones,
      activeDrones,
      droneLoading,
      droneError,
      loadDrones,
      activateDrone,
      stopDrone,
    ],
  );

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoringContext() {
  const context = useContext(MonitoringContext);

  if (!context) {
    throw new Error('useMonitoringContext must be used within MonitoringProvider.');
  }

  return context;
}
