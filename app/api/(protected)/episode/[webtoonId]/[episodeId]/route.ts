export const runtime = 'nodejs';
// app/api/(protected)/episode/[webtoonId]/[episodeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { getEpisodeDetailWithMeta } from '@/controllers/episode/detailController';
// 에피소드 내용 호출
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

// 에피소드 세부정보 호출
async function callDetailController(userId: number | undefined, w: number, e: number) {
  const fn: any = getEpisodeDetailWithMeta as any;
  // 인자 수로 구분: 객체 1개(=1) vs 위치 3개(=3)
  if (typeof fn === 'function' && fn.length >= 3) {
    // 옛 시그니처: (memberId, webtoonId, episodeId)
    return await fn(userId, w, e);
  }
  // 새 시그니처: ({ webtoonId, episodeId, memberId })
  return await fn({ webtoonId: w, episodeId: e, memberId: userId });
}
// 에피소드의 세부정도를 갖고오는 get 처리 컨트롤러 로직을 호출하는 라우터
async function GETHandler(
  _req: NextRequest,
  ctx: { params: Promise<{ webtoonId: string; episodeId: string }> } // Next.js 15: params는 Promise
) {
  const { webtoonId, episodeId } = await ctx.params; // 반드시 await
  const w = Number(webtoonId);
  const e = Number(episodeId);

  const session = await getServerSession(authOptions);
  const userId =
    Number((session as any)?.user?.id ?? (session as any)?.user?.idx ?? 0) || undefined;

  // 에피소드/메타 조회(시그니처 호환 호출)
  const data: any = await callDetailController(userId, w, e);

  // 조회수 + 일자별 통계 upsert (KST 기준) — 기존 로직 유지
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

  // contentUrl 보정— db 재선언 없이 사용
  const episode = data?.episode ?? null;
  if (!episode?.contentUrl) {
    const row = await db.Episode.unscoped().findByPk(e, {
      attributes: ['contentUrl'],
      raw: true,
    });
    if (row) data.episode = { ...(data.episode ?? {}), contentUrl: row.contentUrl };
  }

  // 응답
  const images = toImagesFromEpisode(data?.episode);
  return NextResponse.json({ ok: true, data: { ...data, images } }, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
