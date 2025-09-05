// get, post, delete별로 clientApi url 설정
export const api = {
  async get<T>(url: string, init?: RequestInit): Promise<T> {
    const r = await fetch(url, { ...init, credentials: 'include' });
    if (!r.ok) throw new Error(`GET ${url} ${r.status}`);
    return (await r.json()) as T;
  },
  async post<T>(url: string, body?: any, init?: RequestInit): Promise<T> {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body != null ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...init,
    });
    if (!r.ok) throw new Error(`POST ${url} ${r.status}`);
    return (await r.json()) as T;
  },
  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    const r = await fetch(url, { method: 'DELETE', credentials: 'include', ...init });
    if (!r.ok) throw new Error(`DELETE ${url} ${r.status}`);
    return (await r.json()) as T;
  },
};
