import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import ForestZone from '../models/ForestZone.js';

dotenv.config();

const zones = [
  { name: 'Western Ghats', state: 'Kerala', latitude: 10.8505, longitude: 76.2711, radiusKm: 25, description: 'Dense evergreen mountain forest belt with high biodiversity.', regionCode: 'WG-KL-001' },
  { name: 'Nilgiri Biosphere', state: 'Tamil Nadu', latitude: 11.4064, longitude: 76.6932, radiusKm: 20, description: 'Montane ecosystem connecting Western and Eastern Ghats.', regionCode: 'NBR-TN-002' },
  { name: 'Bandipur National Park', state: 'Karnataka', latitude: 11.6658, longitude: 76.6292, radiusKm: 22, description: 'Critical tiger habitat with mixed deciduous forest cover.', regionCode: 'BNP-KA-003' },
  { name: 'Sundarbans', state: 'West Bengal', latitude: 21.9497, longitude: 88.8763, radiusKm: 30, description: 'Mangrove delta forests vulnerable to saline and fire stress.', regionCode: 'SUN-WB-004' },
  { name: 'Jim Corbett National Park', state: 'Uttarakhand', latitude: 29.5308, longitude: 78.7747, radiusKm: 24, description: 'Riverine and sal forest landscape with seasonal dryness.', regionCode: 'JCP-UK-005' },
  { name: 'Kaziranga', state: 'Assam', latitude: 26.5775, longitude: 93.1711, radiusKm: 21, description: 'Floodplain grassland-forest mosaic with sensitive wildlife zones.', regionCode: 'KAZ-AS-006' },
  { name: 'Gir Forest', state: 'Gujarat', latitude: 21.124, longitude: 70.8241, radiusKm: 19, description: 'Dry deciduous lion habitat with summer heat stress.', regionCode: 'GIR-GJ-007' },
  { name: 'Kanha National Park', state: 'Madhya Pradesh', latitude: 22.3344, longitude: 80.6115, radiusKm: 23, description: 'Central Indian sal and bamboo forests with fire-prone tracts.', regionCode: 'KNP-MP-008' },
  { name: 'Ranthambore', state: 'Rajasthan', latitude: 26.0173, longitude: 76.5026, radiusKm: 18, description: 'Dry tropical forest with frequent summer wildfire pressure.', regionCode: 'RAN-RJ-009' },
  { name: 'Periyar Wildlife Sanctuary', state: 'Kerala', latitude: 9.4626, longitude: 77.2366, radiusKm: 20, description: 'Moist deciduous and evergreen reserve around Periyar lake.', regionCode: 'PER-KL-010' },
  { name: 'Simlipal Forest', state: 'Odisha', latitude: 21.9467, longitude: 86.3576, radiusKm: 22, description: 'Large reserve forest with grassland and dry patches.', regionCode: 'SIM-OD-011' },
  { name: 'Saranda Forest', state: 'Jharkhand', latitude: 22.2196, longitude: 85.3186, radiusKm: 21, description: 'Sal-dominant forest belt with mining-adjacent risk corridors.', regionCode: 'SAR-JH-012' },
  { name: 'Dandeli Forest', state: 'Karnataka', latitude: 15.2668, longitude: 74.6175, radiusKm: 19, description: 'Western Ghats edge forest with steep terrain and canopy density.', regionCode: 'DAN-KA-013' },
  { name: 'Buxa Forest', state: 'West Bengal', latitude: 26.6974, longitude: 89.6058, radiusKm: 17, description: 'Foothill forest ecosystem with mixed tropical vegetation.', regionCode: 'BUX-WB-014' },
  { name: 'Nagarhole Forest', state: 'Karnataka', latitude: 12.041, longitude: 76.131, radiusKm: 21, description: 'Protected deciduous forest connected to Nilgiri landscape.', regionCode: 'NAG-KA-015' },
];

async function seedForestZones() {
  try {
    await connectDB();

    await ForestZone.deleteMany({});
    await ForestZone.insertMany(zones);

    console.log(`Seeded ${zones.length} forest zones successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed forest zones:', error.message);
    process.exit(1);
  }
}

seedForestZones();
