'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

// 마이페이지에서 로그아웃 클릭시 로그아웃 중.. 화면 표시
export default function LogoutPage() {
  useEffect(() => {
    // 프로젝트 로그인 경로에 맞게 callbackUrl 조정
    signOut({ callbackUrl: '/login' });
  }, []);
  return <div className="p-6">로그아웃 중…</div>;
}
