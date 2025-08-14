// services/comment.service.ts
import { api, ApiError } from '@/lib/fetcher';
import type { CommentDTO, Paginated } from '@/types/dto';

/** QueryLike로 직렬화 */
type QueryVal = string | number | boolean;
function toQuery<T extends object>(q?: T) {
  if (!q) return undefined;
  const out: Record<string, QueryVal> = {};
  for (const [k, v] of Object.entries(q as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    if (v instanceof Date) out[k] = v.toISOString();
    else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else out[k] = String(v);
  }
  return out;
}

/** Body(JsonLike) 직렬화 */
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };
function toBody<T extends object>(b?: T) {
  if (!b) return undefined as unknown as Record<string, JsonValue>;
  const map = (val: unknown): JsonValue => {
    if (val === undefined) return null;
    if (val === null) return null;
    if (val instanceof Date) return val.toISOString();
    if (Array.isArray(val)) return (val as unknown[]).map(map);
    if (typeof val === 'object') {
      const obj: Record<string, JsonValue> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (v === undefined) continue;
        obj[k] = map(v);
      }
      return obj;
    }
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
    return String(val);
  };
  return map(b) as Record<string, JsonValue>;
}

/** 댓글 목록 쿼리 */
export interface CommentListQuery {
  /** 특정 회차 댓글 */
  episodeId?: number | string;
  /** 특정 웹툰 전체 댓글 */
  webtoonId?: number | string;
  page?: number;
  pageSize?: number;
  /** 정렬 옵션(백엔드 지원 값에 맞춰 사용) */
  sort?: 'LATEST' | 'BEST';
}

/** 댓글 작성/수정 payload */
export interface UpsertCommentBody {
  /** 회차 기준 댓글이면 필수 */
  episodeId: number | string;
  /** 텍스트 본문 */
  content: string;
}

/** 댓글 신고 payload */
export interface ReportCommentBody {
  reason: 'SPAM' | 'ABUSE' | 'SPOILER' | 'ETC';
  detail?: string;
}

/* ---------------------------------- */
/*                READ                */
/* ---------------------------------- */

/** 댓글 목록 조회 */
export async function getComments(query: CommentListQuery) {
  return api.get<Paginated<CommentDTO>>('/api/comment', { query: toQuery(query) });
}

/** 댓글 상세 */
export async function getCommentDetail(id: number | string) {
  return api.get<CommentDTO>(`/api/comment/${id}`);
}

/** 대댓글 목록 */
export async function getCommentReplies(
  id: number | string,
  query?: { page?: number; pageSize?: number }
) {
  return api.get<Paginated<CommentDTO>>(`/api/comment/${id}/replies`, { query: toQuery(query) });
}

/* ---------------------------------- */
/*               WRITE                */
/* ---------------------------------- */

/** 댓글 작성(로그인 필요) */
export async function createComment(body: UpsertCommentBody) {
  try {
    return await api.post<CommentDTO>('/api/comment', toBody(body));
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      // 권한 오류 메시지 통일
      e.message = e.status === 401 ? '로그인이 필요합니다.' : '댓글 작성 권한이 없습니다.';
    }
    throw e;
  }
}

/** 댓글 수정(본인만) */
export async function updateComment(id: number | string, body: Pick<UpsertCommentBody, 'content'>) {
  try {
    return await api.patch<CommentDTO>(`/api/comment/${id}`, toBody(body));
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '댓글 수정 권한이 없습니다.';
    }
    throw e;
  }
}

/** 댓글 삭제(본인/관리자) */
export async function deleteComment(id: number | string) {
  try {
    await api.delete<void>(`/api/comment/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '댓글 삭제 권한이 없습니다.';
    }
    throw e;
  }
}

/* ---------------------------------- */
/*            LIKE / DISLIKE          */
/* ---------------------------------- */

export async function likeComment(id: number | string) {
  try {
    await api.post<void>(`/api/comment/${id}/like`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) e.message = '로그인이 필요합니다.';
    throw e;
  }
}

export async function unlikeComment(id: number | string) {
  await api.delete<void>(`/api/comment/${id}/like`);
}

export async function dislikeComment(id: number | string) {
  try {
    await api.post<void>(`/api/comment/${id}/dislike`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) e.message = '로그인이 필요합니다.';
    throw e;
  }
}

export async function undislikeComment(id: number | string) {
  await api.delete<void>(`/api/comment/${id}/dislike`);
}

/* ---------------------------------- */
/*          REPLY / REPORT            */
/* ---------------------------------- */

/** 대댓글 작성 */
export async function replyToComment(
  parentId: number | string,
  body: Pick<UpsertCommentBody, 'content'>
) {
  try {
    return await api.post<CommentDTO>(`/api/comment/${parentId}/replies`, toBody(body));
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '대댓글 작성 권한이 없습니다.';
    }
    throw e;
  }
}

/** 대댓글 삭제 */
export async function deleteReply(parentId: number | string, replyId: number | string) {
  try {
    await api.delete<void>(`/api/comment/${parentId}/replies/${replyId}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '대댓글 삭제 권한이 없습니다.';
    }
    throw e;
  }
}

/** 댓글 신고 */
export async function reportComment(id: number | string, body: ReportCommentBody) {
  try {
    await api.post<void>(`/api/comment/${id}/report`, toBody(body));
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) e.message = '로그인이 필요합니다.';
    throw e;
  }
}
