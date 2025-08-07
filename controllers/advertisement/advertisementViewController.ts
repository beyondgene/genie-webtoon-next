// controllers/advertisementViewController.ts

import db from '@/models';

const { AdViewLog, Advertisement, Member } = db;

/**
 * 광고 클릭 시 로그 생성 및 노출 카운트 증가
 */
export async function logAdView(memberId: number, adId: number) {
  const log = await AdViewLog.create({
    memberId,
    adId,
    viewed_at: new Date(),
  });
  await Advertisement.increment('current_exposure_count', {
    by: 1,
    where: { idx: adId },
  });
  return log;
}

/**
 * 특정 광고의 조회 로그 목록 조회 (관리자 전용)
 */
export async function getAdViewLogs(adId: number) {
  return await AdViewLog.findAll({
    where: { adId },
    include: [{ model: Member, attributes: ['idx', 'nickname'] }],
    order: [['viewed_at', 'DESC']],
  });
}
