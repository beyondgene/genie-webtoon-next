// services/admin/webtoons.service.ts
import { httpGet } from './_http';

export interface AdminWebtoon {
  idx: number;
  webtoonName: string;
  genre: string;
  views?: number;
  recommend?: number;
  artistId?: number;
}

export const listWebtoons = () => httpGet<AdminWebtoon[]>('/api/admin/webtoons');
