import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';

/**
 * 로그인된 사용자만 접근을 허용합니다.
 */
export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/signin`);
  }
  return session;
}

/**
 * 관리자 권한이 필요한 경로 접근을 검증합니다.
 */
export async function requireAdmin(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (sessionOrRes.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }
  return sessionOrRes;
}
