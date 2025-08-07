import db from '@/models';

export async function listArtists() {
  return await db.Artist.findAll({
    attributes: [
      'idx',
      'realName',
      'artistName',
      'artistPhone',
      'artistEmail',
      'debutDate',
      'modifiedDate',
      'adminId',
    ],
  });
}

export interface ArtistInput {
  realName: string;
  artistName: string;
  artistPhone: string | null;
  artistEmail: string;
  debutDate: Date | null;
  modifiedDate?: Date;
  adminId: number;
}

export async function createArtist(data: ArtistInput) {
  return await db.Artist.create(data);
}

export async function getArtistById(id: number) {
  const artist = await db.Artist.findByPk(id);
  if (!artist) throw new Error('Not Found');
  return artist;
}

export async function updateArtist(id: number, data: Partial<ArtistInput>) {
  const artist = await db.Artist.findByPk(id);
  if (!artist) throw new Error('Not Found');
  return await artist.update(data);
}

export async function deleteArtist(id: number) {
  const artist = await db.Artist.findByPk(id);
  if (!artist) throw new Error('Not Found');
  await artist.destroy();
}
