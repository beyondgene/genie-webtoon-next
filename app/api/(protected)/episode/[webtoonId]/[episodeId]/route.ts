import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { getEpisodeDetailWithMeta } from '@/controllers/episode/detailController';

function toImagesFromEpisode(episode: any): string[] {
  const s = episode?.contentUrl;
  if (Array.isArray(s)) return s.filter(Boolean);
  if (typeof s === 'string' && s.trim()) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.filter(Boolean);
    } catch {}
    return s
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

async function GETHandler(
  _req: NextRequest,
  ctx: { params: Promise<{ webtoonId: string; episodeId: string }> } // ✅ Next.js 15: params는 Promise
) {
  const { webtoonId, episodeId } = await ctx.params;
  const w = Number(webtoonId);
  const e = Number(episodeId);

  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id ?? 0;

  // ① 에피소드/메타 조회(기존)
  const data = await getEpisodeDetailWithMeta(userId, w, e);

  // ② ✅ 조회수 + 일자별 통계 upsert (KST 기준)
  const db = (await import('@/models')).default;

  await db.Webtoon.increment('views', { by: 1, where: { idx: w } });

  const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const ymd = kst.toISOString().slice(0, 10); // YYYY-MM-DD

  await db.sequelize.query(
    `INSERT INTO webtoon_view_stat (webtoonId, date, views, createdAt, updatedAt)
     VALUES (?, ?, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE views = views + 1, updatedAt = NOW();`,
    { replacements: [w, ymd] }
  );

  // ③ contentUrl 보정(기존) — ⚠️ db 재선언 제거
  const episode = data?.episode ?? null;
  if (!episode?.contentUrl) {
    const row = await db.Episode.unscoped().findByPk(e, { attributes: ['contentUrl'], raw: true });
    if (row) data.episode = { ...(data.episode ?? {}), contentUrl: row.contentUrl };
  }

  // ④ 응답(기존)
  const images = toImagesFromEpisode(data?.episode);
  return NextResponse.json({ ok: true, data: { ...data, images } }, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
