// hooks/useAuth.ts
// NextAuth 상태가 hydration 중일 때 UI 깜빡임을 줄입니다
'use client';

import type { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import { useClientSession, useRequireAdmin, useRequireMember } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

export type Role = 'MEMBER' | 'ADMIN' | string;

// next-auth는 UpdateSession 타입을 export하지 않음 → 로컬 별칭 정의
type UpdateSessionFn = (data?: any) => Promise<Session | null>;

type ClientSessionLike =
  | {
      data: Session | null;
      status: 'authenticated' | 'loading' | 'unauthenticated';
      update: UpdateSessionFn;
    }
  | {
      session: Session | null;
      status: 'authenticated' | 'loading' | 'unauthenticated';
      update: UpdateSessionFn;
      isAuthenticated?: boolean;
      userId?: number | string | null;
      role?: Role;
    };

export function useAuth() {
  const res = useClientSession() as ClientSessionLike;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // useSession() 스타일 or 커스텀 스타일 모두 호환
  const session: Session | null = (res as any).data ?? (res as any).session ?? null;
  const status = res.status;
  const update = (res as any).update as UpdateSessionFn;

  const loading = status === 'loading' || !hydrated;
  const isAuthenticated: boolean = (res as any).isAuthenticated ?? status === 'authenticated';

  const rawRole = (res as any).role ?? (session?.user as any)?.role ?? (session as any)?.role;
  const role = rawRole as Role | undefined;

  const isAdmin = role === 'ADMIN';
  const isMember = role === 'MEMBER';

  const userIdMaybe = (res as any).userId ?? (session?.user as any)?.id ?? null;
  const userId =
    typeof userIdMaybe === 'string' ? Number(userIdMaybe) || null : (userIdMaybe as number | null);

  return {
    // 원본
    session,
    status,
    update,
    // 파생
    loading,
    isAuthenticated,
    role,
    isAdmin,
    isMember,
    userId,
    // 액션
    signIn,
    signOut,
  };
}

// 페이지 보호 훅 (클라 라우팅 리다이렉트)
export const useRequireAdminAuth = (redirectTo = '/login') => useRequireAdmin(redirectTo);
export const useRequireMemberAuth = (redirectTo = '/login') => useRequireMember(redirectTo);
