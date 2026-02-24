import { motion } from 'motion/react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Moon, Sun } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { useState } from 'react';
import { Slider } from '@/app/components/ui/slider';

export function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoDeployDrones, setAutoDeployDrones] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState([70]);

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-[#1E90FF]" />
          <h2 className="text-white">Settings</h2>
        </div>
        <p className="text-gray-400">Configure system preferences and alerts</p>
      </motion.div>

      <div className="max-w-4xl space-y-6">
        {/* Appearance */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            {darkMode ? <Moon className="w-5 h-5 text-[#1E90FF]" /> : <Sun className="w-5 h-5 text-[#FFA500]" />}
            <h3 className="text-white">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Dark Mode</p>
                <p className="text-sm text-gray-400">Use dark theme throughout the application</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[#FFA500]" />
            <h3 className="text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Push Notifications</p>
                <p className="text-sm text-gray-400">Receive alerts for critical events</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Sound Alerts</p>
                <p className="text-sm text-gray-400">Play sound for high-priority alerts</p>
              </div>
              <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
            </div>
          </div>
        </motion.div>

        {/* Monitoring */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="text-white">Monitoring Preferences</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Auto Deploy Drones</p>
                <p className="text-sm text-gray-400">Automatically deploy drones for high-risk zones</p>
              </div>
              <Switch checked={autoDeployDrones} onCheckedChange={setAutoDeployDrones} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white">Alert Risk Threshold</p>
                <span className="text-[#FFA500]">{riskThreshold[0]}%</span>
              </div>
              <Slider
                value={riskThreshold}
                onValueChange={setRiskThreshold}
                max={100}
                min={0}
                step={5}
              />
              <p className="text-sm text-gray-400 mt-2">
                Trigger alerts when fire risk exceeds this threshold
              </p>
            </div>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#1E90FF]" />
            <h3 className="text-white">Account Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-white">Forest Official</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role</span>
              <span className="text-white">Administrator</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Department</span>
              <span className="text-white">Forest Fire Management</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Access Level</span>
              <span className="text-[#3B82F6]">Full Access</span>
            </div>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-[#1E90FF]" />
            <h3 className="text-white">Data Management</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Storage Used</span>
              <span className="text-white">24.3 GB / 100 GB</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#1E90FF] w-1/4" />
            </div>
            <p className="text-gray-400 mt-2">
              Satellite imagery, drone footage, and historical data
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

