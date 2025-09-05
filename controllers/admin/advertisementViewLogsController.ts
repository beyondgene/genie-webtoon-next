import { fn, col, literal } from 'sequelize';
import db from '@/models';

export async function getAdvertisementViewLogsByAdId(adId: number) {
  return await db.AdViewLog.findAll({
    where: { adId },
    order: [['viewedAt', 'DESC']],
  });
}

/** 전체 광고 기준: 광고별 노출 수 집계 */
export async function getViewStatsByAd() {
  const rows = await db.AdViewLog.findAll({
    attributes: ['adId', [fn('COUNT', col('AdViewLog.idx')), 'views']],
    group: ['adId'],
    raw: true,
  });

  // 광고명 조인
  const ads = await db.Advertisement.findAll({ attributes: ['idx', 'adName'], raw: true });
  const nameMap = new Map<number, string>(ads.map((a: any) => [a.idx, a.adName]));

  return rows.map((r: any) => ({
    adId: r.adId as number,
    adName: nameMap.get(r.adId) ?? `AD#${r.adId}`,
    views: Number(r.views ?? 0),
  }));
}

/** 회원별 광고 시청 빈도 집계 (memberId NULL은 제외) */
export async function getViewStatsByMember() {
  const rows = await db.AdViewLog.findAll({
    attributes: ['memberId', [fn('COUNT', col('AdViewLog.idx')), 'views']],
    where: literal('memberId IS NOT NULL'),
    group: ['memberId'],
    raw: true,
  });

  const members = await db.Member.findAll({
    attributes: ['idx', 'nickname', 'memberId'],
    raw: true,
  });
  const nameMap = new Map<number, { nick: string; id: string }>(
    members.map((m: any) => [m.idx, { nick: m.nickname, id: m.memberId }])
  );

  return rows.map((r: any) => {
    const meta = nameMap.get(r.memberId);
    return {
      memberId: r.memberId as number,
      label: meta ? `${meta.nick}(${meta.id})` : `MEM#${r.memberId}`,
      views: Number(r.views ?? 0),
    };
  });
}
