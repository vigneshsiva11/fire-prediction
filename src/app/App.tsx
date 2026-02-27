import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginPage } from '@/app/components/LoginPage';
import { Sidebar } from '@/app/components/Sidebar';
import { TopNav } from '@/app/components/TopNav';
import { Dashboard } from '@/app/components/Dashboard';
import { RiskAnalysis } from '@/app/components/RiskAnalysis';
import { DroneMonitoring } from '@/app/components/DroneMonitoring';
import { FirePrediction } from '@/app/components/FirePrediction';
import { Alerts } from '@/app/components/Alerts';
import { Reports } from '@/app/components/Reports';
import { Settings } from '@/app/components/Settings';
import { AlertNotifications } from '@/app/components/AlertNotifications';
import { Toaster } from '@/app/components/ui/sonner';
import { EnvironmentalDataProvider } from '@/layer1/EnvironmentalDataContext';
import { MonitoringProvider, useMonitoringContext } from '@/app/context/MonitoringContext';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '@/app/services/authService';
import {
  requestBrowserGeolocation,
  reverseGeocodeToCity,
  searchCityLocation,
  type CommunityLocation,
} from '@/app/controllers/communityMonitoringController';
import SatelliteMap from '@/pages/SatelliteMap.jsx';
import { toast } from 'sonner';

type UserRole = 'admin';
type MonitoringMode = 'forest' | 'live';

interface AdminSession {
  id: string;
  username: string;
  role: UserRole;
  lastLogin: string | null;
}

function AppContent() {
  const { activeForest, setActiveForest, forests, activeCommunityLocation, setActiveCommunityLocation } = useMonitoringContext();

  const [session, setSession] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [monitoringMode, setMonitoringMode] = useState<MonitoringMode>('forest');
  const [locationLoading, setLocationLoading] = useState(false);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [locationPermissionError, setLocationPermissionError] = useState('');
  const [hasAttemptedAutoLiveLookup, setHasAttemptedAutoLiveLookup] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        const admin = await getCurrentAdmin();

        if (!isMounted) {
          return;
        }

        setSession(admin);
      } catch {
        if (!isMounted) {
          return;
        }

        setSession(null);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const requestLiveLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationPermissionError('');
    setLocationPermissionDenied(false);

    try {
      const coordinates = await requestBrowserGeolocation();
      const locationName = await reverseGeocodeToCity(coordinates.lat, coordinates.lon).catch(() => 'Current Location');

      const nextLocation: CommunityLocation = {
        name: locationName,
        lat: coordinates.lat,
        lon: coordinates.lon,
      };

      setActiveCommunityLocation(nextLocation);
      setLocationPermissionError('');
      setLocationPermissionDenied(false);
    } catch (error) {
      setActiveCommunityLocation(null);

      const geoError = error as GeolocationPositionError;
      if (geoError?.code === geoError.PERMISSION_DENIED) {
        setLocationPermissionDenied(true);
        setLocationPermissionError('Location permission denied. You can manually enter a city to monitor.');
        return;
      }

      setLocationPermissionError('Unable to retrieve live location. Please retry.');
      toast.error('Unable to fetch location data.');
    } finally {
      setLocationLoading(false);
    }
  }, [setActiveCommunityLocation]);

  const handleCommunityCitySearch = useCallback(
    async (cityQuery: string) => {
      setCitySearchLoading(true);

      try {
        const cityLocation = await searchCityLocation(cityQuery);
        setActiveCommunityLocation(cityLocation);
        setLocationPermissionError('');
        toast.success(`Monitoring: ${cityLocation.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to fetch location data.';
        setLocationPermissionError(message);

        if (message.includes('City not found')) {
          toast.error('City not found. Please try another location.');
        } else {
          toast.error('Unable to fetch location data.');
        }
      } finally {
        setCitySearchLoading(false);
      }
    },
    [setActiveCommunityLocation],
  );

  useEffect(() => {
    if (monitoringMode === 'forest') {
      setLocationPermissionError('');
      setLocationPermissionDenied(false);
      setHasAttemptedAutoLiveLookup(false);
      return;
    }

    if (session && monitoringMode === 'live' && !activeCommunityLocation && !locationLoading && !locationPermissionDenied && !hasAttemptedAutoLiveLookup) {
      setHasAttemptedAutoLiveLookup(true);
      requestLiveLocation();
    }
  }, [session, monitoringMode, activeCommunityLocation, locationLoading, requestLiveLocation, locationPermissionDenied, hasAttemptedAutoLiveLookup]);

  const handleLogin = async ({ username, password }: { username: string; password: string }) => {
    const admin = await loginAdmin(username, password);
    setSession(admin);
    setCurrentPage('dashboard');

    toast.success('Authenticated successfully', {
      description: 'Secure admin session initialized.',
    });
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      toast.error('Logout request failed', {
        description: error instanceof Error ? error.message : 'Unexpected error during logout.',
      });
    } finally {
      setSession(null);
      setCurrentPage('dashboard');
      setActiveCommunityLocation(null);
      setLocationPermissionError('');
      setLocationPermissionDenied(false);
      toast.info('Logged out successfully');
    }
  };

  const handleForestSelect = (forest: (typeof forests)[number]) => {
    setActiveForest(forest);

    setTimeout(() => {
      document.getElementById('live-feed-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole="admin" />;
      case 'satellite-monitoring':
        return <SatelliteMap />;
      case 'risk-analysis':
        return <RiskAnalysis />;
      case 'drone':
        return <DroneMonitoring />;
      case 'fire-prediction':
        return <FirePrediction />;
      case 'alerts':
        return <Alerts userRole="admin" />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard userRole="admin" />;
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#0F172A] text-slate-200 flex items-center justify-center">Validating secure session...</div>;
  }

  if (!session) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <EnvironmentalDataProvider
      mode={monitoringMode}
      activeForest={activeForest}
      activeCommunityLocation={activeCommunityLocation}
      communityStatus={{
        permissionDenied: locationPermissionDenied,
        message: locationPermissionError,
      }}
    >
      <div className="h-screen w-screen flex flex-col bg-[#0B1220] overflow-hidden">
        <TopNav
          onLogout={handleLogout}
          userRole={session.role}
          lastLogin={session.lastLogin}
          monitoringMode={monitoringMode}
          onMonitoringModeChange={setMonitoringMode}
          forests={forests}
          activeForest={activeForest}
          onForestSelect={handleForestSelect}
          onRequestLiveLocation={requestLiveLocation}
          activeCommunityLocation={activeCommunityLocation}
          locationLoading={locationLoading}
          citySearchLoading={citySearchLoading}
          locationPermissionDenied={locationPermissionDenied}
          locationPermissionError={locationPermissionError}
          onCommunityCitySearch={handleCommunityCitySearch}
        />
        <div className="flex-1 flex overflow-hidden min-h-0">
          <Sidebar currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <AlertNotifications />
        <Toaster />
      </div>
    </EnvironmentalDataProvider>
  );
}

export default function App() {
  return (
    <MonitoringProvider>
      <AppContent />
    </MonitoringProvider>
  );
}
