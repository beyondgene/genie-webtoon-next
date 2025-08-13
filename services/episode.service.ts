import { api } from '@/lib/fetcher';
import type { EpisodeDTO, EpisodeListResponseDTO, Paginated } from '@/types/dto';

/** 에피소드 목록 쿼리 */
export interface EpisodeListQuery {
  /** 특정 웹툰의 에피소드만 조회 */
  webtoonId?: number | string;
  page?: number;
  pageSize?: number;
}

/**
 * 에피소드 목록 조회
 * - API 설계: /api/episode?webtoonId=123&page=1&pageSize=20
 * - (우리 프로젝트에서는 webtoonId 쿼리를 받으면 해당 웹툰의 회차 + 구독요약을 내려줄 수 있음)
 */
export async function getEpisodeList(query: EpisodeListQuery) {
  // 구독 요약을 함께 주는 엔드포인트라면 EpisodeListResponseDTO,
  // 일반 목록이라면 Paginated<EpisodeDTO>일 수 있습니다.
  // 우선 1차 요구(호출 테스트) 기준으로 EpisodeListResponseDTO를 기대 형태로 둡니다.
  return api.get<EpisodeListResponseDTO>('/api/episode', { query });
}

/** 에피소드 단건 상세 */
export async function getEpisodeDetail(id: number | string) {
  return api.get<EpisodeDTO>(`/api/episode/${id}`);
}

/** (선택) 웹툰 상세 경로 기반 목록: /api/webtoon/:id/episodes */
export async function getEpisodesByWebtoon(webtoonId: number | string) {
  return api.get<EpisodeListResponseDTO>(`/api/webtoon/${webtoonId}/episodes`);
}
