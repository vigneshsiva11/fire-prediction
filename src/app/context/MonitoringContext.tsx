import { createContext, useContext, useMemo, useState } from 'react';
import { forestZones } from '@/data/forestZones';

const MonitoringContext = createContext(null);

export function MonitoringProvider({ children }) {
  const [activeForest, setActiveForest] = useState(forestZones[0]);

  const value = useMemo(
    () => ({
      activeForest,
      setActiveForest,
      forests: forestZones,
    }),
    [activeForest],
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
