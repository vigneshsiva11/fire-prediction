import { createContext, useContext, useMemo } from 'react';
import { useEnvironmentalData } from '@/layer1/useEnvironmentalData';

const EnvironmentalDataContext = createContext(null);

export function EnvironmentalDataProvider({ children, mode, activeForest, liveCoordinates }) {
  const { data, history, zoneInfo, riskData, loading, refreshing, historyLoading, error, historyError, refreshData, ready } =
    useEnvironmentalData({
      mode,
      activeForest,
      lat: liveCoordinates?.lat,
      lon: liveCoordinates?.lon,
    });

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
      location: {
        lat: liveCoordinates?.lat ?? activeForest?.center?.lat ?? zoneInfo?.latitude ?? null,
        lon: liveCoordinates?.lon ?? activeForest?.center?.lng ?? zoneInfo?.longitude ?? null,
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
      liveCoordinates?.lat,
      liveCoordinates?.lon,
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
