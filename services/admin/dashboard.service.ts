// 관리자 대시보드 통계 존재시 작성할것
// services/admin/dashboard.service.ts
import { httpGet } from './_http';
import type { AdminWebtoon } from './webtoons.service';
import type { AdminEpisode } from './episodes.service';
import type { AdminAdvertisement } from './advertisements.service';
import type { AdminMember } from './members.service';
import type { ReportedComment } from './reported-comments.service';

export interface AdminDashboardData {
  counts: {
    webtoons: number;
    episodes: number;
    members: number;
    advertisements: number;
    reportedComments: number;
  };
  latest: {
    webtoons: AdminWebtoon[];
    episodes: AdminEpisode[];
    advertisements: AdminAdvertisement[];
    members: AdminMember[];
    reportedComments: ReportedComment[];
  };
}

/** 대시보드 데이터 수집(병렬 호출) */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const [webtoons, episodes, members, advertisements, reportedComments] = await Promise.all([
    httpGet<AdminWebtoon[]>('/api/admin/webtoons'),
    httpGet<AdminEpisode[]>('/api/admin/episodes'),
    httpGet<AdminMember[]>('/api/admin/members'),
    httpGet<AdminAdvertisement[]>('/api/admin/advertisements'),
    httpGet<ReportedComment[]>('/api/admin/comments/reported'),
  ]);

  // 최근 5개씩만 노출
  const pick5 = <T>(arr: T[]) => arr.slice(0, 5);

  return {
    counts: {
      webtoons: webtoons.length,
      episodes: episodes.length,
      members: members.length,
      advertisements: advertisements.length,
      reportedComments: reportedComments.length,
    },
    latest: {
      webtoons: pick5(webtoons),
      episodes: pick5(episodes),
      advertisements: pick5(advertisements),
      members: pick5(members),
      reportedComments: pick5(reportedComments),
    },
  };
}
