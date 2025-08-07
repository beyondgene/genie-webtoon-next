import { Webtoon } from '@/models/webtoon';
import { Artist } from '@/models/artist';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

export interface WeeklyRankingWebtoon {
  idx: number;
  webtoonName: string;
  artistName: string;
  genre: string;
  weeklyViews: number;
}

/**
 * 주간 랭킹 조회
 */
export async function getWeeklyRanking(genre?: string): Promise<WeeklyRankingWebtoon[]> {
  const whereClause: Record<string, any> = {};
  if (genre) {
    whereClause.genre = genre;
  }

  const webtoons = await Webtoon.findAll({
    where: whereClause,
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: ['idx', 'webtoonName', 'genre', ['views', 'weeklyViews']],
    order: [['views', 'DESC']],
    limit: 10,
  });

  return webtoons.map((w) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    artistName: w.Artist!.artistName,
    genre: w.genre,
    weeklyViews: (w as any).getDataValue('weeklyViews'),
  }));
}
