// # 클라 사이드 세션 헬퍼
'use client';

/**
 * 클라이언트 전용 세션 헬퍼
 * - next-auth/react의 useSession을 래핑하여 타입 안전 & 롤 체크
 * - 관리자 보호 페이지에서 손쉽게 권한 확인
 */
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Role = 'MEMBER' | 'ADMIN';

export function useClientSession() {
  const { data, status, update } = useSession(); // next-auth 모듈 확장 타입이 자동 반영됨
  return {
    session: data ?? null,
    status, // "loading" | "authenticated" | "unauthenticated"
    update,
    isAuthenticated: status === 'authenticated',
    userId: data?.id ?? data?.user?.id ?? null,
    role: (data?.role ?? data?.user?.role) as Role | undefined,
  };
}

/**
 * 특정 롤을 요구하는 페이지 보호 훅
 * - 권한 없으면 redirectTo로 이동 (기본: /login)
 */
export function useRequireRole(required: Role | Role[], redirectTo = '/login') {
  const { status, role } = useClientSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return;
    const allowed = Array.isArray(required) ? required.includes(role as Role) : role === required;
    if (status !== 'authenticated' || !allowed) {
      router.replace(redirectTo);
    }
  }, [status, role, required, router, redirectTo]);
}

/** 관리자 전용 보호 훅 (syntactic sugar) */
export function useRequireAdmin(redirectTo = '/login') {
  useRequireRole('ADMIN', redirectTo);
}

/** 멤버 전용 보호 훅 */
export function useRequireMember(redirectTo = '/login') {
  useRequireRole('MEMBER', redirectTo);
}
