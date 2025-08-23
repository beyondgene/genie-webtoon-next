// services/admin/episodes.service.ts
import { httpGet, httpPut } from './_http';

export interface AdminEpisode {
  idx: number;
  title: string;
  webtoonId: number;
  uploadDate: string;
}

export const listEpisodes = () => httpGet<AdminEpisode[]>('/api/admin/episodes');

export function updateEpisodeThumbnail(id: number, payload: { url?: string; key?: string }) {
  return httpPut<{ idx: number; epthumbnailUrl: string }>(
    `/api/admin/episodes/${id}/thumbnail`,
    payload
  );
}
