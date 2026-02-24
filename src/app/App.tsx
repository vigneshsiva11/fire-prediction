import { useState, useEffect, useCallback } from 'react';
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
import SatelliteMap from '@/pages/SatelliteMap.jsx';
import { toast } from 'sonner';

type UserRole = 'admin';
type MonitoringMode = 'forest' | 'live';

interface LiveCoordinates {
  lat: number;
  lon: number;
}

interface AdminSession {
  id: string;
  username: string;
  role: UserRole;
  lastLogin: string | null;
}

function AppContent() {
  const { activeForest, setActiveForest, forests } = useMonitoringContext();

  const [session, setSession] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [monitoringMode, setMonitoringMode] = useState<MonitoringMode>('forest');
  const [liveCoordinates, setLiveCoordinates] = useState<LiveCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionError, setLocationPermissionError] = useState('');

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

  const requestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermissionError('Location permission required for community monitoring.');
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationPermissionError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveCoordinates({
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        });
        setLocationPermissionError('');
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        setLiveCoordinates(null);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionError('Location permission required for community monitoring.');
          return;
        }

        setLocationPermissionError('Unable to retrieve live location. Please retry.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, []);

  useEffect(() => {
    if (monitoringMode === 'forest') {
      setLiveCoordinates(null);
      setLocationPermissionError('');
      return;
    }

    if (session && monitoringMode === 'live' && !liveCoordinates && !locationLoading) {
      requestLiveLocation();
    }
  }, [session, monitoringMode, liveCoordinates, locationLoading, requestLiveLocation]);

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
      setLiveCoordinates(null);
      setLocationPermissionError('');
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
    <EnvironmentalDataProvider mode={monitoringMode} activeForest={activeForest} liveCoordinates={liveCoordinates}>
      <div className="h-screen w-screen flex flex-col bg-[#0F172A] overflow-hidden">
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
          liveCoordinates={liveCoordinates}
          locationLoading={locationLoading}
          locationPermissionError={locationPermissionError}
        />
        <div className="flex-1 flex overflow-hidden min-h-0">
          <Sidebar currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{renderPage()}</main>
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
