// app/api/(protected)/webtoon/[id]/route.ts
import { NextRequest } from 'next/server';
import db from '@/models';
import { getWebtoonDetail } from '@/controllers/webtoon/webtoonController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
// 웹툰 정보 전부 불러오는 컨트롤러 호출하는 라우터
// 조회수 + 일자별 통계 업서트
async function recordView(webtoonId: number) {
  try {
    // 누적 views +1
    await db.Webtoon.increment('views', { by: 1, where: { idx: webtoonId } });

    // KST 기준 YYYY-MM-DD
    const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const ymd = kst.toISOString().slice(0, 10);

    // 일자별 집계 upsert
    await db.sequelize.query(
      `INSERT INTO webtoon_view_stat (webtoonId, date, views, createdAt, updatedAt)
       VALUES (?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE views = views + 1, updatedAt = NOW();`,
      { replacements: [webtoonId, ymd] }
    );
  } catch (err) {
    console.error('[recordView] failed:', err);
    // 통계 실패해도 본 응답에는 영향 주지 않음
  }
}

async function GETHandler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ Next.js 15: params는 Promise일 수 있음
) {
  const { id } = await ctx.params;
  const webtoonId = Number(id);

  // 기존 상세 컨트롤러 호출
  const res = await getWebtoonDetail(req, webtoonId);

  // 200(성공)일 때만 비동기로 카운트 (응답 지연 방지)
  if (res.status === 200) {
    // await 하지 않음: 응답은 바로 반환, 기록은 백그라운드 실행
    recordView(webtoonId).catch(() => {});
  }

  return res;
}

export const GET = withErrorHandler(GETHandler);
