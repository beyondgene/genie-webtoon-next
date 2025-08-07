// controllers/member/interestsController.ts

import db from '@/models';

export interface AuthorInterestDTO {
  artistIdx: number;
  artistName: string;
  profileImageUrl?: string;
  webtoonList: { idx: number; name: string; thumbnailUrl: string }[];
  interestedAt: string;
}

/**
 * 회원이 관심 등록한 작가 목록을 조회합니다.
 */
export async function listAuthorInterests(memberId: number): Promise<AuthorInterestDTO[]> {
  const items = await db.INTEREST.findAll({
    where: { memberId },
    include: [
      {
        model: db.Artist,
        attributes: ['idx', 'name', 'profileImageUrl'], // ERD 반영 예정 컬럼
        include: [{ model: db.Webtoon, attributes: ['idx', 'name', 'thumbnailUrl'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return items.map((i: any) => ({
    artistIdx: i.artistIdx,
    artistName: i.Artist.name,
    profileImageUrl: i.Artist.profileImageUrl ?? null,
    webtoonList: (i.Artist.Webtoons || []).map((w: any) => ({
      idx: w.idx,
      name: w.name,
      thumbnailUrl: w.thumbnailUrl,
    })),
    interestedAt: i.createdAt.toISOString(),
  }));
}

/**
 * 특정 작가에 대한 관심 등록 추가
 */
export async function addAuthorInterest(memberId: number, artistIdx: number): Promise<void> {
  await db.INTEREST.create({ memberId, artistIdx });
}

/**
 * 특정 작가에 대한 관심 해제
 */
export async function removeAuthorInterest(memberId: number, artistIdx: number): Promise<void> {
  const item = await db.INTEREST.findOne({ where: { memberId, artistIdx } });
  if (!item) throw new Error('등록된 관심 작가가 아닙니다.');
  await item.destroy();
}
