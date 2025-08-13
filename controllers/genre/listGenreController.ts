// controllers/genre/list.ts
import db from '@/models';

const { Genre } = db;

/**
 * 전체 장르 이름 목록을 반환합니다.
 * - ERD: Genre 테이블의 name 컬럼 조회
 */
export async function getGenreList(): Promise<string[]> {
  const genres = (await Genre.findAll({
    attributes: ['name'],
    order: [['name', 'ASC']],
    raw: true, // ← 핵심: 평문 객체로 받기
    nest: true, // 선택: include 사용 시 평탄화 방지
  })) as { name: string }[]; // 결과 타입을 명시해 TS7006 방지

  return genres.map((g) => g.name);
}
