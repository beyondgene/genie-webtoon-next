import { Webtoon } from '@/models/webtoon';
import { Artist } from '@/models/artist';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

export interface DailyRankingWebtoon {
  idx: number;
  webtoonName: string;
  artistName: string;
  genre: string;
  dailyViews: number;
}

/**
 * 일간 랭킹 조회
 * @param genre 선택적 장르 필터 (없으면 전체)
 */
export async function getDailyRanking(genre?: string): Promise<DailyRankingWebtoon[]> {
  const whereClause: Record<string, any> = {};
  if (genre) {
    whereClause.genre = genre;
  }

  const webtoons = await Webtoon.findAll({
    where: whereClause,
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: [
      'idx',
      'webtoonName',
      'genre',
      // 기존 누적 views를 일간 views로 alias
      ['views', 'dailyViews'],
    ],
    order: [['views', 'DESC']],
    limit: 10,
  });

  return webtoons.map((w) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    artistName: w.Artist!.artistName,
    genre: w.genre,
    dailyViews: (w as any).getDataValue('dailyViews'),
  }));
}
