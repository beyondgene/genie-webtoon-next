// components/nav/MegaMenu.tsx
// 접근성 ARIA 보강
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type MenuKey = 'genre' | 'ranking' | 'my';
// 장르 타입 선지정
const GENRES = [
  'DRAMA',
  'ROMANCE',
  'FANTASY',
  'ACTION',
  'LIFE',
  'GAG',
  'SPORTS',
  'THRILLER',
  'HISTORICAL',
] as const;
// 홈 화면에서 사용되는 메뉴들 컴포넌트
export default function MegaMenu() {
  const [open, setOpen] = useState<MenuKey | null>(null);
  const timerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // 마우스가 클릭되거나 엔터가 눌렸을때 액션 useEffect로 관리
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const onEnter = (key: MenuKey) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(key);
  };
  const onLeave = () => {
    timerRef.current = window.setTimeout(() => setOpen(null), 120);
  };
  // 각 그리드 디자인 내부에 있는 메뉴들 설정
  return (
    <div ref={rootRef} className="relative" role="menubar" aria-label="메가메뉴">
      <ul className="flex items-center gap-6 text-sm font-medium">
        {/* 장르 */}
        <li onMouseEnter={() => onEnter('genre')} onMouseLeave={onLeave} className="relative">
          <button
            className="py-2 hover:text-indigo-600"
            aria-haspopup="true"
            aria-expanded={open === 'genre'}
            aria-controls="menu-genre"
          >
            장르
          </button>
          {open === 'genre' && (
            <div
              id="menu-genre"
              role="menu"
              className="absolute left-0 mt-2 w-[620px] rounded-2xl border border-gray-100 bg-white shadow-lg p-4"
            >
              <div className="grid grid-cols-3 gap-2">
                {GENRES.map((g) => (
                  <Link
                    key={g}
                    href={`/genre/${g.toLowerCase()}`}
                    className="rounded-lg px-3 py-2 hover:bg-gray-50"
                    role="menuitem"
                  >
                    {translateGenre(g)}
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-right">
                <Link
                  href="/genre"
                  className="text-xs text-gray-500 hover:underline"
                  role="menuitem"
                >
                  전체 장르 보기 →
                </Link>
              </div>
            </div>
          )}
        </li>

        {/* 랭킹 */}
        <li onMouseEnter={() => onEnter('ranking')} onMouseLeave={onLeave} className="relative">
          <button
            className="py-2 hover:text-indigo-600"
            aria-haspopup="true"
            aria-expanded={open === 'ranking'}
            aria-controls="menu-ranking"
          >
            랭킹
          </button>
          {open === 'ranking' && (
            <div
              id="menu-ranking"
              role="menu"
              className="absolute left-0 mt-2 w-[520px] rounded-2xl border border-gray-100 bg-white shadow-lg p-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-2 text-xs font-semibold text-gray-500">기간별</div>
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/ranking/daily"
                      className="rounded px-2 py-1 hover:bg-white"
                      role="menuitem"
                    >
                      일간 랭킹
                    </Link>
                    <Link
                      href="/ranking/weekly"
                      className="rounded px-2 py-1 hover:bg-white"
                      role="menuitem"
                    >
                      주간 랭킹
                    </Link>
                    <Link
                      href="/ranking/monthly"
                      className="rounded px-2 py-1 hover:bg-white"
                      role="menuitem"
                    >
                      월간 랭킹
                    </Link>
                    <Link
                      href="/ranking/yearly"
                      className="rounded px-2 py-1 hover:bg-white"
                      role="menuitem"
                    >
                      연간 랭킹
                    </Link>
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-2 text-xs font-semibold text-gray-500">장르별 빠른 이동</div>
                  <div className="grid grid-cols-2 gap-1">
                    {GENRES.slice(0, 8).map((g) => (
                      <Link
                        key={`rk-${g}`}
                        href={`/ranking/daily/${g.toLowerCase()}`}
                        className="rounded px-2 py-1 hover:bg-white"
                        role="menuitem"
                      >
                        {translateGenre(g)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-right">
                <Link
                  href="/ranking/daily"
                  className="text-xs text-gray-500 hover:underline"
                  role="menuitem"
                >
                  랭킹 전체 보기 →
                </Link>
              </div>
            </div>
          )}
        </li>

        {/* 마이 */}
        <li onMouseEnter={() => onEnter('my')} onMouseLeave={onLeave} className="relative">
          <button
            className="py-2 hover:text-indigo-600"
            aria-haspopup="true"
            aria-expanded={open === 'my'}
            aria-controls="menu-my"
          >
            마이
          </button>
          {open === 'my' && (
            <div
              id="menu-my"
              role="menu"
              className="absolute right-0 mt-2 w-[280px] rounded-2xl border border-gray-100 bg-white shadow-lg p-4"
            >
              <div className="flex flex-col gap-1">
                <Link href="/my" className="rounded px-2 py-1 hover:bg-gray-50" role="menuitem">
                  마이페이지 홈
                </Link>
                <Link
                  href="/my/bookmarks"
                  className="rounded px-2 py-1 hover:bg-gray-50"
                  role="menuitem"
                >
                  북마크
                </Link>
                <Link
                  href="/my/interests"
                  className="rounded px-2 py-1 hover:bg-gray-50"
                  role="menuitem"
                >
                  관심 장르
                </Link>
                <Link
                  href="/my/profile"
                  className="rounded px-2 py-1 hover:bg-gray-50"
                  role="menuitem"
                >
                  프로필
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-gray-500">
                마이 영역은 로그인 필요. 비로그인 시 /login으로 이동됩니다.
              </p>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}
// 영어 장르를 한국어 장르로 변환해서 화면 표시
function translateGenre(g: (typeof GENRES)[number]) {
  switch (g) {
    case 'DRAMA':
      return '드라마';
    case 'ROMANCE':
      return '로맨스';
    case 'FANTASY':
      return '판타지';
    case 'ACTION':
      return '액션';
    case 'LIFE':
      return '일상';
    case 'GAG':
      return '개그';
    case 'SPORTS':
      return '스포츠';
    case 'THRILLER':
      return '스릴러';
    case 'HISTORICAL':
      return '사극';
    default:
      return g;
  }
}
