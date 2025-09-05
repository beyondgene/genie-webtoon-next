import db from '@/models';
// 작가 리스트 db에서 호출후 출력
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
// 프런트에서 작가 db 속성 받는 데이터 확장 인터페이스
export interface ArtistInput {
  realName: string;
  artistName: string;
  artistPhone: string | null;
  artistEmail: string;
  debutDate: Date | null;
  modifiedDate?: Date;
  adminId: number;
}
// 작가 생성
export async function createArtist(data: ArtistInput) {
  return await db.Artist.create(data);
}
// 작가 정보 idx로 불러오기
export async function getArtistById(id: number) {
  const artist = await db.Artist.findByPk(id);
  if (!artist) throw new Error('Not Found');
  return artist;
}
// 작가 정보 업데이트
export async function updateArtist(id: number, data: Partial<ArtistInput>) {
  const artist = await db.Artist.findByPk(id);
  if (!artist) throw new Error('Not Found');
  return await artist.update(data);
}
// 작가 삭제
export async function deleteArtist(id: number) {
  const artist = await db.Artist.findByPk(id);
  if (!artist) throw new Error('Not Found');
  await artist.destroy();
}
