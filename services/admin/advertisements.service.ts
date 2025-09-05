// services/admin/advertisements.service.ts
import { httpGet } from './_http';

// 프런트에서 관리자와 광고에 대한 데이터 확장 인터페이스
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

//advertisements-view-logs.service.ts에 정의된 함수 리스트를 불러오는 export 함수
export const listAdvertisements = () => httpGet<AdminAdvertisement[]>('/api/admin/advertisements');
