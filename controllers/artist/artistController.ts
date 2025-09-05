import db from '@/models';
import { toBookmarkMap } from '@/controllers/member/bookmarksController';

// 작가와 해당 작가의 웹툰을 관리하는 컨트롤러 함수들

/**
 * 모든 작가 목록 조회
 */
export async function getArtistList() {
  return await db.Artist.findAll({
    attributes: ['idx', 'artistName', 'realName', 'artistEmail', 'debutDate'],
    order: [['artistName', 'ASC']],
    raw: true,
  });
}

/**
 * 새로운 작가 생성
 * @param data 작가 생성 데이터
 * @param adminId 작업을 수행하는 관리자 ID
 */
export async function createArtist(
  data: {
    realName: string;
    artistName: string;
    artistPhone?: string;
    artistEmail: string;
    webtoonList?: string;
    debutDate?: Date;
  },
  adminId: number
) {
  const newArtist = await db.Artist.create({
    realName: data.realName,
    artistName: data.artistName,
    artistPhone: data.artistPhone ?? '',
    artistEmail: data.artistEmail,
    webtoonList: data.webtoonList ?? '',
    debutDate: data.debutDate ?? new Date(),
    adminId,
  });
  return newArtist.get({ plain: true });
}

/**
 * ID로 단일 작가 조회
 * @param artistId 작가의 기본 키
 */
export async function getArtistById(artistId: number) {
  return await db.Artist.findByPk(artistId, {
    attributes: [
      'idx',
      'realName',
      'artistName',
      'artistPhone',
      'artistEmail',
      'webtoonList',
      'debutDate',
    ],
    raw: true,
  });
}

/**
 * 기존 작가 정보 업데이트
 * @param artistId 작가의 기본 키
 * @param data 업데이트할 필드들
 * @param adminId 작업을 수행하는 관리자 ID
 */
export async function updateArtist(
  artistId: number,
  data: Partial<{
    realName: string;
    artistName: string;
    artistPhone: string;
    artistEmail: string;
    webtoonList: string;
    debutDate: Date;
  }>,
  adminId: number
) {
  const artist = await db.Artist.findByPk(artistId);
  if (!artist) throw new Error('작가가 존재하지 않습니다.');

  const updateFields = {
    ...data,
    modifiedDate: new Date(),
    adminId,
  };
  await artist.update(updateFields);
  return artist.get({ plain: true });
}

/**
 * ID로 작가 삭제
 * @param artistId 작가의 기본 키
 */
export async function deleteArtist(artistId: number) {
  const artist = await db.Artist.findByPk(artistId);
  if (!artist) throw new Error('삭제할 작가가 존재하지 않습니다.');

  await artist.destroy();
  return;
}

/**
 * 특정 작가의 웹툰 목록을 회원의 구독 상태와 함께 조회
 * @param memberId 회원 ID (구독 확인용)
 * @param artistId 작가의 기본 키
 */
export async function getArtistWebtoons(memberId: number, artistId: number) {
  // 웹툰 목록 조회
  const webtoons = (await db.Webtoon.findAll({
    where: { artistId: artistId },
    attributes: [
      'idx',
      'webtoonName',
      'description',
      'genre',
      'wbthumbnailUrl',
      'views',
      'recommend',
    ],
    order: [['webtoonName', 'ASC']],
    raw: true,
  })) as Array<{
    idx: number;
    webtoonName: string;
    description: string;
    genre: string;
    wbthumbnailUrl: string;
    views: number;
    recommend: number;
  }>;

  // ✅ 수정: 직접 DB에서 구독 정보 조회
  const webtoonIds = webtoons.map((w) => w.idx);

  const subs = await db.Subscription.findAll({
    where: {
      memberId,
      webtoonId: webtoonIds,
      status: 'ACTIVE',
    },
    attributes: ['webtoonId', 'alarm_on'],
    raw: true,
  });

  // BookmarkStatus 타입에 맞게 변환 후 Map으로 변환
  const bookmarkStatuses = subs.map((sub: any) => ({
    webtoonId: sub.webtoonId,
    isSubscribed: true,
    alarmOn: !!sub.alarm_on,
  }));

  const subsMap = toBookmarkMap(bookmarkStatuses);

  // 구독 정보를 포함하여 반환 (기존 has/get 사용 패턴 유지)
  return webtoons.map((w) => ({
    ...w,
    isSubscribed: subsMap.has(w.idx),
    alarmOn: subsMap.get(w.idx)?.alarmOn ?? false,
  }));
}
