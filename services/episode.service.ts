// services/episode.service.ts
import { api } from '@/lib/fetcher';
import type { EpisodeDTO, Paginated } from '@/types/dto';

/** QueryLike 직렬화 */
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

/* ---------------------------------- */
/*               Types                */
/* ---------------------------------- */

interface EpisodeListQuery {
  webtoonId: number | string;
  page?: number;
  pageSize?: number;
}

/** 목록 응답(구독 요약 포함) */
export interface EpisodeListResponseDTO {
  episodes: Array<{
    idx: number;
    title: string;
    epthumbnailUrl: string;
    uploadDate: string; // ISO
  }>;
  subscription: { isSubscribed: boolean; alarmOn: boolean };
}

/** 상세 응답(광고·구독 요약 포함) */
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
/*               READ                 */
/* ---------------------------------- */

/** 에피소드 목록 */
export async function getEpisodeList(query: EpisodeListQuery) {
  return api.get<EpisodeListResponseDTO>('/api/episode', { query: toQuery(query) });
}

/** 에피소드 상세 (경로: /api/episode/[webtoonId]/[episodeId]) */
export async function getEpisodeDetail(webtoonId: number | string, episodeId: number | string) {
  return api.get<EpisodeDetailResponseDTO>(`/api/episode/${webtoonId}/${episodeId}`);
}

/** 에피소드 네비게이션 (이전/다음/전체 수) */
export async function getEpisodeNavigation(webtoonId: number | string, episodeId: number | string) {
  return api.get<EpisodeNavigationDTO>(`/api/episode/${webtoonId}/${episodeId}/navigation`);
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

  // comment.service.ts 시그니처:
  // getComments(webtoonId: number, episodeId: number, opts?)
  const wId = Number(webtoonId);
  const eId = Number(episodeId);

  const commentsPromise = getComments(wId, eId, { page: 1, pageSize: 20, sort: 'LATEST' });

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

/** 에피소드 생성 */
export async function createEpisode(
  body: Pick<EpisodeDTO, 'title' | 'webtoonId'> & { epthumbnailUrl?: string }
) {
  try {
    return await api.post<EpisodeDTO>('/api/episode', body);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (err?.status === 401 || err?.status === 403) {
      err.message = '에피소드 생성 권한이 없습니다.';
    }
    throw err;
  }
}

/** 에피소드 수정 */
export async function updateEpisode(id: number | string, body: Partial<EpisodeDTO>) {
  try {
    return await api.patch<EpisodeDTO>(`/api/episode/${id}`, body);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (err?.status === 401 || err?.status === 403) {
      err.message = '에피소드 수정 권한이 없습니다.';
    }
    throw err;
  }
}

/** 에피소드 삭제 */
export async function deleteEpisode(id: number | string) {
  try {
    await api.delete<void>(`/api/episode/${id}`);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (err?.status === 401 || err?.status === 403) {
      err.message = '에피소드 삭제 권한이 없습니다.';
    }
    throw err;
  }
}
