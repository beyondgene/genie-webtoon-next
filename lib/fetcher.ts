// lib/fetcher.ts
type QueryLike = Record<string, string | number | boolean | null | undefined>;

export type ApiFetchOptions = Omit<RequestInit, 'body' | 'headers'> & {
  query?: QueryLike;
  headers?: HeadersInit;
  /** JSON 객체 또는 BodyInit */
  body?: unknown;
};
// 절대 경로인지 확인하는 함수
function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u);
}
// local,production baseUrl 갖고오는 함수
function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''; // 클라이언트는 상대경로
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (env) return env;
  const vurl = process.env.VERCEL_URL;
  if (vurl) return `https://${vurl}`;
  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}
// 절대 경로 변환 함수
function toAbsoluteUrl(path: string) {
  if (isAbsoluteUrl(path)) return path;
  const base = getBaseUrl();
  if (!base) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
// 쿼리문을 string 값으로 변환
function toQueryString(q?: QueryLike) {
  if (!q) return '';
  const parts = Object.entries(q)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}
// body값 초기 모델 함수
function isBodyInit(x: unknown): x is BodyInit {
  return (
    typeof x === 'string' ||
    x instanceof Blob ||
    x instanceof ArrayBuffer ||
    x instanceof FormData ||
    x instanceof URLSearchParams ||
    x instanceof ReadableStream
  );
}
// json값 보호함수(손실 방지)
async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}
//fetch api를 이용하여 http로 안전하게 링크를 연결해주는 함수
export async function apiFetch<T = unknown>(
  input: string,
  { query, headers: hdrs, body, method, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const url = toAbsoluteUrl(`${input}${toQueryString(query)}`);
  // 헤더 선언
  const headers = new Headers(hdrs);
  let finalBody: BodyInit | undefined = undefined;

  // GET/HEAD에는 body를 절대 넣지 않음
  const m = (method ?? 'GET').toUpperCase();
  if (m !== 'GET' && m !== 'HEAD') {
    if (body == null) {
      finalBody = undefined;
    } else if (isBodyInit(body)) {
      finalBody = body;
    } else {
      headers.set('Content-Type', 'application/json');
      finalBody = JSON.stringify(body);
    }
  }
  // 위에서 생성된 응답 내용 받아오기
  const res = await fetch(url, {
    method: m,
    // same-origin이면 쿠키 자동 포함. 교차호출 고려 시 include 사용.
    credentials: 'same-origin',
    headers,
    body: finalBody,
    ...init,
  });

  const data = await parseJsonSafe(res);
  // res가 정상적인 응답을 내놓지 못하면 에러 처리
  if (!res.ok) {
    const err = new Error((data as any)?.message || (data as any)?.error || res.statusText) as any;
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data as T;
}

/** 편의 메소드 */
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
