'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type TileId = 'genre' | 'ranking' | 'genielife' | 'mypage';

export default function HomePage() {
  const [active, setActive] = useState<TileId | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const COOLDOWN_MS = 500;

  // ESC로 닫기
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        close(); // 기존 close() 재사용 (cooldown 포함)
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]); // 오버레이가 열렸을 때만 바인딩

  const handleEnter = (id: TileId) => {
    if (!cooldown) setActive(id);
  };

  const close = () => {
    setActive(null);
    setCooldown(true);
    setTimeout(() => setCooldown(false), COOLDOWN_MS); // 재호버 방지
  };

  return (
    <div className="w-screen h-[100svh] bg-[#919191] overflow-hidden">
      {/* 바깥 테두리(1px white) */}
      <div className="w-full h-full border border-white">
        {/* Figma 비율: 좌 735 / 우 705 */}
        <div className="grid w-full h-full gap-0" style={{ gridTemplateColumns: '735fr 705fr' }}>
          {/* LEFT: 605 / 419 */}
          <div className="grid gap-0" style={{ gridTemplateRows: '59.082% 40.918%' }}>
            {/* 좌상: 장르(오른쪽/아래 선) */}
            <motion.div
              layoutId="tile-genre"
              onMouseEnter={() => handleEnter('genre')}
              onClick={() => handleEnter('genre')}
              className="relative border-r border-b border-white"
            >
              <Tile title="장르별" subtitle="원하는 장르로 빠르게" />
            </motion.div>

            {/* 좌하: 마이페이지(오른쪽 선) */}
            <motion.div
              layoutId="tile-mypage"
              onMouseEnter={() => handleEnter('mypage')}
              onClick={() => handleEnter('mypage')}
              className="relative border-r border-white"
            >
              <Tile title="마이페이지" subtitle="나의 취향과 기록" />
            </motion.div>
          </div>

          {/* RIGHT: 333 / 691 */}
          <div className="grid gap-0" style={{ gridTemplateRows: '32.52% 67.48%' }}>
            {/* 우상: 랭킹(아래 선) */}
            <motion.div
              layoutId="tile-ranking"
              onMouseEnter={() => handleEnter('ranking')}
              onClick={() => handleEnter('ranking')}
              className="relative border-b border-white"
            >
              <Tile title="랭킹" subtitle="이번 주 인기 TOP" />
            </motion.div>

            {/* 우하: 지니와 함께하는 웹툰생활 */}
            <motion.div
              layoutId="tile-genielife"
              onMouseEnter={() => handleEnter('genielife')}
              onClick={() => handleEnter('genielife')}
              className="relative"
            >
              <Tile title="지니와 함께하는 웹툰생활" subtitle="추천 & 도전골든벨" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 오버레이(확대) */}
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              layoutId={`tile-${active}`}
              className="fixed inset-0 z-50"
              initial={{ borderRadius: 0 }}
              animate={{ borderRadius: 0 }}
              exit={{ borderRadius: 0 }}
            >
              <Expanded id={active} onClose={close} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tile({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full h-full bg-[#919191] text-white flex items-center justify-center select-none">
      <div className="text-center">
        <h3 className="font-mont uppercase leading-tight text-[44px] md:text-[56px] font-extrabold tracking-tight">
          {title}
        </h3>
        <span className="block mt-2 text-base md:text-lg opacity-95">{subtitle}</span>
      </div>
    </div>
  );
}

function Expanded({ id, onClose }: { id: TileId; onClose: () => void }) {
  const { title, items } = getVerticalMenu(id);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);
  return (
    <div className="w-full h-full bg-[#919191] text-white relative border border-white">
      {/* 닫기 */}
      <button
        aria-label="닫기"
        onClick={onClose}
        ref={closeBtnRef}
        className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-transparent border border-white text-white hover:bg-white/10 transition"
      >
        ✕
      </button>

      {/* 레이아웃: 좌측 제목 / 중앙 세로 목록 */}
      <div className="w-full h-full flex">
        {/* 좌측: 제목(왼쪽 상단 정렬) */}
        <div className="basis-[32%] shrink-0 grow-0 flex items-start justify-start pl-16 pt-24">
          <h2 className="font-mont uppercase text-[40px] md:text-[52px] font-extrabold leading-none">
            {title}
          </h2>
        </div>

        {/* 중앙: 세로 목록(큰 행간) */}
        <div className="flex-1 flex items-center justify-center">
          <ul className="list-none m-0 p-0 text-white font-light leading-[1.6] space-y-4 md:space-y-6">
            {items.map((i) => (
              <li key={i.href} className="text-[24px] md:text-[32px]">
                <Link href={i.href} className="hover:opacity-80 transition-opacity">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** 섹션별 세로 메뉴 정의 */
function getVerticalMenu(id: TileId): { title: string; items: { href: string; label: string }[] } {
  switch (id) {
    case 'genre':
      return {
        title: '장르별',
        items: [
          { label: '판타지', href: '/genre/판타지' },
          { label: '로맨스', href: '/genre/로맨스' },
          { label: '액션', href: '/genre/액션' },
          { label: '일상', href: '/genre/일상' },
          { label: '스릴러', href: '/genre/스릴러' },
          { label: '개그', href: '/genre/개그' },
          { label: '무협/사극', href: '/genre/무협-사극' },
          { label: '드라마', href: '/genre/드라마' },
          { label: '스포츠', href: '/genre/스포츠' },
        ],
      };
    case 'ranking':
      return {
        title: ' 랭킹',
        items: [
          { label: '일간 랭킹', href: '/ranking/daily/all' },
          { label: '주간 랭킹', href: '/ranking/weekly/all' },
          { label: '월간 랭킹', href: '/ranking/monthly/all' },
          { label: '연간 랭킹', href: '/ranking/yearly/all' },
        ],
      };
    case 'genielife':
      return {
        title: '지니와 함께하는 웹툰생활',
        items: [
          { label: '작품 추천 받기', href: '/genieai/recommendation' },
          { label: '도전! 골든벨', href: '/genieai/golden-bell' },
        ],
      };
    case 'mypage':
      return {
        title: '마이페이지',
        items: [
          { label: '북마크', href: '/bookmarks' },
          { label: '관심 작가', href: '/interests' },
          { label: '프로필', href: '/profile' },
          { label: '로그아웃', href: '/logout' },
        ],
      };
  }
}
