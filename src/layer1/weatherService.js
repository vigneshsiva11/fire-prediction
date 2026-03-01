const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

function buildUrl(path, params = {}) {
  const query = buildQuery(params);
  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
}

async function parseApiResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || fallbackMessage;

    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }

    throw new Error(message);
  }

  return payload;
}

export async function fetchForestZones() {
  let response = await fetch(buildUrl('/api/forest-zones'), {
    credentials: 'include',
  });

  // Backward-compatible fallback for older backend route naming.
  if (response.status === 404) {
    response = await fetch(buildUrl('/api/zones'), {
      credentials: 'include',
    });
  }

  const payload = await parseApiResponse(response, 'Failed to fetch forest zones.');

  return Array.isArray(payload?.data)
    ? payload.data.map((zone) => ({
        id: zone.id,
        name: zone.name,
        state: zone.state,
        latitude: zone.latitude,
        longitude: zone.longitude,
        radiusKm: zone.radiusKm,
        description: zone.description,
        regionCode: zone.regionCode,
      }))
    : [];
}

export async function fetchEnvironmentalData({ mode, zoneId, lat, lon }) {
  const isForestMode = mode === 'forest';
  const isLiveMode = mode === 'live';

  if (!isForestMode && !isLiveMode) {
    throw new Error('Mode must be either forest or live.');
  }

  if (isForestMode && !zoneId) {
    throw new Error('Select a forest zone to begin monitoring.');
  }

  if (isLiveMode && (typeof lat !== 'number' || typeof lon !== 'number')) {
    throw new Error('Location permission required for community monitoring.');
  }

  const response = await fetch(
    buildUrl('/api/environment', {
      mode,
      zoneId: isForestMode ? zoneId : undefined,
      lat: isLiveMode ? lat : undefined,
      lon: isLiveMode ? lon : undefined,
    }),
    {
      credentials: 'include',
    },
  );

  return parseApiResponse(response, 'Failed to fetch environmental data from backend.');
}

export async function fetchEnvironmentalHistory({ mode, zoneId, lat, lon }) {
  const isForestMode = mode === 'forest';
  const isLiveMode = mode === 'live';

  if (!isForestMode && !isLiveMode) {
    throw new Error('Mode must be either forest or live.');
  }

  if (isForestMode && !zoneId) {
    throw new Error('Select a forest zone to begin monitoring.');
  }

  if (isLiveMode && (typeof lat !== 'number' || typeof lon !== 'number')) {
    throw new Error('Location permission required for community monitoring.');
  }

  const response = await fetch(
    buildUrl('/api/environment/history', {
      mode,
      zoneId: isForestMode ? zoneId : undefined,
      lat: isLiveMode ? lat : undefined,
      lon: isLiveMode ? lon : undefined,
    }),
    {
      credentials: 'include',
    },
  );

  const payload = await parseApiResponse(response, 'Failed to fetch environmental history from backend.');

  return {
    zoneInfo: payload?.zoneInfo ?? null,
    data: Array.isArray(payload?.data) ? payload.data : [],
  };
}
