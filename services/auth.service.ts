import { api } from '@/lib/fetcher';

/* 관리자,멤버 타입 사전 정의/ 로그인 세션 dto 사전 정의 */
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
