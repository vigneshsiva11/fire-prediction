import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Flame, X } from 'lucide-react';
import { useMonitoringContext } from '@/context/MonitoringContext';

interface Notification {
  id: number;
  type: 'critical' | 'warning';
  message: string;
  timestamp: number;
}

interface AlertNotificationsProps {
  lastLogin: string | null;
}

export function AlertNotifications({ lastLogin }: AlertNotificationsProps) {
  const { aiInsights, activeLocation, environmentalData } = useMonitoringContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isInitialRenderRef = useRef(true);
  const previousRiskRef = useRef<number | null>(null);
  const emittedEventKeysRef = useRef<Set<string>>(new Set());

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification].slice(-4));
    // Auto remove after 8 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 8000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const score = Number(aiInsights?.riskScore ?? 0);
    const dynamicAlertLevel = aiInsights?.dynamicAlertLevel;

    if (!Number.isFinite(score) || !dynamicAlertLevel) {
      return;
    }

    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      previousRiskRef.current = score;
      return;
    }

    const previousRisk = previousRiskRef.current ?? score;
    previousRiskRef.current = score;

    const eventTimestamp = new Date(environmentalData?.createdAt || environmentalData?.timestamp || Date.now()).getTime();
    const lastLoginTimestamp = lastLogin ? new Date(lastLogin).getTime() : 0;

    // Ignore historical/stale alerts on first authenticated render.
    if (eventTimestamp <= lastLoginTimestamp) {
      return;
    }

    const locationName = activeLocation?.name || 'selected location';
    const eventScope = `${activeLocation?.id || locationName}-${eventTimestamp}`;

    const emit = (key: string, notification: Omit<Notification, 'id' | 'timestamp'>) => {
      const fullKey = `${eventScope}-${key}`;
      if (emittedEventKeysRef.current.has(fullKey)) {
        return;
      }
      emittedEventKeysRef.current.add(fullKey);
      addNotification({
        id: Date.now() + Math.floor(Math.random() * 1000),
        timestamp: eventTimestamp,
        ...notification,
      });
    };

    if (previousRisk <= 70 && score > 70) {
      emit('high-threshold', {
        type: 'warning',
        message: `High risk threshold crossed in ${locationName} (${score.toFixed(1)}).`,
      });
    }

    if (previousRisk <= 85 && score > 85) {
      emit('critical-threshold', {
        type: 'critical',
        message: `Critical fire risk threshold crossed in ${locationName} (${score.toFixed(1)}).`,
      });
    }

    if (dynamicAlertLevel === 'Escalation Alert') {
      emit('escalation', {
        type: 'warning',
        message: `Risk escalation detected in ${locationName}. Monitoring intensity should be increased.`,
      });
    }
  }, [aiInsights?.riskScore, aiInsights?.dynamicAlertLevel, activeLocation?.id, activeLocation?.name, environmentalData?.createdAt, environmentalData?.timestamp, lastLogin]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className="bg-[#1E293B] border rounded-lg shadow-2xl overflow-hidden pointer-events-auto w-80"
            style={{
              borderColor: notification.type === 'critical' ? '#FF4C4C' : '#FFA500',
            }}
            initial={{ opacity: 0, x: 400, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: notification.type === 'critical' ? '#FF4C4C20' : '#FFA50020',
                }}
              >
                {notification.type === 'critical' ? (
                  <Flame className="w-5 h-5 text-[#FF4C4C]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#FFA500]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium mb-1">
                  {notification.type === 'critical' ? 'Critical Alert' : 'Warning'}
                </p>
                <p className="text-gray-300 text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

