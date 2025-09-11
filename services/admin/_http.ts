// services/admin/_http.ts
export const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

import { cookies } from 'next/headers';

//GET 메서드를 이용해 http 링크 불러오는 함수
export async function httpGet<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = { ...(init.headers || {}) };
  // 서버에서만 next/headers 사용
  if (typeof window === 'undefined') {
    const jar = await cookies();
    const cookie = jar.toString();
    if (cookie) (headers as any).cookie = cookie;
  }
  const res = await fetch(`${API_BASE}${url}`, {
    cache: 'no-store',
    ...(typeof window !== 'undefined' ? { credentials: 'include' as const } : {}),
    ...init,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} failed: ${res.status} ${text}`);
  }
  return res.json();
}

//PUT 메서드를 이용해 http 링크를 붙여넣는 함수
export async function httpPut<T>(url: string, body: any, init: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(init.headers || {}) };
  if (typeof window === 'undefined') {
    const jar = await cookies();
    const cookie = jar.toString();
    if (cookie) (headers as any).cookie = cookie;
  }
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    body: JSON.stringify(body ?? {}),
    ...init,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${url} failed: ${res.status} ${text}`);
  }
  return res.json();
}
