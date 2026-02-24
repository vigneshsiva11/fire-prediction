const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function parseResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export async function loginAdmin(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const payload = await parseResponse(response, 'Login failed.');
  return payload.data;
}

export async function logoutAdmin() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  await parseResponse(response, 'Logout failed.');
}

export async function getCurrentAdmin() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const payload = await parseResponse(response, 'Session invalid.');
  return payload.data;
}
