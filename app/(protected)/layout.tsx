// app/(protected)/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions'; // 기존 authOptions 경로 유지

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  // 필요하면 여기서 공통 헤더/푸터를 넣을 수 있지만
  // 설계서상 로그인 직후 '그리드 화면'만 보이도록 최소화
  return <>{children}</>;
}
