// app/post-login/page.tsx
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';

export default async function PostLogin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = (session as any).user ?? {};
  const role: 'ADMIN' | 'MEMBER' = user.role ?? 'MEMBER';

  // 이메일 미인증(PENDING) 가드: 로그인 절차상 여기까지 오더라도 인증 페이지로 유도
  if (user.status === 'PENDING') {
    // 필요 시 전용 안내 페이지 경로로 바꿔도 됩니다.
    redirect('/verify-email?next=/login');
  }

  // 소셜 최초 로그인 온보딩: 회원가입 페이지로 넘김
  if (user.onboarding === true) {
    const provider = user.oauthProvider ?? 'oauth';
    redirect(`/signup?from=${provider}`);
  }

  // 관리자/회원 분기
  if (role === 'ADMIN') {
    redirect('/dashboard');
  } else {
    redirect('/home');
  }
}
