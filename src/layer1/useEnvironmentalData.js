import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchEnvironmentalData, fetchEnvironmentalHistory } from '@/layer1/weatherService';

const REFRESH_INTERVAL_MS = 60_000;

const FOREST_SELECTION_MESSAGE = 'Select a forest zone to begin monitoring.';
const COMMUNITY_PERMISSION_MESSAGE = 'Location permission required for community monitoring.';

export function useEnvironmentalData({ mode, activeForest, lat, lon }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const hasFetchedOnceRef = useRef(false);

  const hasForestParams = mode === 'forest' && !!activeForest;
  const hasLiveParams = mode === 'live' && typeof lat === 'number' && typeof lon === 'number';
  const isReady = hasForestParams || hasLiveParams;

  useEffect(() => {
    hasFetchedOnceRef.current = false;
    setData(null);
    setHistory([]);
    setZoneInfo(null);
    setRiskData(null);
    setLoading(true);
    setHistoryLoading(true);
    setError(null);
    setHistoryError(null);
  }, [mode, activeForest?.id, lat, lon]);

  const getPendingMessage = useCallback(() => {
    if (!mode) {
      return 'Select monitoring mode to start ingestion.';
    }

    if (mode === 'forest') {
      return FOREST_SELECTION_MESSAGE;
    }

    return COMMUNITY_PERMISSION_MESSAGE;
  }, [mode]);

  const requestPayload = useCallback(() => {
    if (mode === 'forest' && activeForest) {
      return {
        mode: 'live',
        lat: activeForest.center.lat,
        lon: activeForest.center.lng,
      };
    }

    return {
      mode: 'live',
      lat,
      lon,
    };
  }, [mode, activeForest, lat, lon]);

  const fetchCurrentData = useCallback(
    async (isManual = false) => {
      if (!isReady) {
        setLoading(false);
        setError(getPendingMessage());
        return;
      }

      if (!isManual && !hasFetchedOnceRef.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const payload = await fetchEnvironmentalData(requestPayload());
        setData(payload?.environmentalData ?? payload?.data ?? null);
        setRiskData(payload?.riskData ?? null);

        if (mode === 'forest' && activeForest) {
          setZoneInfo({
            id: activeForest.id,
            name: activeForest.name,
            country: activeForest.country,
            biome: activeForest.biome,
            priority: activeForest.priority,
            latitude: activeForest.center.lat,
            longitude: activeForest.center.lng,
            bounds: activeForest.bounds,
            mode: 'forest',
          });
        } else {
          setZoneInfo(payload?.zoneInfo ?? null);
        }

        hasFetchedOnceRef.current = true;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load environmental data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isReady, getPendingMessage, requestPayload, mode, activeForest],
  );

  const fetchHistoryData = useCallback(async () => {
    if (!isReady) {
      setHistoryLoading(false);
      setHistoryError(getPendingMessage());
      return;
    }

    if (!history.length) {
      setHistoryLoading(true);
    }

    try {
      const payload = await fetchEnvironmentalHistory(requestPayload());
      setHistory(payload.data);
      setHistoryError(null);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load environmental history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [history.length, isReady, getPendingMessage, requestPayload]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchCurrentData(true), fetchHistoryData()]);
  }, [fetchCurrentData, fetchHistoryData]);

  useEffect(() => {
    refreshData();

    const intervalId = setInterval(() => {
      refreshData();
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshData]);

  return {
    data,
    history,
    zoneInfo,
    riskData,
    loading,
    refreshing,
    historyLoading,
    error,
    historyError,
    refreshData,
    ready: isReady,
  };
}
