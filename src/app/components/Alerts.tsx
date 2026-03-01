import { motion } from 'motion/react';
import { AlertTriangle, Flame, Radio, CloudRain, Bell, Check, X, Send } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';
import { useMonitoringContext } from '@/context/MonitoringContext';

interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  location: string;
  icon: any;
  read: boolean;
}

interface AlertsProps {
  userRole: 'admin' | 'user';
}

function buildAiAlerts(ai: any, locationName: string): Alert[] {
  const alerts: Alert[] = [];
  let id = 1;

  if (!ai) {
    return [
      {
        id: id++,
        type: 'info',
        title: 'Awaiting Live Environmental Data',
        message: 'Risk and forecast alerts will appear once environmental ingestion is active.',
        time: 'now',
        location: locationName,
        icon: CloudRain,
        read: false,
      },
    ];
  }

  const score = Number(ai.riskScore || 0);
  const spreadVelocity = Number(ai.spreadVelocity || 0);
  const projectedBurnArea = Number(ai.projectedBurnArea || 0);
  const trendDelta = Number(ai.riskTrendDelta || 0);

  if (score > 85 || ai.dynamicAlertLevel === 'Critical Alert') {
    alerts.push({
      id: id++,
      type: 'critical',
      title: 'Critical Fire Risk Detected',
      message: `Risk score is ${score.toFixed(1)} with dominant factor "${ai.dominantFactor}". Immediate response protocol required.`,
      time: 'just now',
      location: locationName,
      icon: Flame,
      read: false,
    });
  } else if (score > 70 || ai.dynamicAlertLevel === 'High Alert') {
    alerts.push({
      id: id++,
      type: 'warning',
      title: 'High Fire Risk Alert',
      message: `Risk score reached ${score.toFixed(1)}. Intensify drone and ground monitoring in this location.`,
      time: 'just now',
      location: locationName,
      icon: AlertTriangle,
      read: false,
    });
  }

  if (ai.dynamicAlertLevel === 'Escalation Alert' || trendDelta >= 6) {
    alerts.push({
      id: id++,
      type: 'warning',
      title: 'Escalation Alert',
      message: `Risk trajectory increased rapidly (${trendDelta >= 0 ? '+' : ''}${trendDelta.toFixed(1)} trend delta).`,
      time: '2 min ago',
      location: locationName,
      icon: Radio,
      read: false,
    });
  }

  if (spreadVelocity > 15) {
    alerts.push({
      id: id++,
      type: 'warning',
      title: 'Spread Velocity Watch',
      message: `Spread velocity is ${spreadVelocity.toFixed(1)} km/h. Increased surveillance cadence is recommended.`,
      time: '5 min ago',
      location: locationName,
      icon: CloudRain,
      read: false,
    });
  }

  alerts.push({
    id: id++,
    type: 'info',
    title: 'AI Model Update',
    message: `Model confidence ${Number(ai.confidenceScore || 0).toFixed(1)}% | Uncertainty ±${Number(ai.uncertaintyMargin || 0).toFixed(1)}% | Projected burn area ${projectedBurnArea.toFixed(1)} km2.`,
    time: '10 min ago',
    location: locationName,
    icon: Bell,
    read: true,
  });

  return alerts;
}

export function Alerts({ userRole }: AlertsProps) {
  const { aiInsights, activeLocation } = useMonitoringContext();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const locationName = activeLocation?.name || 'Selected Monitoring Location';
  const generatedAlerts = useMemo(() => buildAiAlerts(aiInsights, locationName), [aiInsights, locationName]);

  useEffect(() => {
    setAlerts(generatedAlerts);
  }, [generatedAlerts]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return { bg: '#FF4C4C', text: '#FF4C4C' };
      case 'warning':
        return { bg: '#FFA500', text: '#FFA500' };
      case 'info':
        return { bg: '#1E90FF', text: '#1E90FF' };
      default:
        return { bg: '#1E90FF', text: '#1E90FF' };
    }
  };

  const markAsRead = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)));
    toast.success('Alert marked as read');
  };

  const dismissAlert = (id: number) => {
    const alert = alerts.find((a) => a.id === id);
    setAlerts(alerts.filter((existingAlert) => existingAlert.id !== id));
    toast.info(`Alert dismissed: ${alert?.title}`);
  };

  const notifyAuthorities = (alert: Alert) => {
    if (userRole !== 'admin') {
      toast.error('Access Denied', {
        description: 'Only administrators can notify authorities',
      });
      return;
    }
    toast.success('Authorities Notified', {
      description: `Emergency services alerted about ${alert.location}`,
    });
    markAsRead(alert.id);
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((alert) => alert.type === filter);
  const unreadCount = alerts.filter((alert) => !alert.read).length;

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-6 h-6 text-[#FFA500]" />
              <h2 className="text-white">Alerts & Notifications</h2>
              {unreadCount > 0 && (
                <motion.span className="bg-[#FF4C4C] text-white text-xs px-2 py-1 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {unreadCount} new
                </motion.span>
              )}
            </div>
            <p className="text-[#94A3B8]">Real-time fire risk and system alerts</p>
          </motion.div>

          <motion.div className="flex items-center gap-3 bg-[#1E293B] px-4 py-3 rounded-lg border border-[#334155]/30" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Bell className="w-5 h-5 text-[#94A3B8]" />
            <span className="text-white text-sm">Sound Alerts</span>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </motion.div>
        </div>

        <motion.div className="flex gap-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {(['all', 'critical', 'warning', 'info'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg transition-all capitalize ${
                filter === type
                  ? 'bg-gradient-to-r from-[#1e293b] to-[#334155] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155]/30'
              }`}
            >
              {type}
              {type === 'all' && ` (${alerts.length})`}
            </button>
          ))}
        </motion.div>

        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => {
            const Icon = alert.icon;
            const colors = getAlertColor(alert.type);

            return (
              <motion.div
                key={alert.id}
                className={`bg-[#1E293B] rounded-xl border overflow-hidden ${!alert.read ? 'border-[#334155]/50' : 'border-[#334155]/30'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex">
                  <div className="w-1 flex-shrink-0" style={{ backgroundColor: colors.bg }} />

                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${colors.bg}20` }}>
                        <Icon className="w-6 h-6" style={{ color: colors.text }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-white">{alert.title}</h4>
                              {!alert.read && (
                                <motion.div className="w-2 h-2 bg-[#FF4C4C] rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                              )}
                            </div>
                            <p className="text-[#94A3B8] text-sm">{alert.message}</p>
                          </div>
                          <button onClick={() => dismissAlert(alert.id)} className="text-[#94A3B8] hover:text-white transition-colors flex-shrink-0">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span>{alert.time}</span>
                          <span>•</span>
                          <span>{alert.location}</span>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          {!alert.read && (
                            <Button size="sm" variant="outline" onClick={() => markAsRead(alert.id)} className="text-white border-[#334155]/50 hover:bg-[#1e293b]/30">
                              <Check className="w-4 h-4 mr-2" />
                              Mark as Read
                            </Button>
                          )}
                          {alert.type === 'critical' && (
                            <Button size="sm" onClick={() => notifyAuthorities(alert)} className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/90 text-white" disabled={userRole !== 'admin'}>
                              <Send className="w-4 h-4 mr-2" />
                              {userRole === 'admin' ? 'Notify Authorities' : 'Admin Only'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-[#94A3B8] text-lg">No {filter !== 'all' ? filter : ''} alerts</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
