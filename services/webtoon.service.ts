// services/webtoon.service.ts
import { api } from '@/lib/fetcher';
import type { WebtoonDTO, Paginated } from '@/types/dto';

// 프런트에서 확정해서 쓸 수 있는 웹툰 리스트를 불러오는 쿼리 인터페이스
export interface WebtoonListQuery {
  page?: number;
  pageSize?: number;
  genre?: string; // 선택: 장르 필터
  [key: string]: string | number | boolean | null | undefined;
}

/** 웹툰 목록 */
export async function getWebtoons(query?: WebtoonListQuery) {
  return api.get<Paginated<WebtoonDTO>>('/api/webtoon', { query });
}

/** 단건 상세 */
export async function getWebtoonDetail(id: number | string) {
  return api.get<WebtoonDTO>(`/api/webtoon/${id}`);
}
