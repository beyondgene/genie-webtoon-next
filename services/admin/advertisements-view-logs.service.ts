// services/admin/advertisements-view-logs.service.ts
import { httpGet } from './_http';

// 프런트에서 광고 로그를 확정해서 데이터 타입을 정의하는 인터페이스
export interface AdViewLogItem {
  idx: number;
  memberId: number | null;
  adId: number;
  viewedAt: string;
}

// 광고 로그 리스트를 내보내는 함수
export const listAdViewLogs = async (adId: number): Promise<AdViewLogItem[]> => {
  const res = await httpGet<
    | AdViewLogItem[]
    | { data: AdViewLogItem[] }
    | { items: AdViewLogItem[] }
    | { logs: AdViewLogItem[] }
  >(`/api/advertisement/${adId}/view`);
  const data: any = (res as any)?.data ?? res;

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.logs)) return data.logs;

  // 혹시 드물게 { data: { items: [...] } } 형태면 추가 방어
  if ((res as any)?.data?.items && Array.isArray((res as any).data.items))
    return (res as any).data.items;
  if ((res as any)?.data?.logs && Array.isArray((res as any).data.logs))
    return (res as any).data.logs;

  return [];
};

// 프런트에서 광고 시청횟수 확장을 위한 데이터 타입 인터페이스
export interface AdStatByAd {
  adId: number;
  adName: string;
  views: number;
}

// 프런트에서 멤버가 광고를 시청한 상태 확장을 위한 데이터 타입 인터페이스
export interface AdStatByMember {
  memberId: number;
  label: string;
  views: number;
}

//광고 시청 상태를 불러오는 라우터를 호출하는 함수
export const getAdViewStats = () =>
  httpGet<{ byAd: AdStatByAd[]; byMember: AdStatByMember[] }>(
    `/api/admin/advertisements/[id]/view-logs`
  );
