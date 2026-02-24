export const forestZones = [
  {
    id: 'zoneA',
    name: 'Western Ghats Core',
    lat: 10.8505,
    lon: 76.2711,
    radiusKm: 25,
  },
  {
    id: 'zoneB',
    name: 'Nilgiri Reserve',
    lat: 11.4102,
    lon: 76.695,
    radiusKm: 18,
  },
  {
    id: 'zoneC',
    name: 'Bandipur Range',
    lat: 11.668,
    lon: 76.6346,
    radiusKm: 22,
  },
];

export function getForestZoneById(zoneId) {
  return forestZones.find((zone) => zone.id === zoneId) || null;
}
