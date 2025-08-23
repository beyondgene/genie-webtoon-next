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
  ctx: { params: Promise<{ webtoonId: string; episodeId: string }> } // ✅ Promise
) {
  const { webtoonId, episodeId } = await ctx.params; // ✅ await
  const w = parseInt(webtoonId, 10);
  const e = parseInt(episodeId, 10);

  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id ?? 0;

  const data = await getEpisodeDetailWithMeta(userId, w, e);
  const episode = data?.episode ?? null;

  // contentUrl이 반드시 포함되도록 보정 (없으면 한 번 더 조회)
  if (!episode?.contentUrl) {
    const db = (await import('@/models')).default;
    const row = await db.Episode.unscoped().findByPk(e, { attributes: ['contentUrl'], raw: true });
    if (row) data.episode = { ...(data.episode ?? {}), contentUrl: row.contentUrl };
  }

  const images = toImagesFromEpisode(data?.episode);
  return NextResponse.json({ ok: true, data: { ...data, images } }, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
