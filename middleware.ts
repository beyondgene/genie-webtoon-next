// (member)/(admin) 보호 라우트 가드
// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 1) 공통 로그인 체크
  if (!token) {
    const url = new URL('/login', req.url);
    // 돌아올 경로 유지: /login?next=/my?a=1 처럼 전체 path+query 보존
    url.searchParams.set('next', `${pathname}${search || ''}`);
    return NextResponse.redirect(url);
  }

  // 2) 관리자 권한 페이지
  if (isAdminArea) {
    if (token.role !== 'ADMIN') {
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
  matcher: ['/my/:path*', '/admin/:path*'],
};
