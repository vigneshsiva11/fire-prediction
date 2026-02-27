import { createContext, useContext, useEffect, useMemo } from 'react';
import { useMonitoringContext } from '@/app/context/MonitoringContext';
import { useEnvironmentalData } from '@/layer1/useEnvironmentalData';

const EnvironmentalDataContext = createContext(null);

export function EnvironmentalDataProvider({ children, mode, activeForest, activeCommunityLocation, communityStatus }) {
  const { setMonitoringSnapshot } = useMonitoringContext();
  const { data, history, zoneInfo, riskData, loading, refreshing, historyLoading, error, historyError, refreshData, ready } =
    useEnvironmentalData({
      mode,
      activeForest,
      lat: activeCommunityLocation?.lat,
      lon: activeCommunityLocation?.lon,
    });

  const activeLocation = useMemo(() => {
    if (mode === 'forest' && activeForest) {
      return {
        id: activeForest.id,
        type: 'forest',
        name: activeForest.name,
        country: activeForest.country,
        lat: activeForest.center?.lat ?? null,
        lon: activeForest.center?.lng ?? null,
      };
    }

    if (mode === 'live' && activeCommunityLocation) {
      return {
        id: `${activeCommunityLocation.lat}-${activeCommunityLocation.lon}`,
        type: 'community',
        name: activeCommunityLocation.name,
        lat: activeCommunityLocation.lat,
        lon: activeCommunityLocation.lon,
      };
    }

    return null;
  }, [mode, activeForest, activeCommunityLocation]);

  useEffect(() => {
    setMonitoringSnapshot({
      data,
      risk: riskData,
      location: activeLocation,
      refresh: refreshData,
    });
  }, [setMonitoringSnapshot, data, riskData, activeLocation, refreshData]);

  const value = useMemo(
    () => ({
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
      ready,
      monitoringMode: mode,
      activeForest,
      activeCommunityLocation,
      activeLocation,
      communityStatus,
      location: {
        name: activeCommunityLocation?.name ?? zoneInfo?.name ?? null,
        lat: activeCommunityLocation?.lat ?? activeForest?.center?.lat ?? zoneInfo?.latitude ?? null,
        lon: activeCommunityLocation?.lon ?? activeForest?.center?.lng ?? zoneInfo?.longitude ?? null,
      },
    }),
    [
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
      ready,
      mode,
      activeForest,
      activeCommunityLocation,
      communityStatus,
    ],
  );

  return <EnvironmentalDataContext.Provider value={value}>{children}</EnvironmentalDataContext.Provider>;
}

export function useEnvironmentalDataContext() {
  const context = useContext(EnvironmentalDataContext);

  if (!context) {
    throw new Error('useEnvironmentalDataContext must be used within EnvironmentalDataProvider.');
  }

  return context;
}
