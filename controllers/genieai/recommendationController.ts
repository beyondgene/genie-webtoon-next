import db from '@/models';
import { Op } from 'sequelize';

export async function getTopByGenre(genre: string, limit = 20) {
  return db.Webtoon.findAll({
    where: { genre },
    order: [['views', 'DESC']],
    attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
    limit,
  });
}

export async function getTasteRecommendations(memberId: number, limit = 10) {
  const subs = await db.Subscription.findAll({
    where: { memberId, status: 'ACTIVE' },
    attributes: ['webtoonId'],
    include: [{ model: db.Webtoon, attributes: ['genre'], required: false }],
  });
  const subscribedIds = subs.map((s: any) => s.webtoonId);
  const likedGenres = Array.from(new Set(subs.map((s: any) => s.Webtoon?.genre).filter(Boolean)));

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
