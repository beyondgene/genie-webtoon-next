// controllers/genre/byGenreController.ts
import db from '@/models';

/** Webtoon.genre ENUM 값을 안전하게 추출 */
function getGenreEnumValues(): string[] {
  const WebtoonAny = db.Webtoon as any;
  const attr = WebtoonAny?.rawAttributes?.genre ?? WebtoonAny?.getAttributes?.().genre ?? undefined;

  const values = attr?.values ?? attr?.options?.values ?? [];
  return Array.isArray(values) ? values : [];
}

/**
 * params 또는 query로 들어온 genre를 받아 해당 장르의 웹툰 목록을 반환
 * - 정렬은 기존 로직을 크게 해치지 않도록 조회수/idx 기준 예시를 둡니다.
 * - 응답 형태는 기존(res.json) 또는 데이터 반환 두 가지 모두 지원.
 */
export async function getWebtoonsByGenre(req?: any, res?: any) {
  const raw =
    req?.params?.genre ??
    req?.query?.genre ??
    req?.nextUrl?.searchParams?.get?.('genre') ??
    undefined;

  const genre = typeof raw === 'string' ? raw : '';

  const allowed = getGenreEnumValues();
  if (!allowed.includes(genre)) {
    const payload = { message: 'Invalid genre', allowed };
    if (res?.json) return res.status(400).json(payload);
    return payload; // App Router라면 호출부에서 상태코드 처리
  }

  // 기존 메인 로직 유지: 장르 조건으로 Webtoon 조회
  const items = await db.Webtoon.findAll({
    where: { genre },
    order: [
      // 기존에 조회수/추천/업데이트순 등을 쓰고 있었다면 이 순서만 보정하세요.
      ['views', 'DESC'],
      ['idx', 'ASC'],
    ],
    // 필요 시 include/attributes 추가
  });

  if (res?.json) return res.status(200).json({ items });
  return { items };
}

// 기존에 default export를 쓰고 있었다면 유지
export default { getWebtoonsByGenre };
