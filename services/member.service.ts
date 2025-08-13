// services/member.service.ts
import { api } from '@/lib/fetcher';
import type { MemberProfileDTO, SubscriptionDTO, ArtistDTO, WebtoonDTO } from '@/types/dto';

// 명확한 반환 타입 지정 (제네릭)
export async function getProfile() {
  return api.get<MemberProfileDTO>('/api/member/profile', {
    cache: 'no-store',
    next: { tags: ['member:profile'] }, // 캐시,태그
  });
}

/** 내 구독(=북마크) 목록 */
export async function getMySubscriptions() {
  return api.get<SubscriptionItem[]>('/api/member/subscriptions', {
    cache: 'no-store',
    next: { tags: ['member:bookmarks'] }, // 캐시,태그
  });
}

/** 북마크 구독 */
export async function subscribeBookmark(webtoonId: number) {
  return api.post(`/api/member/bookmarks/${webtoonId}`);
}

/** 북마크 알림 토글 */
export async function toggleBookmarkAlarm(webtoonId: number, alarmOn: boolean) {
  return api.patch(`/api/member/bookmarks/${webtoonId}`, { alarmOn });
}

/** 북마크 해지 */
export async function unsubscribeBookmark(webtoonId: number) {
  return api.delete(`/api/member/bookmarks/${webtoonId}`);
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
  return api.get<InterestItem[]>('/api/member/interests', {
    cache: 'no-store',
    next: { tags: ['member:interests'] }, // 캐시,태그
  });
}

/** 관심 작가 등록/해제 */
export async function addInterest(artistId: number) {
  return api.post(`/api/member/interests/${artistId}`);
}
export async function removeInterest(artistId: number) {
  return api.delete(`/api/member/interests/${artistId}`);
}

/** 프로필 업데이트(비밀번호 변경 포함) */
export type UpdateProfilePayload = Partial<
  Pick<MemberProfileDTO, 'nickname' | 'email' | 'phoneNumber' | 'address'>
> & {
  currentPassword?: string;
  newPassword?: string;
};

export async function updateProfile(
  payload: Partial<MemberProfileDTO> & {
    currentPassword?: string;
    newPassword?: string;
  }
) {
  return api.patch<MemberProfileDTO>('/api/member/profile/update', payload, {
    next: { tags: ['member:profile'] },
  });
}
