//# 공통 fetch(에러/재시도)

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiErrorPayload {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorPayload {
  status: number;
  code?: string;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export type QueryLike = Record<string, unknown>;

// toQueryString도 QueryLike를 받아 안전하게 문자열화
function toQueryString(q?: QueryLike): string {
  if (!q) return '';
  const sp = new URLSearchParams();

  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    if (Array.isArray(v)) {
      // 배열은 여러 값으로 append
      v.forEach((item) => sp.append(k, String(item)));
      return;
    }

    // 날짜는 ISO 문자열로
    if (v instanceof Date) {
      sp.set(k, v.toISOString());
      return;
    }

    // 객체는 JSON 문자열로 (필요 시 백엔드에서 JSON.parse)
    if (typeof v === 'object') {
      sp.set(k, JSON.stringify(v));
      return;
    }

    // 그 외는 문자열 캐스팅
    sp.set(k, String(v));
  });

  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ApiFetchOptions의 query 타입을 넓혀서 서비스 인터페이스들이 그대로 들어오게
export type JsonLike = Record<string, unknown> | unknown[];

export type ApiFetchOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: BodyInit | JsonLike | null;
  headers?: HeadersInit;
  query?: QueryLike; // ✅ 여기만 바꿔도 서비스 쪽 인터페이스들이 바로 호환됨
};

function isBodyInit(x: unknown): x is BodyInit {
  if (x == null) return false;
  if (typeof x === 'string') return true;
  if (typeof Blob !== 'undefined' && x instanceof Blob) return true;
  if (typeof FormData !== 'undefined' && x instanceof FormData) return true;
  if (typeof URLSearchParams !== 'undefined' && x instanceof URLSearchParams) return true;
  if (x instanceof ArrayBuffer) return true;
  // ArrayBufferView(예: Uint8Array)
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView?.(x)) return true;
  return false;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // 비-JSON 응답 대비
  }
}

export async function apiFetch<T = unknown>(
  input: string,
  { query, headers, body, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const url = `${input}${toQueryString(query)}`;

  const finalHeaders = new Headers(headers);
  let finalBody: BodyInit | undefined;

  if (body == null) {
    finalBody = undefined;
  } else if (isBodyInit(body)) {
    // FormData/Blob/URLSearchParams/ArrayBuffer 등
    finalBody = body;
  } else {
    // JSON object/array로 간주
    finalBody = JSON.stringify(body);
    if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }
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
    const payload: ApiErrorPayload = {
      status: res.status,
      message:
        (data && (data.message || data.error || data.msg)) || res.statusText || 'Request failed',
      code: data?.code,
      details: data?.details ?? data,
    };
    throw new ApiError(payload);
  }

  return data as T;
}

/** 편의 메소드 — body에 JSON object 또는 BodyInit 모두 허용 */
export const api = {
  get: <T>(url: string, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...opts, method: 'GET' }),

  post: <T>(
    url: string,
    body?: BodyInit | JsonLike | null,
    opts?: Omit<ApiFetchOptions, 'method' | 'body'>
  ) => apiFetch<T>(url, { ...opts, method: 'POST', body }),

  patch: <T>(
    url: string,
    body?: BodyInit | JsonLike | null,
    opts?: Omit<ApiFetchOptions, 'method' | 'body'>
  ) => apiFetch<T>(url, { ...opts, method: 'PATCH', body }),

  put: <T>(
    url: string,
    body?: BodyInit | JsonLike | null,
    opts?: Omit<ApiFetchOptions, 'method' | 'body'>
  ) => apiFetch<T>(url, { ...opts, method: 'PUT', body }),

  delete: <T>(url: string, opts?: Omit<ApiFetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(url, { ...opts, method: 'DELETE' }),
};
