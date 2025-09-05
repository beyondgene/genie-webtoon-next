import db from '@/models';
// 에피소드 리스트 db에서 뽑아오기
export async function listEpisodes() {
  return await db.Episode.findAll({
    include: [
      { model: db.Webtoon, attributes: ['idx', 'webtoonName'] },
      { model: db.Advertisement, attributes: ['idx', 'adName'] },
    ],
    order: [['uploadDate', 'DESC']],
  });
}
// 프런트에서 사용할 에피소드에 들어갈 내용 확장 인터페이스
export interface EpisodeInput {
  title: string;
  epthumbnailUrl: string;
  uploadDate: Date;
  webtoonId: number;
  contentUrl: string;
  adId: number | null;
  adminId: number;
}
// 에피소드 생성
export async function createEpisode(data: EpisodeInput) {
  return await db.Episode.create(data);
}
// 에피소드 idx로 정보 불러오기
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
// 에피소드 업데이트
export async function updateEpisode(id: number, data: Partial<EpisodeInput>) {
  const ep = await db.Episode.findByPk(id);
  if (!ep) throw new Error('Not Found');
  return await ep.update(data);
}
// 에피소드 삭제
export async function deleteEpisode(id: number) {
  const ep = await db.Episode.findByPk(id);
  if (!ep) throw new Error('Not Found');
  await ep.destroy();
}
