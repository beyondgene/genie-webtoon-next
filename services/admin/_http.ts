// services/admin/_http.ts
export const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export async function httpGet<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} failed: ${res.status} ${text}`);
  }
  return res.json();
}
