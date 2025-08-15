// services/admin/advertisement-view-logs.service.ts
import { API_BASE } from './_http';

export interface AdViewLog {
  idx: number;
  viewedAt: string;
  memberId: number | null;
}

export async function listAdViewLogs(adId: number): Promise<AdViewLog[]> {
  const res = await fetch(`${API_BASE}/api/admin/advertisements/${adId}/view-logs`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(
      `GET /admin/advertisements/${adId}/view-logs failed: ${res.status} ${await res.text()}`
    );
  }
  return res.json();
}
