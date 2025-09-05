import db from '@/models';
import { Op } from 'sequelize';
//db의 웹툰 테이블에서 조회수를 기준으로 높은순 제한 20개로 각 작품들의 정보를 받아옴
export async function getTopByGenre(genre: string, limit = 20) {
  return db.Webtoon.findAll({
    where: { genre },
    order: [['views', 'DESC']],
    attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
    limit,
  });
}
// 사용자의 구독여부와 계정 상태에 따른 구독 추천 유무를 결정하는 컨트롤러
export async function getTasteRecommendations(memberId: number, limit = 10) {
  const subs = await db.Subscription.findAll({
    where: { memberId, status: 'ACTIVE' },
    attributes: ['webtoonId'],
    include: [{ model: db.Webtoon, attributes: ['genre'], required: false }],
  });
  const subscribedIds = subs.map((s: any) => s.webtoonId);
  const likedGenres = Array.from(new Set(subs.map((s: any) => s.Webtoon?.genre).filter(Boolean)));
  // 구독한 작품이 하나라도 있다면
  if (likedGenres.length > 0) {
    return db.Webtoon.findAll({
      where: {
        genre: { [Op.in]: likedGenres },
        ...(subscribedIds.length ? { idx: { [Op.notIn]: subscribedIds } } : {}),
      },
      order: [['views', 'DESC']],
      attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl'],
      limit,
    });
  }

  return db.Webtoon.findAll({
    order: [['views', 'DESC']],
    attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
    limit: 3,
  });
}
