import { Webtoon } from '@/models/webtoon';
import { Artist } from '@/models/artist';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

// 프런트에서 연간랭킹 웹툰 데이터 셋을 확장할 수 있도록한 인터페이스셋
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
  //db의 웹툰 테이블에서 작가이름을 기반으로 속성들을 검색하여 총 10개를 제한으로 값을 반환
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
