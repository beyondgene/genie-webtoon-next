// services/webtoon.service.ts
import { api } from '@/lib/fetcher';
import type { WebtoonDTO, Paginated } from '@/types/dto';

export interface WebtoonListQuery {
  page?: number;
  pageSize?: number;
  genre?: string; // 선택: 장르 필터
}

/** 웹툰 목록 */
export async function getWebtoons(query?: WebtoonListQuery) {
  return api.get<Paginated<WebtoonDTO>>('/api/webtoon', { query });
}

/** 단건 상세 */
export async function getWebtoonDetail(id: number | string) {
  return api.get<WebtoonDTO>(`/api/webtoon/${id}`);
}
