import db from '@/models';
import { getSubscriptionStatusForList } from '@/controllers/subscription';

// Controller functions for managing artists and their webtoons

/**
 * Fetch a list of all artists
 */
export async function getArtistList() {
  return await db.ARTIST.findAll({
    attributes: ['idx', 'artistName', 'realName', 'artistEmail', 'debutDate'],
    order: [['artistName', 'ASC']],
    raw: true,
  });
}

/**
 * Create a new artist
 * @param data Artist creation payload
 * @param adminId ID of admin performing the action
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
  const newArtist = await db.ARTIST.create({
    realName: data.realName,
    artistName: data.artistName,
    artistPhone: data.artistPhone ?? '',
    artistEmail: data.artistEmail,
    webtoonList: data.webtoonList ?? '',
    debutDate: data.debutDate ?? new Date(),
    modifiedDate: new Date(),
    adminId,
  });
  return newArtist.get({ plain: true });
}

/**
 * Fetch a single artist by ID
 * @param artistId Artist's primary key
 */
export async function getArtistById(artistId: number) {
  return await db.ARTIST.findByPk(artistId, {
    attributes: [
      'idx',
      'realName',
      'artistName',
      'artistPhone',
      'artistEmail',
      'webtoonList',
      'debutDate',
      'modifiedDate',
    ],
    raw: true,
  });
}

/**
 * Update an existing artist
 * @param artistId Artist's primary key
 * @param data Fields to update
 * @param adminId ID of admin performing the action
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
  const artist = await db.ARTIST.findByPk(artistId);
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
 * Delete an artist by ID
 * @param artistId Artist's primary key
 */
export async function deleteArtist(artistId: number) {
  const artist = await db.ARTIST.findByPk(artistId);
  if (!artist) throw new Error('삭제할 작가가 존재하지 않습니다.');

  await artist.destroy();
  return;
}

/**
 * Fetch webtoons for a given artist, annotated with subscription status for a member
 * @param memberId ID of the member (for subscription checks)
 * @param artistId Artist's primary key
 */
export async function getArtistWebtoons(memberId: number, artistId: number) {
  // Retrieve raw list of webtoons
  const webtoons = (await db.WEBTOON.findAll({
    where: { artistIdx: artistId },
    attributes: [
      'idx',
      'webtoonName',
      'discription',
      'genre',
      'thumbnailUrl',
      'views',
      'recommend',
    ],
    order: [['webtoonName', 'ASC']],
    raw: true,
  })) as Array<{
    idx: number;
    webtoonName: string;
    discription: string;
    genre: string;
    thumbnailUrl: string;
    views: number;
    recommend: number;
  }>;

  // Check subscription status for these webtoons
  const ids = webtoons.map((w) => w.idx);
  const subsMap = await getSubscriptionStatusForList(memberId, ids);

  // Annotate and return
  return webtoons.map((w) => ({
    ...w,
    isSubscribed: subsMap.has(w.idx),
    alarmOn: subsMap.get(w.idx) ?? false,
  }));
}
