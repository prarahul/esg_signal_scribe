export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export function apiFetch(path: string, init?: RequestInit) {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${base}${p}`, init);
}
