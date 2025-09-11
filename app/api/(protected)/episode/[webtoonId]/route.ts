export const runtime = 'nodejs';
// app/api/(protected)/episode/[webtoonId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { getEpisodeList } from '@/controllers/episode/listController';

// getEpisodeList의 서로 다른 시그니처/리턴을 모두 흡수하는 호환 래퍼
async function callEpisodeList(
  memberId: number,
  webtoonId: number,
  limit?: number
): Promise<{ episodes: any[]; subscription: boolean }> {
  const fn: any = getEpisodeList;

  // 1) 신형: getEpisodeList({ webtoonId, memberId, limit }) -> { items, isBookmarked }
  try {
    const res = await fn({ webtoonId, memberId, limit });
    const episodes = Array.isArray(res?.items)
      ? res.items
      : Array.isArray(res?.episodes)
        ? res.episodes
        : [];
    const subscription = Boolean(res?.isBookmarked ?? res?.subscription ?? false);
    if (episodes.length || res?.isBookmarked !== undefined || res?.subscription !== undefined) {
      return { episodes, subscription };
    }
  } catch {
    // ignore, 구형 시그니처 시도
  }

  // 2) 구형: getEpisodeList(memberId, webtoonId) -> { episodes, subscription }
  const legacy = await fn(memberId, webtoonId);
  const episodes = Array.isArray(legacy?.episodes)
    ? legacy.episodes
    : Array.isArray(legacy)
      ? legacy
      : [];
  const subscription = Boolean(legacy?.subscription ?? legacy?.isBookmarked ?? false);
  return { episodes, subscription };
}

async function GETHandler(
  req: NextRequest,
  ctx: { params: Promise<{ webtoonId: string }> } // ✅ Promise
) {
  // 보호 라우트: 로그인 필수
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  // params 반드시 await
  const { webtoonId } = await ctx.params;
  const w = parseInt(webtoonId, 10);

  // 회원 ID: requireAuth 우선, getServerSession은 백업
  const session = await getServerSession(authOptions);
  const userId = Number(sessionOrRes.id ?? (session as any)?.user?.id ?? 0) || 0;

  // limit 쿼리 유지 (기본 500)
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '500');

  // 컨트롤러 호출 (양쪽 시그니처 호환)
  const { episodes, subscription } = await callEpisodeList(userId, w, limit);

  // 기존 포맷 유지: { ok, data: list, subscription }
  const list = Array.isArray(episodes) ? episodes.slice(0, Math.max(0, limit)) : [];
  return NextResponse.json({ ok: true, data: list, subscription }, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
