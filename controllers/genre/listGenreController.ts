// controllers/genre/list.ts
import db from '@/models';

const { Genre } = db;

/**
 * 전체 장르 이름 목록을 반환합니다.
 * - ERD: Genre 테이블의 name 컬럼 조회
 */
export async function getGenreList(): Promise<string[]> {
  const genres = await Genre.findAll({
    attributes: ['name'],
    order: [['name', 'ASC']],
  });

  return genres.map((g) => g.name);
}
