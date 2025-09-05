// services/admin/artists.service.ts
import { httpGet } from './_http';

//프런트에서 작가에 대한 관리자의 타입 확장 인터페이스
export interface AdminArtist {
  idx: number;
  artistName: string;
  realName: string;
  artistEmail: string;
  artistPhone: string;
  adminId: number;
  debutDate?: string | null;
}

//작가 리스트 라우터를 불러오는 export 함수
export const listArtists = () => httpGet<AdminArtist[]>('/api/admin/artists');
