import { api } from '@/lib/fetcher';

export type UserRole = 'MEMBER' | 'ADMIN';
export interface AuthSessionDTO {
  id: number;
  role: UserRole;
  memberId: string;
  nickname: string;
}

/** 세션 조회 */
export async function getSession() {
  return api.get<AuthSessionDTO | null>('/api/auth/session');
}
