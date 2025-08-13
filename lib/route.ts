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
    base: `${API_BASE}/(protected)/admin`,
    advertisements: `${API_BASE}/(protected)/admin/advertisements`,
    advertisementById: (id: number | string) =>
      `${API_BASE}/(protected)/admin/advertisements/${id}`,
    advertisementViewLogsById: (id: number | string) =>
      `${API_BASE}/(protected)/admin/advertisements/${id}/view-logs`,
    artists: `${API_BASE}/(protected)/admin/artists`,
    artistById: (id: number | string) => `${API_BASE}/(protected)/admin/artists/${id}`,
    webtoons: `${API_BASE}/(protected)/admin/webtoons`,
    episodes: `${API_BASE}/(protected)/admin/episodes`,
    comments: `${API_BASE}/(protected)/admin/comments`,
    reportedComments: `${API_BASE}/(protected)/admin/comments/reported`,
    members: `${API_BASE}/(protected)/admin/members`,
  },

  // Member (protected)
  member: {
    base: `${API_BASE}/(protected)/member`,
    profile: `${API_BASE}/(protected)/member/profile`,
    interests: `${API_BASE}/(protected)/member/interests`,
    bookmarks: `${API_BASE}/(protected)/member/bookmarks`,
    bookmarkByWebtoon: (webtoonId: number | string) =>
      `${API_BASE}/(protected)/member/bookmark/${webtoonId}`,
    subscriptions: `${API_BASE}/(protected)/member/subscriptions`,
  },

  // Domain (protected)
  artist: {
    list: `${API_BASE}/(protected)/artist`,
    detail: (id: number | string) => `${API_BASE}/(protected)/artist/${id}`,
  },
  webtoon: {
    list: `${API_BASE}/(protected)/webtoon`,
    detail: (id: number | string) => `${API_BASE}/(protected)/webtoon/${id}`,
    episodes: (id: number | string) => `${API_BASE}/(protected)/webtoon/${id}/episodes`,
  },
  episode: {
    list: `${API_BASE}/(protected)/episode`,
    detail: (id: number | string) => `${API_BASE}/(protected)/episode/${id}`,
  },
  comment: {
    list: `${API_BASE}/(protected)/comment`,
    byId: (id: number | string) => `${API_BASE}/(protected)/comment/${id}`,
    replies: (id: number | string) => `${API_BASE}/(protected)/comment/${id}/replies`,
    like: (id: number | string) => `${API_BASE}/(protected)/comment/${id}/like`,
    report: (id: number | string) => `${API_BASE}/(protected)/comment/${id}/report`,
  },
  advertisement: {
    list: `${API_BASE}/(protected)/advertisement`,
    byId: (id: number | string) => `${API_BASE}/(protected)/advertisement/${id}`,
    viewLog: (id: number | string) => `${API_BASE}/(protected)/advertisement/${id}/view-logs`,
    /** 과거 오타 호환(읽기전용) */
    _legacyAdvertisments: `${API_BASE}/(protected)/admin/advertisments`,
  },
  genre: {
    list: `${API_BASE}/(protected)/genre/list`,
    byName: (name: string) => `${API_BASE}/(protected)/genre/${name}`,
  },
  ranking: {
    base: `${API_BASE}/(protected)/ranking`,
    daily: (genre?: string) =>
      genre
        ? `${API_BASE}/(protected)/ranking/daily/${genre}`
        : `${API_BASE}/(protected)/ranking/daily`,
    weekly: (genre?: string) =>
      genre
        ? `${API_BASE}/(protected)/ranking/weekly/${genre}`
        : `${API_BASE}/(protected)/ranking/weekly`,
    monthly: (genre?: string) =>
      genre
        ? `${API_BASE}/(protected)/ranking/monthly/${genre}`
        : `${API_BASE}/(protected)/ranking/monthly`,
    yearly: (genre?: string) =>
      genre
        ? `${API_BASE}/(protected)/ranking/yearly/${genre}`
        : `${API_BASE}/(protected)/ranking/yearly`,
  },
  genieai: {
    recommendation: `${API_BASE}/(protected)/genieai/recommendation`,
    goldenBell: `${API_BASE}/(protected)/genieai/golden-bell`,
  },
} as const;
