// services/admin/artists.service.ts
import { httpGet } from './_http';

export interface AdminArtist {
  idx: number;
  artistName: string;
  realName: string;
  artistEmail: string;
  debutDate?: string | null;
}

export const listArtists = () => httpGet<AdminArtist[]>('/api/admin/artists');
