import { api } from '@/lib/fetcher';
import type { AdvertisementDTO } from '@/types/dto';

/** 광고 목록 */
export async function getAdvertisements(query?: { status?: string; location?: string }) {
  return api.get<AdvertisementDTO[]>('/api/advertisement', { query });
}

/** 광고 1건 + (선택) 뷰로그 */
export async function getAdvertisement(id: number | string) {
  return api.get<AdvertisementDTO>(`/api/advertisement/${id}`);
}
