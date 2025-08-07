import { Webtoon } from '@/models/webtoon';
import { Artist } from '@/models/artist';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

export interface MonthlyRankingWebtoon {
  idx: number;
  webtoonName: string;
  artistName: string;
  genre: string;
  monthlyViews: number;
}

/**
 * 월간 랭킹 조회
 */
export async function getMonthlyRanking(genre?: string): Promise<MonthlyRankingWebtoon[]> {
  const whereClause: Record<string, any> = {};
  if (genre) {
    whereClause.genre = genre;
  }

  const webtoons = await Webtoon.findAll({
    where: whereClause,
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: ['idx', 'webtoonName', 'genre', ['views', 'monthlyViews']],
    order: [['views', 'DESC']],
    limit: 10,
  });

  return webtoons.map((w) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    artistName: w.Artist!.artistName,
    genre: w.genre,
    monthlyViews: (w as any).getDataValue('monthlyViews'),
  }));
}
