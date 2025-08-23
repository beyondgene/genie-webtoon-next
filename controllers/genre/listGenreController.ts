// controllers/genre/genreController.ts
import db from '@/models';

/** Webtoon.genre ENUM 값을 안전하게 추출 */
function getGenreEnumValues(): string[] {
  const WebtoonAny = db.Webtoon as any;
  const attr = WebtoonAny?.rawAttributes?.genre ?? WebtoonAny?.getAttributes?.().genre ?? undefined;

  const values = attr?.values ?? attr?.options?.values ?? [];
  return Array.isArray(values) ? values : [];
}

/**
 * 기존에 res.json을 쓰는 형태였다면 그대로 동작합니다.
 * (Next.js Response를 반환하는 형태였다면 호출부에서 JSON을 그대로 사용하세요.)
 */
export async function getGenreList(req?: any, res?: any) {
  const genres = getGenreEnumValues();

  // Express/Next API Route 스타일(res 사용)
  if (res?.json) {
    return res.status(200).json({ items: genres, genres });
  }

  // App Router 스타일(데이터만 반환)
  return { items: genres, genres };
}

// 기존에 default export를 쓰고 있었다면 유지
export default { getGenreList };
