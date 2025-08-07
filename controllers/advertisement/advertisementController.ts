// controllers/advertisementController.ts

import { Op } from 'sequelize';
import db from '@/models';

const { Advertisement } = db;

export interface CreateAdInput {
  imageUrl: string;
  linkUrl: string;
  position: string;
  priority: number;
  adName?: string;
  startDate?: Date;
  endDate?: Date;
  totalExposureLimit?: number;
}

/**
 * 현재 노출 가능한 광고만 조회합니다.
 * - status = 'ACTIVE'
 * - start_date ≤ now ≤ end_date
 * - current_exposure_count < total_exposure_limit
 * - priority 내림차순 정렬
 */
export async function getActiveAds() {
  const now = new Date();
  return await Advertisement.findAll({
    where: {
      status: 'ACTIVE',
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
      current_exposure_count: { [Op.lt]: db.Sequelize.col('total_exposure_limit') },
    },
    order: [['priority', 'DESC']],
  });
}

/**
 * 신규 광고 생성
 */
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
  } = input;

  return await Advertisement.create({
    ad_name: adName,
    ad_location: position,
    ad_image_url: imageUrl,
    target_url: linkUrl,
    priority,
    status: 'ACTIVE',
    start_date: startDate,
    end_date: endDate,
    total_exposure_limit: totalExposureLimit,
    current_exposure_count: 0,
    // adminId: requireAdminAuth 미들웨어에서 주입
  });
}

/**
 * 광고 부분 업데이트
 */
export async function updateAd(id: number, data: Partial<typeof Advertisement.prototype>) {
  const [count, [updated]] = await Advertisement.update(data, {
    where: { idx: id },
    returning: true,
  });
  if (count === 0) {
    throw new Error(`광고(id=${id})를 찾을 수 없습니다.`);
  }
  return updated;
}

/**
 * 광고 삭제
 */
export async function deleteAd(id: number) {
  const count = await Advertisement.destroy({ where: { idx: id } });
  if (count === 0) {
    throw new Error(`광고(id=${id})를 찾을 수 없습니다.`);
  }
}
