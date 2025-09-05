// services/admin/episodes.service.ts
import { httpGet, httpPut } from './_http';

//프런트에서 에피소드에 대한 관리자의 타입 확장 인터페이스
export interface AdminEpisode {
  idx: number;
  title: string;
  webtoonId: number;
  uploadDate: string;
  adId: number;
}

//에피소드 리스트 라우터를 불러오는 export 함수
export const listEpisodes = () => httpGet<AdminEpisode[]>('/api/admin/episodes');

//에피소드 썸네일 업데이트를 위한 api 라우터를 호출하는 export 함수
export function updateEpisodeThumbnail(id: number, payload: { url?: string; key?: string }) {
  return httpPut<{ idx: number; epthumbnailUrl: string }>(
    `/api/admin/episodes/${id}/thumbnail`,
    payload
  );
}
