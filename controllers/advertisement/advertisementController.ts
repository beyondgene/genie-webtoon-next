// controllers/advertisementController.ts
import db from '@/models';
import { Op, col, where } from 'sequelize';

const { Advertisement } = db;

export interface CreateAdInput {
  imageUrl: string;
  linkUrl: string;
  position: 'HOME' | 'EPISODE_BOTTOM' | 'SIDE_BANNER';
  priority: number;
  adName?: string;
  startDate?: Date;
  endDate?: Date;
  totalExposureLimit?: number | null;
  currentExposureCount?: number; // ✅ camelCase로 사용
}

export type DetailAdDTO = {
  idx: number;
  adName: string | null;
  targetUrl: string | null;
  adImageUrl?: string | null;
};

export async function getAdById(id: number): Promise<DetailAdDTO | null> {
  const ad = await Advertisement.findByPk(id, {
    attributes: ['idx', 'adName', 'targetUrl', 'adImageUrl'],
    raw: true,
  });
  if (!ad) return null;
  return {
    idx: ad.idx,
    adName: ad.adName ?? null,
    targetUrl: ad.targetUrl ?? null,
    adImageUrl: (ad as any).adImageUrl ?? null,
  };
}

/** 현재 노출 가능한 광고 목록 */
export async function getActiveAds() {
  const now = new Date();
  return Advertisement.findAll({
    where: {
      status: 'ACTIVE',
      startDate: { [Op.lte]: now },
      endDate: { [Op.gte]: now },
      // ✅ 컬럼-컬럼 비교는 where(col, Op, col)로 처리 (객체 키에 snake_case 금지)
      [Op.or]: [
        { totalExposureLimit: null },
        where(col('current_exposure_count'), Op.lt, col('total_exposure_limit')),
      ],
    },
    order: [['priority', 'DESC']],
  });
}

/** 신규 광고 생성 */
export async function createAd(input: CreateAdInput) {
  const {
    imageUrl,
    linkUrl,
    position,
    priority,
    adName = '',
    startDate = new Date(),
    endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    totalExposureLimit = 0,
    currentExposureCount = 0,
  } = input;

  return Advertisement.create({
    adName,
    adLocation: position, // 'HOME' | 'EPISODE_BOTTOM' | 'SIDE_BANNER'
    adImageUrl: imageUrl,
    targetUrl: linkUrl,
    status: 'ACTIVE',
    startDate,
    endDate,
    totalExposureLimit,
    currentExposureCount, // ✅ camelCase로 넣기
    priority,
  } as any);
}
