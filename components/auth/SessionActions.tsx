// components/auth/SessionActions.tsx
// 클라이언트 전용"현재 세션 표시 + 로그아웃”
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useClientSession } from '@/lib/auth-client';
// 세션 유지,변화 관련된 컴포넌트
export default function SessionActions() {
  const { status, session, role, isAuthenticated } = useClientSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭/ESC로 닫기
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  if (status === 'loading') {
    return <div className="w-28 h-8 rounded-lg bg-gray-100 animate-pulse" aria-hidden />;
  }
  // 로그인된 세션이 아닐때는 로그인 유도
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="rounded-lg px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500"
      >
        로그인
      </Link>
    );
  }

  const nickname = session?.nickname ?? session?.user?.name ?? 'User';
  const initial = (nickname || '?').charAt(0).toUpperCase();
  // 로그인된 유저의 status에 따라 로딩 페이지 설정
  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="hidden sm:block text-sm">{nickname}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm">
          {initial}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white shadow-lg p-2 text-sm"
        >
          <div className="px-2 py-1.5 text-gray-500">
            {role === 'ADMIN' ? '관리자' : '멤버'}로 로그인됨
          </div>
          <div className="my-1 h-px bg-gray-100" />
          <Link
            href="/my"
            role="menuitem"
            className="block rounded px-2 py-1.5 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            마이페이지
          </Link>
          {role === 'ADMIN' && (
            <Link
              href="/admin"
              role="menuitem"
              className="block rounded px-2 py-1.5 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              관리자 페이지
            </Link>
          )}
          <button
            role="menuitem"
            className="mt-1 w-full rounded px-2 py-1.5 text-left hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              // 로그아웃 후 홈으로 이동
              signOut({ callbackUrl: '/' });
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
