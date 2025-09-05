import { httpGet } from './_http';

//프런트에서 구독에 대한 관리자의 타입 확장 인터페이스
export interface AdminSubscription {
  idx: number;
  status: string;
  alarm_on: 0 | 1;
  memberId: number;
  webtoonId: number;
  createdAt?: string;
  updatedAt?: string;
}

//구독 리스트 라우터를 불러오는 export 함수
export const listSubscriptions = () => httpGet<AdminSubscription[]>('/api/admin/subscriptions');
