// app/api/(protected)/ranking/_lib.ts
import db from '@/models';
import { Op, fn, col, literal } from 'sequelize';
import { unstable_cache as cache } from 'next/cache';
// 라우터에서 사용하기 위해 장르, 시점에 관한 타입 선언
export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type GenreEnum =
  | 'DRAMA'
  | 'ROMANCE'
  | 'FANTASY'
  | 'ACTION'
  | 'LIFE'
  | 'GAG'
  | 'SPORTS'
  | 'THRILLER'
  | 'HISTORICAL';
export type GenreSlug =
  | 'all'
  | 'drama'
  | 'romance'
  | 'fantasy'
  | 'action'
  | 'life'
  | 'gag'
  | 'sports'
  | 'thriller'
  | 'historical';
// 소문자 대문자 호환 slug 선언
export const SLUG_TO_GENRE: Record<GenreSlug, GenreEnum | undefined> = {
  all: undefined,
  drama: 'DRAMA',
  romance: 'ROMANCE',
  fantasy: 'FANTASY',
  action: 'ACTION',
  life: 'LIFE',
  gag: 'GAG',
  sports: 'SPORTS',
  thriller: 'THRILLER',
  historical: 'HISTORICAL',
};
// 현재 서울 시각으로 db랑 정보 시간 변환
function seoulNow() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}
function toYmd(d: Date) {
  // YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 기간 경계(모두 KST, DATEONLY로 사용) */
export function periodRangeYMD(period: Period): { startYmd: string; endYmd: string } {
  const now = seoulNow();
  const start = new Date(now);
  const end = new Date(now);

  if (period === 'daily') {
    // 오늘 하루
    // start/end 모두 오늘
  } else if (period === 'weekly') {
    // 이번 주(월~일)
    const day = (now.getDay() + 6) % 7; // Mon=0
    start.setDate(now.getDate() - day);
    end.setDate(start.getDate() + 6);
  } else if (period === 'monthly') {
    // 이번 달(1일~말일)
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  } else {
    // 1년간(오늘 포함 지난 365일 구간)
    start.setDate(now.getDate() - 364);
    // end = today
  }

  return { startYmd: toYmd(start), endYmd: toYmd(end) };
}
// 누적과 기간합계용 데이터 타입 추가
export type RankingRow = {
  rank: number;
  webtoon: {
    idx: number;
    webtoonName: string;
    wbthumbnailUrl?: string | null;
    genre: GenreEnum;
    views: number; // 누적(표시용)
  };
  periodViews: number; // 기간 합계
};
// 랭킹 갖고오는 라우터 로직
export async function getRanking(period: Period, genreSlug: GenreSlug): Promise<RankingRow[]> {
  const { startYmd, endYmd } = periodRangeYMD(period);
  const g = SLUG_TO_GENRE[genreSlug];

  // 정확 집계: WebtoonViewStat가 있으면 반드시 SUM(date 범위)로 계산
  const hasStat = !!(db as any).WebtoonViewStat;
  if (hasStat) {
    const rows = await (db as any).WebtoonViewStat.findAll({
      attributes: [
        [col('WebtoonViewStat.webtoonId'), 'webtoonId'],
        [fn('SUM', col('WebtoonViewStat.views')), 'periodViews'],
      ],
      where: {
        // DATEONLY 기준, inclusive 범위
        '$WebtoonViewStat.date$': { [Op.between]: [startYmd, endYmd] },
      },
      include: [
        {
          model: db.Webtoon,
          as: 'webtoon',
          attributes: ['idx', 'webtoonName', 'wbthumbnailUrl', 'genre', 'views'],
          where: g ? { genre: g } : {},
        },
      ],
      group: [col('WebtoonViewStat.webtoonId'), col('webtoon.idx')],
      order: [[col('periodViews'), 'DESC']], // 순위는 오직 기간 합계로
      limit: 10,
    });

    return rows.map((r: any, i: number) => ({
      rank: i + 1,
      webtoon: r.webtoon.toJSON(),
      periodViews: Number(r.get('periodViews')) || 0,
    }));
  }

  //  통계 테이블이 없으면 '기간 랭킹'을 만들 근거가 없음 → 빈 배열 반환
  // (개발 중엔 seed로 webtoon_view_stat 넣거나, 뷰어 진입으로 데이터 쌓음)
  return [];
}

export async function getRankingCached(period: Period, genre: GenreSlug) {
  const fn = cache(() => getRanking(period, genre), ['ranking', period, genre], {
    revalidate: 600,
    tags: ['ranking', `ranking:${period}`, `ranking:${genre}`],
  });
  return await fn();
}
