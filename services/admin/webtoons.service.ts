// services/admin/webtoons.service.ts
import { httpGet, httpPut } from './_http';

export interface AdminWebtoon {
  idx: number;
  webtoonName: string;
  genre: string;
  views?: number;
  recommend?: number;
  artistId?: number;
  wbthumbnailUrl?: string;
}

export const listWebtoons = () => httpGet<AdminWebtoon[]>('/api/admin/webtoons');

export function updateWebtoonThumbnail(id: number, payload: { url?: string; key?: string }) {
  return httpPut<{ idx: number; wbthumbnailUrl: string }>(
    `/api/admin/webtoons/${id}/thumbnail`,
    payload
  );
}
