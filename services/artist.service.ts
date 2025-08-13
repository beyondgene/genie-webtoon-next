// services/artist.service.ts
import { api } from '@/lib/fetcher';
import type { ArtistDTO, Paginated } from '@/types/dto';

/** 작가 목록 */
export async function getArtists(query?: { page?: number; pageSize?: number }) {
  return api.get<Paginated<ArtistDTO>>('/api/artist', { query });
}

/** 작가 상세 */
export async function getArtistDetail(id: number | string) {
  return api.get<ArtistDTO>(`/api/artist/${id}`);
}
