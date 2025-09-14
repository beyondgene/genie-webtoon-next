// app/api/(protected)/metrics/webtoon-view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import db from '@/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// 웹툰 시청수를 확인하고 count하여 db로 정보 보내는 라우터
export async function POST(req: NextRequest) {
  try {
    const { webtoonId } = (await req.json()) as { webtoonId?: number };
    const id = Number(webtoonId);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ ok: false, message: 'invalid webtoonId' }, { status: 400 });
    }

    // 누적 views +1
    await db.sequelize.query(
      'UPDATE `webtoon` SET `views` = COALESCE(`views`, 0) + 1 WHERE `idx` = ?',
      { replacements: [id] }
    );

    // KST YYYY-MM-DD
    const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const ymd = kst.toISOString().slice(0, 10);

    // 일자별 집계 upsert
    await db.sequelize.query(
      `INSERT INTO webtoon_view_stat (webtoonId, date, views, createdAt, updatedAt)
       VALUES (?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE views = views + 1, updatedAt = NOW();`,
      { replacements: [id, ymd] }
    );

    try {
      revalidateTag('ranking');
      revalidateTag('ranking:daily');
      revalidateTag('ranking:weekly');
      revalidateTag('ranking:monthly');
      revalidateTag('ranking:yearly');
    } catch {}

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[metrics/webtoon-view] error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
