//API DTO (models.zip 타입과 호환)
// types/dto.ts
// models.zip & ERD 기준의 DTO(전달 전용 타입) 모음
// 서비스 계층/컴포넌트에서 사용하기 쉬운 형태로 정규화했습니다.

export type ID = number;

/** 공통 UTC ISO 문자열 타임스탬프 */
export interface Timestamps {
  createdAt?: string;
  updatedAt?: string;
}

/** 장르 — Webtoon 모델 정의와 일치 */
export type Genre =
  | 'DRAMA'
  | 'ROMANCE'
  | 'FANTASY'
  | 'ACTION'
  | 'LIFE'
  | 'GAG'
  | 'SPORTS'
  | 'THRILLER'
  | 'HISTORICAL';

/** 성별 — Member 모델 정의와 일치 */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/** 광고 위치/상태 — Advertisement 모델 정의와 일치 (참고용) */
export type AdLocation = 'HOME' | 'EPISODE_BOTTOM' | 'SIDE_BANNER';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED';

/** 구독 상태 — Subscription 모델 정의와 일치 */
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE';

/** 댓글 평가 상태 — Comment 모델 정의와 일치 */
export type LikeStatus = 'LIKE' | 'DISLIKE' | 'NONE';

/** 페이지네이션 공통 */
export interface PageMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

/** 작가 요약 */
export interface ArtistSummaryDTO {
  idx: ID;
  artistName: string;
}

/** 작가 상세 */
export interface ArtistDTO extends Timestamps {
  idx: ID;
  realName: string;
  artistName: string;
  artistPhone?: string | null;
  artistEmail: string;
  debutDate?: string | null;
  adminId: ID;
}

/** 웹툰 기본(목록/상세 공통) */
export interface WebtoonDTO extends Timestamps {
  idx: ID;
  webtoonName: string;
  /** ERD 오탈자(discription) 방지 — 우리 쪽은 description으로 통일 */
  description: string;
  genre: Genre;
  views: number;
  recommend: number;
  adminId?: ID;
  artistId?: ID;
  /** UI 용 썸네일 — 모델에 없을 수 있어 optional, 서비스에서 매핑 */
  wbthumbnailUrl?: string | null;
  /** 필요 시 함께 내려주는 작가 요약 */
  artist?: ArtistSummaryDTO;
}

/** 회차(에피소드) */
export interface EpisodeDTO {
  idx: ID;
  title: string;
  /**
   * 모델은 thumbnail_url(snake) 이지만 프런트는 camelCase 사용.
   * 서비스 계층에서 키 변환하여 이 필드로 맞춰 주세요.
   */
  epthumbnailUrl: string;
  uploadDate: string; // ISO
  webtoonId: ID;
  adId?: ID | null;
  adminId?: ID;
}

/** 댓글 */
export interface CommentDTO {
  idx: ID;
  memberId: ID;
  webtoonId: ID;
  episodeId: ID;
  /** 실사용 필드 — 모델 정의에 없다면 서비스에서 주입 */
  content?: string;
  /** ERD는 상태(enum)였으나 UI에선 카운트가 필요할 수 있어 옵션 제공 */
  likes?: LikeStatus;
  likeCount?: number;
  dislikeCount?: number;
  createdAt?: string; // creationDate 매핑
  updatedAt?: string; // modifiedDate 매핑
  adminId?: ID | null;
}

/** 구독/알림 요약 — 목록/상세에서 자주 함께 내려줌 */
export interface SubscriptionSummaryDTO {
  isSubscribed: boolean;
  alarmOn: boolean;
  status?: SubscriptionStatus;
}

/** (예) 에피소드 목록 응답 형태 — 서비스 시그니처에 맞춤 */
export interface EpisodeListItemDTO {
  idx: ID;
  title: string;
  epthumbnailUrl: string;
  uploadDate: string;
}
export interface EpisodeListResponseDTO {
  episodes: EpisodeListItemDTO[];
  subscription: SubscriptionSummaryDTO;
}

/** 랭킹 관련 */
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RankingItemDTO {
  rank: number;
  webtoonId: ID;
  webtoonName: string;
  views: number; // 기준값(일/주/월/연)
  genre: Genre;
  thumbnailUrl?: string; // 카드 UI용
  artistName?: string; // 목록에서 함께 표시
  change?: number; // 전일/전주 대비 순위 변동 (옵션)
}

export interface RankingResponseDTO {
  period: RankingPeriod;
  /** 장르별 랭킹일 경우 지정 */
  genre?: Genre;
  generatedAt: string;
  items: RankingItemDTO[];
}

/** 광고 DTO */
export interface AdvertisementDTO extends Timestamps {
  idx: ID;
  adName: string; // 광고 이름
  advertiserName: string; // 광고주 이름
  location: AdLocation; // 광고 위치 (HOME, EPISODE_BOTTOM, SIDE_BANNER)
  status: AdStatus; // 광고 상태 (ACTIVE, PAUSED, EXPIRED)
  startDate: string; // 광고 시작일 (ISO)
  endDate: string; // 광고 종료일 (ISO)
  totalExposureLimit?: number | null;
  currentExposureCount?: number | null;
  adImageUrl?: string | null;
  targetUrl?: string | null;
  adminId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 관리자 역할 사전정의
export type AdminRole = 'SUPER' | 'MANAGER';

/** 관리자 DTO */
export interface AdminDTO extends Timestamps {
  idx: ID;
  adminId: string; // 관리자 로그인 ID
  name: string; // 관리자 이름
  email: string;
  phoneNumber?: string | null;
  role: AdminRole; // SUPER | MANAGER
  status: 'ACTIVE' | 'INACTIVE'; // 계정 상태
}

/** 구독 DTO */
export interface SubscriptionDTO extends Timestamps {
  idx: ID;
  memberId: ID; // 구독한 회원 idx
  webtoonId: ID; // 구독한 웹툰 idx
  alarmOn: boolean; // 알람 설정 여부
  status: SubscriptionStatus; // ACTIVE | INACTIVE
  createdAt?: string;
  updatedAt?: string;
}

/** 광고 조회 로그 DTO */
export interface AdViewLogDTO extends Timestamps {
  idx: ID;
  advertisementId: ID; // 광고 idx
  memberId?: ID | null; // 로그인한 회원이면 idx, 아니면 null
  viewedAt: string; // 조회 시각 (ISO)
  ipAddress?: string; // 접속자 IP
  userAgent?: string; // 브라우저 User-Agent
}

// Member
export interface MemberProfileDTO {
  idx: number;
  memberId: string;
  nickname: string;
  name?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phoneNumber?: string;
  address?: string;
  status?: 'ACTIVE' | 'DELETED';
  adminId?: number;
  createdAt?: string;
  updatedAt?: string;
}
