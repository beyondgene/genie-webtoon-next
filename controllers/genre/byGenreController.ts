// controllers/genre/byGenre.ts
import db from '@/models';

const { Webtoon, Genre } = db;

export interface GenreWebtoon {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  description: string;
}

/**
 * 주어진 장르 이름에 속하는 웹툰 목록을 반환합니다.
 * - ERD: Webtoon–Genre 다대다 관계를 조인
 * - 반환 필드: idx, webtoonName, thumbnailUrl, discription
 */
export async function getWebtoonsByGenre(genreName: string): Promise<GenreWebtoon[]> {
  const webtoons = await Webtoon.findAll({
    include: [
      {
        model: Genre,
        where: { name: genreName },
        attributes: [],
        through: { attributes: [] },
      },
    ],
    attributes: ['idx', 'webtoonName', 'thumbnailUrl', 'description'],
    order: [['idx', 'ASC']],
    raw: true, // ← 핵심
    nest: true, // (선택) include 시 평탄화 방지
  });

  return webtoons as GenreWebtoon[];
}
