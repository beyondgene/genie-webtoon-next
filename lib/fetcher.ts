function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u);
}

function getBaseUrl(): string {
  // 클라이언트면 상대경로 그대로 쓰기
  if (typeof window !== 'undefined') return '';

  // 서버일 때: 환경변수 우선 → Vercel → 로컬 폴백
  const envBase = process.env.NEXT_PUBLIC_BASE_URL; // 예: http://localhost:3000 or https://your-domain.com
  if (envBase) return envBase.replace(/\/$/, '');

  const vurl = process.env.VERCEL_URL; // 예: my-app.vercel.app
  if (vurl) return `https://${vurl}`;

  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

function toAbsoluteUrl(input: string): string {
  if (isAbsoluteUrl(input)) return input;
  // 클라: 상대경로, 서버: 베이스 붙이기
  return `${getBaseUrl()}${input}`;
}

// 아래는 기존 로직 그대로, url 만들 때만 보정
function toQueryString(query?: Record<string, any>) {
  if (!query) return '';
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    s.append(k, String(v));
  }
  const q = s.toString();
  return q ? `?${q}` : '';
}

// BodyInit 판별 유틸이 있으면 사용, 없으면 간단히 처리
const isBodyInit = (b: any): b is BodyInit =>
  typeof b === 'string' ||
  b instanceof FormData ||
  (typeof Blob !== 'undefined' && b instanceof Blob) ||
  (typeof ReadableStream !== 'undefined' && b instanceof ReadableStream);

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type ApiFetchOptions = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown> | null;
  query?: Record<string, any>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  credentials?: RequestCredentials;
};

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function apiFetch<T = unknown>(
  input: string,
  { query, headers: hdrs, body, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const url = toAbsoluteUrl(`${input}${toQueryString(query)}`);

  const finalHeaders = new Headers(hdrs);
  let finalBody: BodyInit | undefined;

  if (body == null) {
    finalBody = undefined;
  } else if (isBodyInit(body)) {
    finalBody = body;
  } else {
    finalHeaders.set('Content-Type', 'application/json');
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: finalHeaders,
    body: finalBody,
    ...init,
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) || res.statusText || 'Request failed';
    const err: any = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data as T;
}

/** 편의 메소드 — body에 JSON object 또는 BodyInit 모두 허용 */
export const api = {
  get: <T>(url: string, opts?: Omit<ApiFetchOptions, 'method'>) =>
    apiFetch<T>(url, { ...opts, method: 'GET' }),
  post: <T>(url: string, body?: any, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...opts, method: 'POST', body }),
  patch: <T>(url: string, body?: any, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...opts, method: 'PATCH', body }),
  put: <T>(url: string, body?: any, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...opts, method: 'PUT', body }),
  delete: <T>(url: string, opts?: Omit<ApiFetchOptions, 'method'>) =>
    apiFetch<T>(url, { ...opts, method: 'DELETE' }),
};
