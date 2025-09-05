// services/admin/webtoons.service.ts
import { httpGet, httpPut } from './_http';

//프런트에서 웹툰에 대한 관리자의 타입 확장 인터페이스
export interface AdminWebtoon {
  idx: number;
  webtoonName: string;
  genre: string;
  views?: number;
  recommend?: number;
  artistId?: number;
  wbthumbnailUrl?: string;
}

//웹툰 리스트 라우터를 불러오는 export 함수
export const listWebtoons = () => httpGet<AdminWebtoon[]>('/api/admin/webtoons');

//웹툰 썸네일 업데이트 라우터를 불러오는 export 함수
export function updateWebtoonThumbnail(id: number, payload: { url?: string; key?: string }) {
  return httpPut<{ idx: number; wbthumbnailUrl: string }>(
    `/api/admin/webtoons/${id}/thumbnail`,
    payload
  );
}
