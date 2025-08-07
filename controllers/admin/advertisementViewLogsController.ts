import db from '@/models';

export async function getAdvertisementViewLogsByAdId(adId: number) {
  return await db.AdViewLog.findAll({
    where: { adId },
    order: [['viewedAt', 'DESC']],
  });
}
