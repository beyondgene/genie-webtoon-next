import db from '@/models';
// 웹툰 리스트 db에서 불러오기
export async function listWebtoons() {
  return await db.Webtoon.findAll({
    include: [{ model: db.Artist, attributes: ['idx', 'artistName'] }],
  });
}
// 프런트에서 웹툰 입력시 필요한 정보 확장 인터페이스
export interface WebtoonInput {
  webtoonName: string;
  description: string;
  genre:
    | 'DRAMA'
    | 'ROMANCE'
    | 'FANTASY'
    | 'ACTION'
    | 'LIFE'
    | 'GAG'
    | 'SPORTS'
    | 'THRILLER'
    | 'HISTORICAL';
  artistId: number;
  adminId: number;
  wbthumbnailUrl?: string;
}
// 웹툰 생성하기
export async function createWebtoon(data: WebtoonInput) {
  return await db.Webtoon.create({ ...data, views: 0, recommend: 0 });
}
// 웹툰 idx로 불러오기
export async function getWebtoonById(id: number) {
  const wt = await db.Webtoon.findByPk(id, {
    include: [{ model: db.Artist, attributes: ['idx', 'artistName'] }],
  });
  if (!wt) throw new Error('Not Found');
  return wt;
}
// 프런트에서 웹툰 업데이트시 필요한 정보 확장 인터페이스
export interface WebtoonUpdateInput {
  webtoonName?: string;
  description?: string;
  genre?:
    | 'DRAMA'
    | 'ROMANCE'
    | 'FANTASY'
    | 'ACTION'
    | 'LIFE'
    | 'GAG'
    | 'SPORTS'
    | 'THRILLER'
    | 'HISTORICAL';
  artistId?: number;
  wbthumbnailUrl?: string;
}
// 웹툰 정보 업데이트
export async function updateWebtoon(id: number, data: Partial<WebtoonUpdateInput>) {
  const wt = await db.Webtoon.findByPk(id);
  if (!wt) throw new Error('Not Found');
  return await wt.update(data);
}
// 웹툰 삭제
export async function deleteWebtoon(id: number) {
  const wt = await db.Webtoon.findByPk(id);
  if (!wt) throw new Error('Not Found');
  await wt.destroy();
}
