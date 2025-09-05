// services/member.service.ts
import { api } from '@/lib/fetcher';
import type { MemberProfileDTO } from '@/types/dto';

// 프런트 내부에서 쓰는 확정된 구독 타입
export type SubscriptionItemDTO = {
  webtoonId: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  alarmOn: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  subscribedAt: string;
  updatedAt: string;
};

// 명확한 반환 타입 지정 (제네릭)
export async function getProfile() {
  return api.get<MemberProfileDTO>('/api/member/profile', {
    cache: 'no-store',
    next: { tags: ['member:profile'] },
  });
}

/** 내 구독(=북마크) 목록 */
export async function getMySubscriptions() {
  const r = await api.get<{ subscriptions: SubscriptionItemDTO[] }>('/api/member/bookmarks', {
    cache: 'no-store',
  });
  return r.subscriptions;
}

/** 북마크 구독 */
export async function subscribeBookmark(webtoonId: number) {
  return api.post(`/api/member/bookmarks/${webtoonId}`);
}

/** 북마크 알림 토글 */
export async function toggleBookmarkAlarm(webtoonId: number, alarm: boolean) {
  return api.patch<{ message: string; alarmOn: boolean }>(`/api/member/bookmarks/${webtoonId}`, {
    alarm,
  });
}

/** 북마크 해지 */
export async function unsubscribeBookmark(webtoonId: number) {
  return api.delete<{ message: string }>(`/api/member/bookmarks/${webtoonId}`);
}

/** 관심 작가 목록 */
export type InterestItem = {
  artistIdx: number;
  artistName: string;
  webtoonList?: string | null;
  interestedAt: string; // ISO
};

// (신규/확인) 북마크(구독) 아이템 타입
export type SubscriptionItem = {
  webtoonId: number;
  alarmOn: boolean;
};

export async function getMyInterests() {
  return api.get<any[]>('/api/member/interests', { cache: 'no-store' });
}

/** 관심 작가 등록/해제 */
export async function addInterest(artistId: number) {
  return api.post(`/api/member/interests/${artistId}`);
}
export async function removeInterest(artistId: number) {
  return api.delete(`/api/member/interests/${artistId}`);
}

/** 프로필 업데이트(비밀번호 변경 포함) */
export type UpdateProfilePayload = Partial<MemberProfileDTO> & {
  currentPassword?: string;
  newPassword?: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  return api.patch<MemberProfileDTO>('/api/member/profile/update', payload, {
    next: { tags: ['member:profile'] },
  });
}
