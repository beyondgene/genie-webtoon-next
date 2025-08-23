import db from '@/models';

export async function listEpisodes() {
  return await db.Episode.findAll({
    include: [
      { model: db.Webtoon, attributes: ['idx', 'webtoonName'] },
      { model: db.Advertisement, attributes: ['idx', 'adName'] },
    ],
    order: [['uploadDate', 'DESC']],
  });
}

export interface EpisodeInput {
  title: string;
  epthumbnailUrl: string;
  uploadDate: Date;
  webtoonId: number;
  adId: number | null;
  adminId: number;
}

export async function createEpisode(data: EpisodeInput) {
  return await db.Episode.create(data);
}

export async function getEpisodeById(id: number) {
  const ep = await db.Episode.findByPk(id, {
    include: [
      { model: db.Webtoon, attributes: ['idx', 'webtoonName'] },
      { model: db.Advertisement, attributes: ['idx', 'adName'] },
    ],
  });
  if (!ep) throw new Error('Not Found');
  return ep;
}

export async function updateEpisode(id: number, data: Partial<EpisodeInput>) {
  const ep = await db.Episode.findByPk(id);
  if (!ep) throw new Error('Not Found');
  return await ep.update(data);
}

export async function deleteEpisode(id: number) {
  const ep = await db.Episode.findByPk(id);
  if (!ep) throw new Error('Not Found');
  await ep.destroy();
}
