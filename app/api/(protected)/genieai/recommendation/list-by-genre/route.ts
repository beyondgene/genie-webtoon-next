// app/api/genieai/recommendation/list-by-genre/route.ts
import { NextResponse } from 'next/server';
import db from '@/models';

// Sequelize는 Edge에서 안 돌아갈 수 있으니 Node 런타임 강제
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// 장르 리스트로 허영된 정보 세트 정의
const ALLOWED = new Set([
  'DRAMA',
  'ROMANCE',
  'FANTASY',
  'ACTION',
  'LIFE',
  'GAG',
  'SPORTS',
  'THRILLER',
  'HISTORICAL',
]);
// 장르별로 추전을 했을때 라우터 get 핸들러
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = (searchParams.get('genre') || '').toUpperCase();

    if (!ALLOWED.has(genre)) {
      return NextResponse.json({ error: '유효하지 않은 장르입니다' }, { status: 400 });
    }

    // 모델 참조
    const Webtoon: any = (db as any)?.Webtoon;
    if (!Webtoon?.findAll) {
      return NextResponse.json({ error: '웹툰 모델을 찾을 수 없습니다' }, { status: 500 });
    }
    // 웹툰 검색
    const rows = await Webtoon.findAll({
      where: { genre },
      attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
      order: [['views', 'DESC']],
      limit: 12,
    });
    // 밖으로 내보낼 정보안 속성 타입 지정 및 선언
    const items = rows.map((r: any) => ({
      idx: r.idx,
      webtoonName: r.webtoonName,
      genre: String(r.genre ?? '').toUpperCase(),
      views: Number(r.views ?? 0),
      wbthumbnailUrl: r.wbthumbnailUrl ?? '',
      description: r.description,
      discription: r.description ?? '',
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    console.error('[list-by-genre] error:', err);
    return NextResponse.json(
      { error: 'Server error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
