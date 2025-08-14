// services/admin/comments.service.ts
import { httpGet } from './_http';

export interface AdminComment {
  idx: number;
  memberId: number;
  webtoonId: number;
  episodeId: number;
  likes: 'LIKE' | 'DISLIKE' | 'NONE';
  creationDate: string;
}

export const listComments = () => httpGet<AdminComment[]>('/api/(protected)/admin/comments');
