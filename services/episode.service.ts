// services/episode.service.ts
import { api, ApiError } from '@/lib/fetcher';
import type { EpisodeDTO, Paginated } from '@/types/dto';

/** QueryLike로 직렬화 (index signature 불필요) */
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

export interface EpisodeListQuery {
  webtoonId: number | string;
  page?: number;
  pageSize?: number;
}

/** 에피소드 목록(Response: 프로젝트 설계상 구독 요약 포함) */
export interface EpisodeListResponseDTO {
  episodes: Array<{
    idx: number;
    title: string;
    thumbnailUrl: string;
    uploadDate: string; // ISO
  }>;
  subscription: { isSubscribed: boolean; alarmOn: boolean };
}

/** 에피소드 상세(Response: 광고·구독 상태 포함 가능) */
export interface EpisodeDetailResponseDTO {
  episode: EpisodeDTO;
  subscription: { isSubscribed: boolean; alarmOn: boolean };
  advertisement?: {
    idx: number;
    adName: string;
    adImageUrl: string;
    targetUrl: string;
  } | null;
}

/** 이전/다음 이동 정보 */
export interface EpisodeNavigationDTO {
  prev: { idx: number; title: string } | null;
  next: { idx: number; title: string } | null;
  totalCount: number;
}

/* ---------------------------------- */
/*                READ                */
/* ---------------------------------- */

/** 웹툰별 에피소드 목록 */
export async function getEpisodeList(query: EpisodeListQuery) {
  return api.get<EpisodeListResponseDTO>('/api/episode', { query: toQuery(query) });
}

/** 에피소드 상세 (경로 규칙: /api/episode/[webtoonId]/[episodeId]) */
export async function getEpisodeDetail(webtoonId: number | string, episodeId: number | string) {
  return api.get<EpisodeDetailResponseDTO>(`/api/episode/${webtoonId}/${episodeId}`);
}

/** 에피소드 네비게이션 (이전/다음/전체 수) */
export async function getEpisodeNavigation(webtoonId: number | string, episodeId: number | string) {
  return api.get<EpisodeNavigationDTO>(`/api/episode/${webtoonId}/${episodeId}/navigation`);
}

/** (선택) 웹툰 상세 경로 기반 목록: /api/webtoon/:id/episodes */
export async function getEpisodesByWebtoon(webtoonId: number | string) {
  return api.get<EpisodeListResponseDTO>(`/api/webtoon/${webtoonId}/episodes`);
}

/* ---------------------------------- */
/*         VIEWER BUNDLE (편의)       */
/* ---------------------------------- */

/**
 * 뷰어 진입 시 필요한 데이터 병렬 로딩:
 * - episode 상세 + navigation + (선택) 댓글 페이지 1
 */
export async function loadViewerBundle(params: {
  webtoonId: number | string;
  episodeId: number | string;
  withComments?: boolean;
}) {
  const { webtoonId, episodeId, withComments } = params;

  const detailPromise = getEpisodeDetail(webtoonId, episodeId);
  const navPromise = getEpisodeNavigation(webtoonId, episodeId);

  if (!withComments) {
    const [detail, navigation] = await Promise.all([detailPromise, navPromise]);
    return { detail, navigation };
  }

  // 댓글 서비스는 순환 의존 없도록 지연 import
  const { getComments } = await import('./comment.service');
  const commentsPromise = getComments({ episodeId, page: 1, pageSize: 20, sort: 'LATEST' });

  const [detail, navigation, comments] = await Promise.all([
    detailPromise,
    navPromise,
    commentsPromise,
  ]);
  return { detail, navigation, comments };
}

/* ---------------------------------- */
/*         CREATE / UPDATE (옵션)     */
/* ---------------------------------- */

/** (관리툴/작가툴 연계를 대비한) 에피소드 생성 */
export async function createEpisode(
  body: Pick<EpisodeDTO, 'title' | 'webtoonId'> & { thumbnailUrl?: string }
) {
  try {
    return await api.post<EpisodeDTO>('/api/episode', body);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '에피소드 생성 권한이 없습니다.';
    }
    throw e;
  }
}

/** 에피소드 수정 */
export async function updateEpisode(id: number | string, body: Partial<EpisodeDTO>) {
  try {
    return await api.patch<EpisodeDTO>(`/api/episode/${id}`, body);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '에피소드 수정 권한이 없습니다.';
    }
    throw e;
  }
}

/** 에피소드 삭제 */
export async function deleteEpisode(id: number | string) {
  try {
    await api.delete<void>(`/api/episode/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      e.message = '에피소드 삭제 권한이 없습니다.';
    }
    throw e;
  }
}
