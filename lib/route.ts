// # 화면/링크 경로 상수
/**
 * API 경로 상수 & 빌더
 * - App Router: app/api/... → 클라이언트 접근 경로는 /api/...
 * - 프로젝트 규칙 반영:
 *   - (public)/(protected) 그룹 사용
 *   - user → member 로 명칭 통일
 *   - ranking: daily/weekly/monthly/yearly + [genre]
 *   - recommendation → /genieai, chatbot 제거
 *   - advertisements 철자만 사용(과거 오타 compat 제공)
 */
export const API_BASE = '/api';

export const routes = {
  // Auth (public)
  auth: {
    signIn: `${API_BASE}/auth/signin`,
    signOut: `${API_BASE}/auth/signout`,
    signUp: `${API_BASE}/auth/signup`,
    verifyEmail: `${API_BASE}/auth/verify-email`,
    session: `${API_BASE}/auth/session`,
  },

  // Admin (protected)
  admin: {
    base: `${API_BASE}/admin`,
    advertisements: `${API_BASE}/admin/advertisements`,
    advertisementById: (id: number | string) => `${API_BASE}/admin/advertisements/${id}`,
    advertisementViewLogsById: (id: number | string) =>
      `${API_BASE}/admin/advertisements/${id}/view-logs`,
    artists: `${API_BASE}/admin/artists`,
    artistById: (id: number | string) => `${API_BASE}/admin/artists/${id}`,
    webtoons: `${API_BASE}/admin/webtoons`,
    episodes: `${API_BASE}/admin/episodes`,
    comments: `${API_BASE}/admin/comments`,
    reportedComments: `${API_BASE}/admin/comments/reported`,
    members: `${API_BASE}/admin/members`,
  },

  // Member (protected)
  member: {
    base: `${API_BASE}/member`,
    profile: `${API_BASE}/member/profile`,
    interests: `${API_BASE}/member/interests`,
    bookmarks: `${API_BASE}/member/bookmarks`,
    bookmarkByWebtoon: (webtoonId: number | string) => `${API_BASE}/member/bookmark/${webtoonId}`,
    subscription: `${API_BASE}/member/subscription`,
    subscriptionByWebtoon: (webtoonId: number | string) =>
      `${API_BASE}/member/subscription/${webtoonId}`,
    subscriptionAlarm: (webtoonId: number | string) =>
      `${API_BASE}/member/subscription/${webtoonId}/alarm`,
  },

  // Domain (protected)
  artist: {
    list: `${API_BASE}/artist`,
    detail: (id: number | string) => `${API_BASE}/artist/${id}`,
  },
  webtoon: {
    list: `${API_BASE}/webtoon`,
    detail: (id: number | string) => `${API_BASE}/webtoon/${id}`,
    episodes: (id: number | string) => `${API_BASE}/webtoon/${id}/episodes`,
  },
  episode: {
    list: `${API_BASE}/episode`,
    detail: (id: number | string) => `${API_BASE}/episode/${id}`,
  },
  comment: {
    list: `${API_BASE}/comment`,
    byId: (id: number | string) => `${API_BASE}/comment/${id}`,
    replies: (id: number | string) => `${API_BASE}/comment/${id}/replies`,
    like: (id: number | string) => `${API_BASE}/comment/${id}/like`,
    report: (id: number | string) => `${API_BASE}/comment/${id}/report`,
  },
  advertisement: {
    list: `${API_BASE}/advertisement`,
    byId: (id: number | string) => `${API_BASE}/advertisement/${id}`,
    viewLog: (id: number | string) => `${API_BASE}/advertisement/${id}/view-logs`,
    /** 과거 오타 호환(읽기전용) */
    _legacyAdvertisments: `${API_BASE}/admin/advertisments`,
  },
  genre: {
    list: `${API_BASE}/genre/list`,
    byName: (name: string) => `${API_BASE}/genre/${name}`,
  },
  ranking: {
    base: `${API_BASE}/ranking`,
    daily: (genre?: string) =>
      genre ? `${API_BASE}/ranking/daily/${genre}` : `${API_BASE}/ranking/daily`,
    weekly: (genre?: string) =>
      genre ? `${API_BASE}/ranking/weekly/${genre}` : `${API_BASE}/ranking/weekly`,
    monthly: (genre?: string) =>
      genre ? `${API_BASE}/ranking/monthly/${genre}` : `${API_BASE}/ranking/monthly`,
    yearly: (genre?: string) =>
      genre ? `${API_BASE}/ranking/yearly/${genre}` : `${API_BASE}/ranking/yearly`,
  },
  genieai: {
    recommendation: `${API_BASE}/genieai/recommendation`,
    goldenBell: `${API_BASE}/genieai/golden-bell`,
    goldenBellByWebtoon: (webtoonId: number | string) =>
      `${API_BASE}/genieai/golden-bell/${webtoonId}`,
  },
} as const;
