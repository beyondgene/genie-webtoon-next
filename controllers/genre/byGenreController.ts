// controllers/genre/byGenre.ts
import db from '@/models';

const { Webtoon, Genre } = db;

export interface GenreWebtoon {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  discription: string;
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
    attributes: ['idx', 'webtoonName', 'thumbnailUrl', 'discription'],
    order: [['idx', 'ASC']],
  });

  // Sequelize 인스턴스를 평문 객체로 변환
  return webtoons.map((w) => w.get({ plain: true })) as GenreWebtoon[];
}
