import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { getEpisodeList } from '@/controllers/episode/listController';

async function GETHandler(
  req: NextRequest,
  ctx: { params: Promise<{ webtoonId: string }> } // ✅ Promise
) {
  const { webtoonId } = await ctx.params; // ✅ await
  const w = parseInt(webtoonId, 10);

  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id ?? 0;

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '500');

  const { episodes, subscription } = await getEpisodeList(userId, w);
  const list = Array.isArray(episodes) ? episodes.slice(0, Math.max(0, limit)) : [];

  return NextResponse.json({ ok: true, data: list, subscription }, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
