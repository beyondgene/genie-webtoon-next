// components/home/ExpandingGrid.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/styles/expanding-grid.css';

type TileKey = 'genre' | 'ranking' | 'genie' | 'mypage';

const tiles: Array<{
  key: TileKey;
  title: string;
  subtitle: string;
  bg: string; // 배경용 그라디언트 클래스
}> = [
  {
    key: 'genre',
    title: '장르별',
    subtitle: '원하는 장르로 빠르게',
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  },
  {
    key: 'ranking',
    title: '금주의 랭킹',
    subtitle: '이번 주 인기 TOP',
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
  },
  {
    key: 'genie',
    title: '지니와 함께하는 웹툰생활',
    subtitle: '추천 & 도전골든벨',
    bg: 'bg-gradient-to-br from-rose-500 to-rose-700',
  },
  {
    key: 'mypage',
    title: '마이페이지',
    subtitle: '나의 취향과 기록',
    bg: 'bg-gradient-to-br from-amber-500 to-amber-700',
  },
];

export default function ExpandingGrid() {
  const [active, setActive] = useState<TileKey | null>(null);

  return (
    <div className="EG__root" onMouseLeave={() => setActive(null)}>
      <div className="EG__grid">
        {tiles.map((t) => (
          <div
            key={t.key}
            className={`EG__tile ${t.bg}`}
            onMouseEnter={() => setActive(t.key)}
            onClick={() => setActive(t.key)} // 터치/모바일 대응
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActive(t.key)}
          >
            <div className="EG__tileInner">
              <h2 className="EG__title">{t.title}</h2>
              <p className="EG__subtitle">{t.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 오버레이: 호버(또는 클릭)한 타일만 100% 확장 */}
      {active && (
        <div className="EG__overlay">
          <div className="EG__overlayCard">
            <header className="EG__overlayHeader">
              <h3 className="EG__overlayTitle">{tiles.find((x) => x.key === active)?.title}</h3>
              <button className="EG__close" onClick={() => setActive(null)} aria-label="닫기">
                ×
              </button>
            </header>

            <div className="EG__overlayBody">
              {active === 'genre' && (
                <div className="EG__section">
                  <h4>장르 선택</h4>
                  <div className="EG__chipRow">
                    {['액션', '로맨스', '코미디', '판타지', '스릴러', '드라마'].map((g) => (
                      <Link key={g} href={`/genre/${encodeURIComponent(g)}`} className="EG__chip">
                        {g}
                      </Link>
                    ))}
                  </div>
                  <p className="EG__hint">장르 클릭 시 해당 장르 페이지로 이동합니다.</p>
                </div>
              )}

              {active === 'ranking' && (
                <div className="EG__section">
                  <h4>이번 주 TOP</h4>
                  <ol className="EG__podium">
                    <li>🥇 1위 — 웹툰 A</li>
                    <li>🥈 2위 — 웹툰 B</li>
                    <li>🥉 3위 — 웹툰 C</li>
                  </ol>
                  <div className="EG__links">
                    <Link href="/ranking/weekly" className="EG__linkBtn">
                      주간 랭킹 전체보기
                    </Link>
                    <Link href="/ranking/monthly" className="EG__linkGhost">
                      월간 랭킹
                    </Link>
                    <Link href="/ranking/yearly" className="EG__linkGhost">
                      연간 랭킹
                    </Link>
                  </div>
                </div>
              )}

              {active === 'genie' && (
                <div className="EG__section">
                  <h4>지니 추천 & 도전골든벨</h4>
                  <p>회원 취향 기반 추천과 퀴즈 프로모션을 준비했습니다.</p>
                  <div className="EG__links">
                    <Link href="/genieai/recommendation" className="EG__linkBtn">
                      추천 받기
                    </Link>
                    <Link href="/genieai/golden-bell" className="EG__linkGhost">
                      도전골든벨
                    </Link>
                  </div>
                </div>
              )}

              {active === 'mypage' && (
                <div className="EG__section">
                  <h4>마이페이지 바로가기</h4>
                  <div className="EG__quickGrid">
                    <Link href="/member/bookmarks" className="EG__quick">
                      북마크
                    </Link>
                    <Link href="/member/interests" className="EG__quick">
                      관심작가
                    </Link>
                    <Link href="/member/profile" className="EG__quick">
                      프로필
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <footer className="EG__overlayFooter">
              <span className="EG__tip">
                마우스를 영역에서 떼거나 닫기를 누르면 원래 그리드로 돌아갑니다.
              </span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
