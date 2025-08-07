import db from '@/models';

export async function listWebtoons() {
  return await db.Webtoon.findAll({
    include: [{ model: db.Artist, attributes: ['idx', 'artistName'] }],
  });
}

export interface WebtoonInput {
  webtoonName: string;
  discription: string;
  genre: 'DRAMA' | 'ROMANCE' | 'FANTASY' | 'ACTION' | 'ETC';
  artistIdx: number;
  adminIdx: number;
}

export async function createWebtoon(data: WebtoonInput) {
  return await db.Webtoon.create({ ...data, views: 0, recommend: 0 });
}

export async function getWebtoonById(id: number) {
  const wt = await db.Webtoon.findByPk(id, {
    include: [{ model: db.Artist, attributes: ['idx', 'artistName'] }],
  });
  if (!wt) throw new Error('Not Found');
  return wt;
}

export interface WebtoonUpdateInput {
  webtoonName?: string;
  discription?: string;
  genre?: 'DRAMA' | 'ROMANCE' | 'FANTASY' | 'ACTION' | 'ETC';
  artistIdx?: number;
}

export async function updateWebtoon(id: number, data: Partial<WebtoonUpdateInput>) {
  const wt = await db.Webtoon.findByPk(id);
  if (!wt) throw new Error('Not Found');
  return await wt.update(data);
}

export async function deleteWebtoon(id: number) {
  const wt = await db.Webtoon.findByPk(id);
  if (!wt) throw new Error('Not Found');
  await wt.destroy();
}
