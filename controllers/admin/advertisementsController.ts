import { fn, col } from 'sequelize';
import db from '@/models';

export async function listAdvertisements() {
  return await db.Advertisement.findAll({
    attributes: [
      'idx',
      'adName',
      'adLocation',
      'status',
      'startDate',
      'endDate',
      'totalExposureLimit',
      [fn('COUNT', col('AdViewLogs.idx')), 'currentExposureCount'],
      'adImageUrl',
      'targetUrl',
      'adminId',
    ],
    include: [{ model: db.AdViewLog, attributes: [] }],
    group: ['Advertisement.idx'],
  });
}

export async function getAdvertisementById(id: number) {
  const ad = await db.Advertisement.findByPk(id);
  if (!ad) throw new Error('Not Found');
  return ad;
}

export interface AdvertisementInput {
  adName: string;
  adLocation: 'HOME' | 'EPISODE_BOTTOM' | 'SIDE_BANNER';
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  startDate: Date;
  endDate: Date | null;
  totalExposureLimit: number | null;
  currentExposureCount: number;
  adImageUrl: string;
  targetUrl: string;
  adminId: number;
}

export async function createAdvertisement(data: AdvertisementInput) {
  return await db.Advertisement.create(data);
}

export async function updateAdvertisement(id: number, data: Partial<AdvertisementInput>) {
  const ad = await db.Advertisement.findByPk(id);
  if (!ad) throw new Error('Not Found');
  return await ad.update(data);
}

export async function deleteAdvertisement(id: number) {
  const ad = await db.Advertisement.findByPk(id);
  if (!ad) throw new Error('Not Found');
  await ad.destroy();
}
