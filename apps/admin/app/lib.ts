export const API = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'https://api.')?.replace('.supabase.co', '.vercel.app') || 'https://api-tirbeo.vercel.app';

const cache = new Map<string, { data: unknown; expiry: number }>();
const TTL = 5000;

export async function apiFetch(path: string, opts?: RequestInit) {
  const cacheKey = `${opts?.method || 'GET'}:${path}`;
  const cached = opts?.method ? undefined : cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) return cached.data as Response;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const headers: Record<string, string> = {};
    if (!(opts?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API}${path}`, {
      credentials: 'include',
      signal: controller.signal,
      ...opts,
      headers: { ...headers, ...(opts?.headers as Record<string, string> || {}) },
    });
    clearTimeout(timeout);
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!opts?.method) cache.set(cacheKey, { data: res.clone(), expiry: Date.now() + TTL });
    return res;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

/* --- Shared Utility Functions --- */

export function getFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function isImage(mime: string) { return mime.startsWith('image/'); }
export function isVideo(mime: string) { return mime.startsWith('video/'); }

export function isOnline(ua?: string) {
  if (!ua) return false;
  return Date.now() - new Date(ua).getTime() < 5 * 60 * 1000;
}