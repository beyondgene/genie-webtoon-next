// services/admin/members.service.ts
import { httpGet } from './_http';

export interface AdminMember {
  idx: number;
  memberId: string;
  nickname: string;
  email?: string;
  status: 'ACTIVE' | 'DELETED' | string;
  createdAt: string;
}

export const listMembers = () => httpGet<AdminMember[]>('/api/admin/members');
