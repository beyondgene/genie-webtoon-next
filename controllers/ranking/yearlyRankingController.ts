import { Webtoon } from '@/models/webtoon';
import { Artist } from '@/models/artist';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

export interface YearlyRankingWebtoon {
  idx: number;
  webtoonName: string;
  artistName: string;
  genre: string;
  yearlyViews: number;
}

/**
 * 연간 랭킹 조회
 */
export async function getYearlyRanking(genre?: string): Promise<YearlyRankingWebtoon[]> {
  const whereClause: Record<string, any> = {};
  if (genre) {
    whereClause.genre = genre;
  }

  const webtoons = await Webtoon.findAll({
    where: whereClause,
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: ['idx', 'webtoonName', 'genre', ['views', 'yearlyViews']],
    order: [['views', 'DESC']],
    limit: 10,
  });

  return webtoons.map((w) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    artistName: w.Artist!.artistName,
    genre: w.genre,
    yearlyViews: (w as any).getDataValue('yearlyViews'),
  }));
}
