// services/admin/episodes.service.ts
import { httpGet } from './_http';

export interface AdminEpisode {
  idx: number;
  title: string;
  webtoonId: number;
  uploadDate: string;
}

export const listEpisodes = () => httpGet<AdminEpisode[]>('/api/admin/episodes');
