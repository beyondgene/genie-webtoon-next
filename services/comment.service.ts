import { api } from '@/lib/fetcher';
import type { CommentDTO, Paginated } from '@/types/dto';

/** 댓글 목록 쿼리 */
export interface CommentListQuery {
  /** 특정 회차 댓글 */
  episodeId?: number | string;
  /** 특정 웹툰 전체 댓글 */
  webtoonId?: number | string;
  page?: number;
  pageSize?: number;
  /** 정렬: 최신/베스트 등 (API가 지원하는 값으로 맞춰주세요) */
  sort?: 'LATEST' | 'BEST';
}

/** 댓글 목록 조회 */
export async function getComments(query: CommentListQuery) {
  return api.get<Paginated<CommentDTO>>('/api/comment', { query });
}

/** 댓글 단건 상세 */
export async function getCommentDetail(id: number | string) {
  return api.get<CommentDTO>(`/api/comment/${id}`);
}

/** (선택) 대댓글 목록 */
export async function getCommentReplies(id: number | string) {
  // 프로젝트에 따라 Reply DTO가 분리되어 있을 수 있지만,
  // 1차 요구(호출 테스트)에서는 동일 CommentDTO로 수신하도록 둡니다.
  return api.get<Paginated<CommentDTO>>(`/api/comment/${id}/replies`);
}
