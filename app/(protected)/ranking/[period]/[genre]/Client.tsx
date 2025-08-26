'use client';

import styled from 'styled-components';
import Link from 'next/link';
import type { Period, GenreSlug, RankingRow } from '@/app/api/(protected)/ranking/_lib';

type Props = {
  period: Period;
  genre: GenreSlug;
  items: RankingRow[];
};

export default function Client({ period, genre, items }: Props) {
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <Wrap>
      <HeaderBar>
        <h1>{labelOf(period)} 랭킹</h1>
        <small>{genreLabel(genre)}</small>
      </HeaderBar>

      {/* ✅ 데이터가 없으면 포디움 감추고 안내 문구 */}
      {top3.length > 0 ? (
        <Podium>
          {top3[1] && <Card $pos="left" item={top3[1]} />}
          {top3[0] && <Card $pos="center" item={top3[0]} />}
          {top3[2] && <Card $pos="right" item={top3[2]} />}
        </Podium>
      ) : (
        <Empty>랭킹 데이터가 없습니다.</Empty>
      )}

      {/* 나머지 리스트 */}
      {rest.length > 0 && (
        <List>
          {rest.map((it) => (
            <li key={it.webtoon.idx}>
              <Link href={`/webtoon/${it.webtoon.idx}`}>
                <span className="rank">{it.rank}</span>
                <Thumb $src={it.webtoon.wbthumbnailUrl || ''} />
                <span className="title">{it.webtoon.webtoonName}</span>
                <span className="views">{formatNumber(it.periodViews)} views</span>
              </Link>
            </li>
          ))}
        </List>
      )}
    </Wrap>
  );
}

// ----- helpers -----
function labelOf(p: Period) {
  return p === 'daily' ? '일간' : p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '연간';
}
function genreLabel(g: GenreSlug) {
  const m: Record<GenreSlug, string> = {
    all: '전체',
    drama: '드라마',
    romance: '로맨스',
    fantasy: '판타지',
    action: '액션',
    life: '일상',
    gag: '개그',
    sports: '스포츠',
    thriller: '스릴러',
    historical: '사극/역사',
  };
  return m[g];
}
function formatNumber(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

// ----- styled-components -----
const Wrap = styled.main`
  background: #929292;
  color: #fff;
  min-height: 100svh;
  padding: clamp(12px, 2vw, 24px);
`;
const HeaderBar = styled.header`
  display: flex;
  align-items: baseline;
  gap: 12px;
  h1 {
    font-size: clamp(20px, 3vw, 32px);
    font-weight: 800;
    margin: 0;
  }
  small {
    opacity: 0.9;
    font-size: clamp(12px, 2vw, 16px);
  }
  margin-bottom: clamp(12px, 2vw, 24px);
`;
const Podium = styled.section`
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto clamp(24px, 4vw, 40px);
  aspect-ratio: 16 / 7;
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35));
    opacity: 0.95;
  }
`;
const Empty = styled.p`
  max-width: 1100px;
  margin: 24px auto 0;
  opacity: 0.95;
`;

function Card({ item, $pos }: { item: RankingRow; $pos: 'left' | 'center' | 'right' }) {
  return (
    <CardWrap href={`/webtoon/${item.webtoon.idx}`} $pos={$pos}>
      <div className="badge">#{item.rank}</div>
      <div
        className="thumb"
        style={{ backgroundImage: `url('${item.webtoon.wbthumbnailUrl || ''}')` }}
      />
      <div className="meta">
        <div className="title">{item.webtoon.webtoonName}</div>
        <div className="views">{formatNumber(item.periodViews)} views</div>
      </div>
    </CardWrap>
  );
}
// Client.tsx 내 CardWrap 스타일만 교체
const CardWrap = styled(Link)<{ $pos: 'left' | 'center' | 'right' }>`
  position: absolute;
  display: grid;
  grid-template:
    'badge' auto
    'thumb' 1fr
    'meta' auto / 1fr;
  width: clamp(120px, 22vw, 220px);
  height: clamp(160px, 28vw, 300px);
  border-radius: 18px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;

  /* ✅ 기본 transform을 변수로 보존 */
  --base-t: none;
  transform: var(--base-t);
  z-index: 1;

  &:hover {
    /* ✅ hover 시에도 기본 transform 유지 + 살짝 떠오르기 */
    transform: var(--base-t) translateY(-4px) scale(1.02);
    background: rgba(255, 255, 255, 0.12);
    z-index: 10; /* ✅ 호버한 카드 최상단 */
  }

  /* 단상 위 배치 + 기본 z-index */
  ${({ $pos }) =>
    $pos === 'center' &&
    `
    left: 50%; top: 8%;
    --base-t: translateX(-50%); /* ✅ 중앙 정렬 유지 */
    z-index: 3;
  `}
  ${({ $pos }) =>
    $pos === 'left' &&
    `
    left: 18%; bottom: 6%;
    z-index: 2;
  `}
  ${({ $pos }) =>
    $pos === 'right' &&
    `
    right: 18%; bottom: 6%;
    z-index: 2;
  `}

  .badge {
    grid-area: badge;
    align-self: start;
    justify-self: start;
    margin: 10px;
    font-weight: 900;
    font-size: clamp(14px, 2vw, 18px);
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 999px;
  }
  .thumb {
    grid-area: thumb;
    margin: 6px 10px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    outline: 1px solid rgba(255, 255, 255, 0.25);
    min-height: 0;
  }
  .meta {
    grid-area: meta;
    padding: 10px 12px 12px;
    .title {
      font-weight: 800;
      font-size: clamp(13px, 1.8vw, 16px);
      line-height: 1.2;
    }
    .views {
      opacity: 0.9;
      font-size: clamp(11px, 1.6vw, 14px);
      margin-top: 4px;
    }
  }

  @media (max-width: 640px) {
    ${({ $pos }) => $pos === 'left' && `left: 8%; bottom: 4%;`}
    ${({ $pos }) => $pos === 'right' && `right: 8%; bottom: 4%;`}
  }
`;

const List = styled.ol`
  max-width: 1100px;
  margin: 0 auto;
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
  li a {
    display: grid;
    grid-template-columns: 42px 64px 1fr auto;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .rank {
    font-weight: 900;
    font-size: 18px;
    text-align: center;
  }
  .title {
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .views {
    opacity: 0.9;
    font-size: 14px;
  }
  @media (max-width: 520px) {
    li a {
      grid-template-columns: 36px 56px 1fr;
    }
    .views {
      display: none;
    }
  }
`;
const Thumb = styled.i<{ $src: string }>`
  display: block;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : 'rgba(255,255,255,.15)')};
  outline: 1px solid rgba(255, 255, 255, 0.25);
`;
