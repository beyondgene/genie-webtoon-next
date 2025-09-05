// services/admin/members.service.ts
import { httpGet } from './_http';

//프런트에서 멤버에 대한 관리자의 타입 확장 인터페이스
export interface AdminMember {
  idx: number;
  memberId: string;
  nickname: string;
  email?: string;
  status: 'ACTIVE' | 'DELETED' | string;
  createdAt: string;
}

// 멤버 리스트 라우터를 불러오는 export 함수
export const listMembers = () => httpGet<AdminMember[]>('/api/admin/members');
