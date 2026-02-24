import { motion } from 'motion/react';
import { Battery, Signal, Camera, MapPin, Thermometer, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';

const drones = [
  { id: 1, name: 'Drone Alpha', lat: 34.5, lng: -118.2, battery: 85, signal: 95, status: 'active' },
  { id: 2, name: 'Drone Beta', lat: 34.3, lng: -118.0, battery: 62, signal: 88, status: 'active' },
  { id: 3, name: 'Drone Gamma', lat: 34.1, lng: -118.3, battery: 45, signal: 72, status: 'standby' },
];

export function DroneMonitoring() {
  const [selectedDrone, setSelectedDrone] = useState(drones[0]);
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map with Drone Tracking */}
        <motion.div
          className="lg:col-span-2 bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Live Drone Tracking</h3>
            <p className="text-sm text-gray-400">Real-time drone positions and flight paths</p>
          </div>

          <div className="relative h-[500px] bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2000)',
              filter: 'brightness(0.5) contrast(1.2)',
            }}
          >
            {/* Drones */}
            {drones.map((drone, index) => (
              <motion.div
                key={drone.id}
                className="absolute cursor-pointer"
                style={{
                  top: `${25 + index * 25}%`,
                  left: `${20 + index * 20}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                onClick={() => setSelectedDrone(drone)}
              >
                <div className={`relative ${selectedDrone.id === drone.id ? 'scale-125' : ''} transition-transform`}>
                  {/* Drone Icon */}
                  <motion.div
                    className="w-12 h-12 bg-[#1E293B] rounded-full flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14 8H10L12 2M2 12L8 10V14L2 12M22 12L16 14V10L22 12M12 22L10 16H14L12 22M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9Z" />
                    </svg>
                  </motion.div>
                  
                  {/* Signal Rings */}
                  <motion.div
                    className="absolute inset-0 border-2 border-[#3B82F6] rounded-full"
                    animate={{ scale: [1, 2, 3], opacity: [1, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Label */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 rounded text-xs text-white">
                    {drone.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Drone List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {drones.map((drone, index) => (
            <motion.button
              key={drone.id}
              className={`w-full bg-[#1E293B] rounded-xl p-4 border transition-all ${
                selectedDrone.id === drone.id
                  ? 'border-[#1E293B] shadow-lg'
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedDrone(drone)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white">{drone.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  drone.status === 'active'
                    ? 'bg-[#3B82F6]/20 text-[#93C5FD]'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {drone.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Battery className="w-4 h-4" />
                    <span>Battery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3B82F6] transition-all"
                        style={{ width: `${drone.battery}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{drone.battery}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Signal className="w-4 h-4" />
                    <span>Signal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E90FF] transition-all"
                        style={{ width: `${drone.signal}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{drone.signal}%</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Camera Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Normal Feed */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white">Normal Camera - {selectedDrone.name}</h3>
              <p className="text-sm text-gray-400">RGB Optical Feed</p>
            </div>
            <Button
              size="sm"
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(!isLive)}
              className={isLive ? "bg-[#FF4C4C] hover:bg-[#FF4C4C]/90" : ""}
            >
              {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
          <div className="relative h-80 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2000)',
            }}
          >
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#FF4C4C] px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm">LIVE</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  <span>1080p</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>34.5°N, 118.2°W</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Thermal Feed */}
        <motion.div
          className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white">Thermal Camera - {selectedDrone.name}</h3>
            <p className="text-sm text-gray-400">Infrared Heat Detection</p>
          </div>
          <div className="relative h-80 bg-gradient-to-br from-purple-900 via-red-900 to-orange-900">
            {/* Simulated thermal hotspots */}
            <motion.div
              className="absolute top-20 left-32 w-24 h-24 bg-yellow-400 rounded-full blur-2xl"
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-32 right-24 w-32 h-32 bg-orange-500 rounded-full blur-3xl"
              animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.3, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  <span>28-42°C Range</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs">Cold</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                    <div className="w-4 h-4 bg-[#3B82F6] rounded-sm" />
                    <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
                    <div className="w-4 h-4 bg-orange-500 rounded-sm" />
                    <div className="w-4 h-4 bg-red-500 rounded-sm" />
                  </div>
                  <span className="text-xs">Hot</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


