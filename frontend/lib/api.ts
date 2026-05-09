const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  // Attach Authorization header from session token if available
  const token = typeof window !== 'undefined' ? (window as any).__vaultiq_token : undefined;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as object) || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      errMsg = body?.message || errMsg;
    } catch (_) {}
    const err = new Error(errMsg) as any;
    err.status = res.status;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    (window as any).__vaultiq_token = token;
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    delete (window as any).__vaultiq_token;
  }
}
