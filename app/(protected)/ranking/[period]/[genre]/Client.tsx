'use client';

import styled from 'styled-components';
import Link from 'next/link';
import type { Period, GenreSlug, RankingRow } from '@/app/api/(protected)/ranking/_lib';
import BackNavigator from '@/components/ui/BackNavigator';

type Props = {
  period: Period;
  genre: GenreSlug;
  items: RankingRow[];
};

export default function Client({ period, genre, items }: Props) {
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);
  // 랭킹 데이터가 있다면 포디움으로 순위 표시후 아래 10등까지는 일반 나열, 반대로 없으면 에러 문구
  return (
    <Wrap>
      <BackNavigator />
      <HeaderBar>
        <h1>{labelOf(period)} 랭킹</h1>
        <small>{genreLabel(genre)}</small>
      </HeaderBar>

      {/* 데이터가 없으면 포디움 감추고 안내 문구 */}
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

// 영어 한국어 변환 레이블
function labelOf(p: Period) {
  return p === 'daily' ? '일간' : p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '연간';
}
// 장르 한영 변환 레이블
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
// 숫자 포멧
function formatNumber(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

// 랭킹에 호둘되는 웹툰 카드 참조위치랑 링크
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

// ----- styled-components -----
/* background: #929292;
  color: #fff;*/
const Wrap = styled.main`
  background: #4f4f4f; /* 랭킹 페이지 배경 */
  color: #fff; /* 헤더 등 기본 텍스트는 흰색 유지 */
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
  height: clamp(320px, 40vw, 420px); /* 전체 높이 증가 */
  display: flex;
  align-items: flex-end; /* 하단 정렬로 시상대 효과 */
  justify-content: center;
  gap: clamp(8px, 2vw, 20px);
  @media (max-width: 960px) {
    height: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'center center'
      'left right';
    justify-items: center;
    align-items: stretch;
    gap: clamp(12px, 3vw, 24px);
    padding: clamp(8px, 2vw, 16px) 0;
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'center'
      'left'
      'right';
  }
`;

const Empty = styled.p`
  max-width: 1100px;
  margin: 24px auto 0;
  opacity: 0.95;
`;

// 웹툰 카드 디자인 - 순위별 높이 차별화
/*  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);*/
const CardWrap = styled(Link)<{ $pos: 'left' | 'center' | 'right' }>`
  position: relative;
  display: grid;
  grid-template:
    'badge' auto
    'thumb' 1fr
    'meta' auto / 1fr;
  flex-shrink: 0;
  grid-area: ${({ $pos }) => $pos};

  /* 순위별 크기와 높이 설정 */
  width: ${
    ({ $pos }) =>
      $pos === 'center'
        ? 'clamp(140px, 24vw, 240px)' // 1등 - 가장 큼
        : 'clamp(120px, 20vw, 200px)' // 2,3등
  };

  height: ${
    ({ $pos }) =>
      $pos === 'center'
        ? 'clamp(200px, 32vw, 320px)' // 1등 - 가장 높음
        : $pos === 'left'
          ? 'clamp(170px, 28vw, 280px)' // 2등 - 중간 높이
          : 'clamp(150px, 24vw, 250px)' // 3등 - 가장 낮음
  };

  @media (max-width: 960px) {
    width: ${({ $pos }) =>
      $pos === 'center' ? 'clamp(220px, 55vw, 300px)' : 'clamp(200px, 45vw, 260px)'};

    height: ${({ $pos }) =>
      $pos === 'center' ? 'clamp(260px, 65vw, 340px)' : 'clamp(220px, 55vw, 300px)'};
  }

  @media (max-width: 540px) {
    width: clamp(220px, 86vw, 320px);

    height: ${({ $pos }) =>
      $pos === 'center' ? 'clamp(260px, 92vw, 360px)' : 'clamp(240px, 88vw, 340px)'};
  }

  border-radius: 18px;
  text-decoration: none;
  color: #4f4f4f; /* 기존 inherit */
  overflow: hidden;
  background: #ffffff; /* 카드 배경 흰색 */
  border: 1px solid #e5e7eb; /* 연한 회색 테두리 */
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;

  /* 순위별 z-index */
  z-index: ${({ $pos }) => ($pos === 'center' ? 3 : 2)};

  &:hover {
    transform: translateY(-4px) scale(1.02);
    background: #f9fafb; /* 흰색 계열로 살짝 변화 기존 : rgba(255, 255, 255, 0.12)*/
    z-index: 10;
  }

  .badge {
    grid-area: badge;
    align-self: start;
    justify-self: start;
    margin: 10px;
    font-weight: 900;
    font-size: clamp(14px, 2vw, 18px);
    padding: 6px 10px;

    /* 순위별 배지 색상 */
    background: ${
      ({ $pos }) =>
        $pos === 'center'
          ? 'linear-gradient(135deg, #FFD700, #FFA500)' // 1등 - 금색
          : $pos === 'left'
            ? 'rgba(160, 160, 160, 0.8)' // 2등 - 진한 은색 (기존 192,192,192 → 160,160,160)
            : 'rgba(164, 102, 40, 0.8)' // 3등 - 진한 동색 (기존 205,127,50 → 164,102,40)
    };

    border-radius: 999px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .thumb {
    grid-area: thumb;
    margin: 6px 10px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    outline: 1px solid #e5e7eb; /* 썸네일 외곽선도 회색 기존: rgba(255, 255, 255, 0.25);*/
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
`;

// 랭킹 리스트 디자인
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
    color: #4f4f4f; /* 기존 inherit */
    padding: 10px 12px;
    border-radius: 12px;
    background: #ffffff; /* 4~10등 배경 흰색 rgba(255, 255, 255, 0.06)*/
    border: 1px solid #e5e7eb; /* 연한 회색 테두리 rgba(255, 255, 255, 0.15)*/
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

// 썸네일 스타일
/*  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : 'rgba(255,255,255,.15)')};
  outline: 1px solid rgba(255, 255, 255, 0.25);*/
const Thumb = styled.i<{ $src: string }>`
  display: block;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : '#f3f4f6')};
  outline: 1px solid #e5e7eb; /* 썸네일 외곽선 */
`;
