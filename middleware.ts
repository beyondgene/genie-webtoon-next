// (member)/(admin) 보호 라우트 가드
// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole, AdminRole } from '@/types/next-auth';

const ADMIN_INTERNAL_ROLES = new Set<AdminRole>(['SUPER', 'MANAGER']);

// (admin) 라우트 그룹이 URL에 노출하는 실경로들
const ADMIN_GROUP_BASES = [
  '/dashboard',
  '/advertisements',
  '/artists',
  '/webtoons',
  '/episodes',
  '/comments',
  '/members',
  '/subscriptions',
];

// 경로 매칭 헬퍼
function matchAnyBase(pathname: string, bases: string[]) {
  return bases.some((b) => pathname === b || pathname.startsWith(b + '/'));
}

/**
 * 페이지 가드만 담당합니다.
 * - /my/*: 비로그인 → /login?next=...
 * - /admin/*: 비로그인 → /login, 권한 없음 → /403
 * API는 여기서 막지 않습니다(각 라우트에서 requireAuth 사용).
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 보호가 필요한 페이지들
  const isMyArea = pathname.startsWith('/my');
  const isAdminArea = pathname.startsWith('/admin');

  if (!isMyArea && !isAdminArea) {
    return NextResponse.next();
  }

  // next-auth JWT 추출 (middleware 환경 전용)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1) 비로그인 → 로그인 페이지로 (원래 주소를 callbackUrl로 넘김)
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 2) 관리자 권한 검사
  const role = token.role as UserRole | undefined;
  const adminRole = token.adminRole as AdminRole | undefined;

  const isAdmin =
    role === 'ADMIN' || (adminRole !== undefined && ADMIN_INTERNAL_ROLES.has(adminRole));

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  if (matchAnyBase(pathname, ADMIN_GROUP_BASES)) {
    const token = await getToken({ req }); // 기존 변수와 충돌 피하려고 새로 가져옵니다.
    if (!token) {
      const next = encodeURIComponent(pathname + (search || ''));
      return NextResponse.redirect(new URL(`/login?next=${next}`, req.url));
    }
    // 토큰 스키마가 프로젝트마다 다를 수 있어 느슨하게 검사
    // (기존 /admin/* 블록이 쓰는 기준과 동일해야 합니다)
    if (!token.role || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  }

  return NextResponse.next();
}

/**
 * API는 여기서 제외해서 JSON 대신 라우트 핸들러의 requireAuth가 401/403 JSON을 반환하게 합니다.
 * 정적 리소스도 제외.
 */
export const config = {
  matcher: [
    '/my/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/advertisements/:path*',
    '/artists/:path*',
    '/webtoons/:path*',
    '/episodes/:path*',
    '/comments/:path*',
    '/members/:path*',
    '/subscriptions/:path*',
  ],
};
