// services/comment.service.ts
import { api } from '@/lib/fetcher';

/** 서버 응답에서 사용하는 결과 타입(좋아요/싫어요 토글 후) */
export type ReactionResult = {
  likeCount: number;
  dislikeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
};

/** 서버가 내려줄 수 있는 느슨한 댓글 형태(백엔드 호환용) */
type CommentItemRaw = {
  id?: number | string | null;
  idx?: number | string | null;
  parentId?: number | string | null;
  likeCount?: number | string | null;
  dislikeCount?: number | string | null;
  isLiked?: boolean | number | string | null;
  isDisliked?: boolean | number | string | null;
  content?: string | null;
  commentCol?: string | null; // 과거 스키마 호환
  memberId?: number | string | null;
  memberNickname?: string | null;
  creationDate?: string | null;
  modifiedDate?: string | null;
};

/** 프론트 내부에서 쓰는 확정된 댓글 타입 */
export type CommentItem = {
  id: number;
  parentId: number | null;
  likeCount: number;
  dislikeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  content: string;
  memberId: number;
  memberNickname: string;
  creationDate: string;
  modifiedDate: string;
};

// 부모 댓글의 idx,text등을 호환식으로 변형해서 갖고오는 함수
const PARENT_RE = /^::p\[(\d+)\]\s*/i;
function stripParentPrefix(raw: string | null | undefined): {
  parentId: number | null;
  text: string;
} {
  const s = String(raw ?? '');
  const m = s.match(PARENT_RE);
  if (m) {
    const pid = Number(m[1]);
    const text = s.replace(PARENT_RE, '');
    return { parentId: Number.isFinite(pid) ? pid : null, text };
  }
  return { parentId: null, text: s };
}

const normalize = (r: CommentItemRaw): CommentItem => {
  const rawText = String(r.content ?? r.commentCol ?? '');
  // 서버가 미리 parentId 계산해주지 않아도 안전하게 클라에서 한 번 더 계산
  const parsed = stripParentPrefix(rawText);

  return {
    id: Number(r.id ?? r.idx),
    parentId: r.parentId != null ? Number(r.parentId) : parsed.parentId, // DB에 컬럼이 없어도 프리픽스에서 유도
    likeCount: Number(r.likeCount ?? 0),
    dislikeCount: Number(r.dislikeCount ?? 0),
    isLiked: r.isLiked === true || r.isLiked === 'true' || r.isLiked === 1 || r.isLiked === '1',
    isDisliked:
      r.isDisliked === true ||
      r.isDisliked === 'true' ||
      r.isDisliked === 1 ||
      r.isDisliked === '1',
    content: parsed.text,
    memberId: Number(r.memberId ?? 0),
    memberNickname: String(r.memberNickname ?? ''),
    creationDate: String(r.creationDate ?? ''),
    modifiedDate: String(r.modifiedDate ?? ''),
  };
};

/**서버 쿼리문 검색,병합 조건문*/
type Query = Record<string, string | number | boolean | undefined>;
const toQS = (q: Query = {}) =>
  Object.entries(q)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

/** 댓글 목록 조회 */
export async function getComments(
  webtoonId: number,
  episodeId: number,
  opts?: { page?: number; pageSize?: number; sort?: 'LATEST' | 'OLDEST' | 'BEST' }
): Promise<CommentItem[]> {
  const qs = toQS(opts ?? {});
  const res = await api.get<any>(
    `/api/episode/${webtoonId}/${episodeId}/comments${qs ? `?${qs}` : ''}`
  );
  const list: CommentItemRaw[] =
    res?.data?.items ?? res?.items ?? res?.data ?? (Array.isArray(res) ? res : []);
  return (list ?? []).map(normalize);
}

/** 댓글 작성 */
export async function createComment(payload: {
  webtoonId: number;
  episodeId: number;
  content: string;
}) {
  return api.post(`/api/episode/${payload.webtoonId}/${payload.episodeId}/comments`, {
    content: payload.content,
  });
}

/** 좋아요 */
export async function likeComment(commentId: number): Promise<ReactionResult> {
  return api.post(`/api/comment/like/${commentId}`);
}

/** 좋아요 취소 */
export async function unlikeComment(commentId: number): Promise<ReactionResult> {
  return api.delete(`/api/comment/like/${commentId}`);
}

/** 싫어요 */
export async function dislikeComment(commentId: number): Promise<ReactionResult> {
  return api.post(`/api/comment/dislike/${commentId}`);
}

/** 싫어요 취소 */
export async function undislikeComment(commentId: number): Promise<ReactionResult> {
  return api.delete(`/api/comment/dislike/${commentId}`);
}

/** 대댓글 작성 */
export async function replyToComment(
  parentCommentId: number,
  payload: { content: string; webtoonId: number; episodeId: number }
) {
  return api.post(`/api/comment/reply/${parentCommentId}`, payload);
}

/** 댓글 삭제 */
export async function deleteComment(commentId: number) {
  return api.delete(`/api/comment/${commentId}`);
}

/** 댓글 신고 */
export async function reportComment(
  commentId: number,
  payload: { reason: 'SPAM' | 'ABUSE' | 'SPOILER' | 'ETC'; detail?: string }
) {
  return api.post(`/api/comment/report/${commentId}`, payload);
}
