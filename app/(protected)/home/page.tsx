'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SpeechBubble from '@/components/ui/SpeechBubble';

type TileId = 'genre' | 'ranking' | 'genielife' | 'mypage';

// 타일 id별 제목 색
const TITLE_COLOR: Record<TileId, string> = {
  genre: 'text-[#00FF80]',
  ranking: 'text-[#FF00FF]',
  genielife: 'text-[#00FFFF]',
  mypage: 'text-[#FFFF00]',
};

// 회원으로 로그인하면 제일 먼저 나오는 메인 화면
export default function HomePage() {
  const [active, setActive] = useState<TileId | null>(null);
  const [expanded, setExpanded] = useState(false); // 확대 단계
  const [cooldown, setCooldown] = useState(false);
  const COOLDOWN_MS = 500;
  const OVERLAY_HOLD_MS = 500; // 오버레이 유지 시간(2.5s)
  // 로딩 직후 호버 비활성화 → 사용자가 '처음으로' 마우스를 움직여야 호버 가능
  const [hoverReady, setHoverReady] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 최신 상태를 타이머에서 안전하게 읽기 위한 ref
  const activeRef = useRef<TileId | null>(null);
  const hoveringRef = useRef<TileId | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // 최초 1회 마우스 이동이 있기 전까지는 호버 금지
  useEffect(() => {
    const enable = () => {
      setHoverReady(true);
      window.removeEventListener('pointermove', enable);
    };
    window.addEventListener('pointermove', enable, { passive: true });
    return () => window.removeEventListener('pointermove', enable);
  }, []);

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
    if (cooldown || !hoverReady) return; // 로딩 직후엔 호버 무시
    hoveringRef.current = id; // 지금 올라간 타일만 기록
    setExpanded(false);
    clearHoverTimer();
    // 2.5초 유지되면 그때 바로 확대 화면을 띄움(그 전엔 아무 것도 안 띄움)
    hoverTimerRef.current = setTimeout(() => {
      if (hoveringRef.current === id) {
        setActive(id);
        setExpanded(true);
      }
    }, OVERLAY_HOLD_MS);
  };

  const handleLeave = (id: TileId) => {
    // 호버에서 빠지면 예약만 취소 (확대 전이라면 아무 것도 안 보임)
    if (hoveringRef.current === id) hoveringRef.current = null;
    clearHoverTimer();
  };

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // 종료시 재호버 방지
  const close = () => {
    clearHoverTimer();
    setExpanded(false);
    setActive(null);
    setCooldown(true);
    setTimeout(() => setCooldown(false), COOLDOWN_MS);
  };
  // 기존 전체 배경 bg-919191, tile titleClass 추가
  return (
    <div className="w-screen h-[100svh] bg-[#4f4f4f] overflow-hidden">
      {/* 바깥 테두리(1px white) */}
      <div className="w-full h-full border border-white">
        {/* Figma 비율: 좌 735 / 우 705 */}
        <div className="grid w-full h-full gap-0" style={{ gridTemplateColumns: '735fr 705fr' }}>
          {/* LEFT: 605 / 419 */}
          <div className="grid gap-0" style={{ gridTemplateRows: '59.082% 40.918%' }}>
            {/* 좌상: 장르(오른쪽/아래 선) 00FF80 */}
            <motion.div
              layoutId="tile-genre"
              onMouseEnter={() => handleEnter('genre')}
              onMouseLeave={() => handleLeave('genre')}
              onClick={() => {
                if (cooldown) return;
                clearHoverTimer();
                setActive('genre');
                setExpanded(true);
              }}
              className="relative border-r border-b border-white "
            >
              <Tile title="장르별" subtitle="원하는 장르로 빠르게" titleClass="text-[#EF833A]" />
            </motion.div>

            {/* 좌하: 마이페이지(오른쪽 선) - 반응형 제목 적용 */}
            <motion.div
              layoutId="tile-mypage"
              onMouseEnter={() => handleEnter('mypage')}
              onMouseLeave={() => handleLeave('mypage')}
              onClick={() => {
                if (cooldown) return;
                clearHoverTimer();
                setActive('mypage');
                setExpanded(true);
              }}
              className="relative border-r border-white"
            >
              <ResponsiveMyPageTile />
            </motion.div>
          </div>

          {/* RIGHT: 333 / 691 FF00FF */}
          <div className="grid gap-0" style={{ gridTemplateRows: '32.52% 67.48%' }}>
            {/* 우상: 랭킹(아래 선) */}
            <motion.div
              layoutId="tile-ranking"
              onMouseEnter={() => handleEnter('ranking')}
              onMouseLeave={() => handleLeave('ranking')}
              onClick={() => {
                if (cooldown) return;
                clearHoverTimer();
                setActive('ranking');
                setExpanded(true);
              }}
              className="relative border-b border-white"
            >
              <Tile title="랭킹" subtitle="이번 주 인기 TOP" titleClass="text-[#EF833A]" />
            </motion.div>

            {/* 우하: 지니와 함께하는 웹툰생활 00FFFF*/}
            <motion.div
              layoutId="tile-genielife"
              onMouseEnter={() => handleEnter('genielife')}
              onClick={() => {
                if (cooldown) return;
                clearHoverTimer();
                setActive('genielife');
                setExpanded(true);
              }}
              className="relative"
            >
              <Tile
                title="지니와 함께하는 웹툰생활"
                subtitle="추천 & 도전골든벨"
                titleClass="text-[#EF833A]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 오버레이(호버 2.5초 뒤에 바로 확대 표시) */}
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
            {expanded && (
              <motion.div
                layoutId={`tile-${active}`}
                className="fixed inset-0 z-50"
                initial={{ borderRadius: 0 }}
                animate={{ borderRadius: 0 }}
                exit={{ borderRadius: 0 }}
              >
                <Expanded id={active} onClose={close} />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 마이페이지 전용 반응형 타일 컴포넌트
function ResponsiveMyPageTile() {
  return (
    <div className="w-full h-full bg-[#4f4f4f] flex items-center justify-center select-none">
      <div className="text-center">
        <h3 className="font-mont uppercase leading-tight text-[44px] md:text-[56px] font-extrabold tracking-tight text-[#EF833A]">
          {/* 모바일에서는 줄바꿈, 데스크톱에서는 한 줄 FFFF00*/}
          <span className="block sm:hidden">
            마이
            <br />
            페이지
          </span>
          <span className="hidden sm:block">마이페이지</span>
        </h3>
        <span className="block mt-2 text-base md:text-lg opacity-95 text-white/90">
          나의 취향과 기록
        </span>
      </div>
    </div>
  );
}

// 부제목 설정 기존 bg-919191 tex
function Tile({
  title,
  subtitle,
  titleClass = 'text-white',
  subtitleClass = 'text-white/90',
  className = '',
}: {
  title: string;
  subtitle: string;
  titleClass?: string;
  subtitleClass?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-full bg-[#4f4f4f] flex items-center justify-center select-none ${className}`}
    >
      <div className="text-center">
        <h3
          className={`font-mont uppercase leading-tight text-[44px] md:text-[56px] font-extrabold tracking-tight ${titleClass}`}
        >
          {title}
        </h3>
        <span className={`block mt-2 text-base md:text-lg opacity-95 ${subtitleClass}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}
// 마우스 호버로 화면 확대시 로직 기존 bg-919191
function Expanded({ id, onClose }: { id: TileId; onClose: () => void }) {
  const { title, items } = getVerticalMenu(id);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);
  return (
    <div className="w-full h-full bg-[#4f4f4f] text-white relative border border-white">
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
        {/* 좌측: 제목(왼쪽 상단 정렬) 메인화면 영역들 글씨색 갖고오는 명령어 */}
        <div className="basis-[32%] shrink-0 grow-0 flex items-start justify-start pl-16 pt-24">
          <h2 className="font-mont uppercase text-[40px] md:text-[52px] font-extrabold leading-none text-[#ff6d00]">
            <SpeechBubble
              fill="transparent" // 내부 배경은 그대로, 테두리만 표시
              thickness={5} // 굵은 테두리 유지
              tailSize={12}
              tailOffset={10}
              className="
      inline-block
      text-[inherit] leading-[inherit]   // 글자 크기/줄간격은 h2 그대로
      px-5 sm:px-6 md:px-8               // 가로 여백 ↑
      py-3 sm:py-3.5 md:py-4             // 세로 여백 ↑ (두 줄 텍스트에도 여유)
      rounded-2xl                        // 모서리 약간 더 둥글게(선택)
    "
            >
              {id === 'genielife' ? (
                <>
                  <span>지니와 함께하는</span>
                  <br />
                  <span className="whitespace-nowrap">웹툰생활</span>
                </>
              ) : id === 'mypage' ? (
                <>
                  <span className="block sm:hidden">
                    마이
                    <br />
                    페이지
                  </span>
                  <span className="hidden sm:block">마이페이지</span>
                </>
              ) : (
                title
              )}
            </SpeechBubble>
          </h2>
        </div>

        {/* 중앙: 세로 목록(큰 행간) 볼드체 적용*/}
        <div className="flex-1 flex items-center justify-center">
          <ul className="list-none m-0 p-0 text-white font-light leading-[1.6] space-y-4 md:space-y-6">
            {items.map((i) => (
              <li key={i.href} className="text-[24px] md:text-[32px]">
                <Link href={i.href} className="font-bold hover:opacity-80 transition-opacity">
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
          { label: '웹툰 추천 받기', href: '/genieai/recommendation' },
          { label: '도전! 골든벨', href: '/genieai/golden-bell' },
        ],
      };
    case 'mypage':
      return {
        title: '마이페이지',
        items: [
          { label: '구독', href: '/bookmarks' },
          { label: '프로필', href: '/profile' },
          { label: '로그아웃', href: '/logout' },
        ],
      };
  }
}
