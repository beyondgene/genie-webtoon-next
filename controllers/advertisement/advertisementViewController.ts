// controllers/advertisement/advertisementViewController.ts
import db from '@/models';
const { AdViewLog, Advertisement, Member } = db;

// 광고 노출/클릭 시 로그 생성 + 노출 카운트 증가
export async function logAdView(memberId: number, adId: number) {
  const log = await AdViewLog.create({
    memberId,
    adId,
    viewedAt: new Date(),
  });

  await Advertisement.increment('currentExposureCount', {
    by: 1,
    where: { idx: adId },
  });

  return log;
}

// 특정 광고 조회 로그 (관리자 전용)
export async function getAdViewLogs(adId: number) {
  return await AdViewLog.findAll({
    where: { adId },
    include: [{ model: Member, attributes: ['idx', 'nickname'] }],
    // ✅ 정렬 키 camelCase: viewedAt
    order: [['viewedAt', 'DESC']],
  });
}
