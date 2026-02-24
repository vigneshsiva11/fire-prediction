import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { AlertTriangle, Flame, X } from 'lucide-react';

interface Notification {
  id: number;
  type: 'critical' | 'warning';
  message: string;
}

export function AlertNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate incoming alerts
    const timer1 = setTimeout(() => {
      addNotification({
        id: 1,
        type: 'critical',
        message: 'Zone C fire risk exceeds 75%',
      });
    }, 5000);

    const timer2 = setTimeout(() => {
      addNotification({
        id: 2,
        type: 'warning',
        message: 'High winds detected in Zone B',
      });
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
    // Auto remove after 8 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 8000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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

