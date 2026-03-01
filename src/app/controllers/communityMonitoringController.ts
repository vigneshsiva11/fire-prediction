interface Coordinates {
  lat: number;
  lon: number;
}

export interface CommunityLocation extends Coordinates {
  name: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

function toFixedCoordinate(value: number) {
  return Number(value.toFixed(6));
}

export function requestBrowserGeolocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: toFixedCoordinate(position.coords.latitude),
          lon: toFixedCoordinate(position.coords.longitude),
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

export async function reverseGeocodeToCity(lat: number, lon: number): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'jsonv2',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch location data.');
  }

  const payload = await response.json();
  const address = payload?.address ?? {};
  const city = address.city || address.town || address.village || address.county || '';
  const country = address.country || '';
  const displayName = payload?.display_name || [city, country].filter(Boolean).join(', ');

  if (!displayName) {
    throw new Error('Unable to resolve city name for this location.');
  }

  return displayName;
}

export async function searchCityLocation(query: string): Promise<CommunityLocation> {
  const value = query.trim();

  if (!value) {
    throw new Error('Enter a city name to continue.');
  }

  const params = new URLSearchParams({
    q: value,
    format: 'jsonv2',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch location data.');
  }

  const payload = await response.json();
  const match = Array.isArray(payload) ? payload[0] : null;

  if (!match?.lat || !match?.lon) {
    throw new Error('City not found. Please try another location.');
  }

  return {
    name: match.display_name,
    lat: toFixedCoordinate(Number(match.lat)),
    lon: toFixedCoordinate(Number(match.lon)),
  };
}
