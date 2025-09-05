// components/layout/Header.tsx
// next/dynamic + 로딩 스켈레톤
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// 클라이언트 전용 컴포넌트는 동적 임포트로 지연 로딩
const MegaMenu = dynamic(() => import('@/components/nav/MegaMenu'), {
  ssr: false,
  loading: () => <div className="h-8 w-40 rounded-lg bg-gray-100 animate-pulse" />,
});
const SessionActions = dynamic(() => import('@/components/auth/SessionActions'), {
  ssr: false,
  loading: () => <div className="h-8 w-28 rounded-lg bg-gray-100 animate-pulse" />,
});
// 헤더 설정
export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" aria-label="홈">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Genie Webtoon
          </Link>

          {/* Primary Nav */}
          <nav className="hidden md:block" aria-label="주요 메뉴">
            <MegaMenu />
          </nav>

          {/* Right actions: 검색 + 세션 */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden sm:inline-block rounded-lg px-3 py-1.5 hover:bg-gray-50"
            >
              검색
            </Link>
            <SessionActions />
          </div>
        </div>
      </div>

      {/* 모바일 간단 내비게이션 */}
      <div className="md:hidden border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-2 flex gap-4 text-sm" aria-label="모바일 메뉴">
          <Link href="/genre" className="hover:underline">
            장르
          </Link>
          <Link href="/ranking/daily" className="hover:underline">
            랭킹
          </Link>
          <Link href="/my" className="hover:underline">
            마이
          </Link>
        </div>
      </div>
    </header>
  );
}
