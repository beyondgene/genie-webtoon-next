// services/admin/comments.service.ts
import { httpGet } from './_http';

//프런트에서 댓글에 대한 관리자의 타입 확장 인터페이스
export interface AdminComment {
  idx: number;
  memberId: number;
  webtoonId: number;
  episodeId: number;
  likes: number;
  dislikes: number;
  creationDate: string;
}

//댓글 리스트 라우터를 불러오는 export 함수
export const listComments = () => httpGet<AdminComment[]>('/api/admin/comments');
