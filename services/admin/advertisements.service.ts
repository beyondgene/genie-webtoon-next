// services/admin/advertisements.service.ts
import { httpGet } from './_http';

export interface AdminAdvertisement {
  idx: number;
  adName: string;
  adLocation: 'HOME' | 'EPISODE_BOTTOM' | 'SIDE_BANNER';
  status: 'ACTIVE' | 'INACTIVE';
  startDate: string;
  endDate: string;
  currentExposureCount: number;
  totalExposureLimit?: number;
}

export const listAdvertisements = () =>
  httpGet<AdminAdvertisement[]>('/api/(protected)/admin/advertisements');
