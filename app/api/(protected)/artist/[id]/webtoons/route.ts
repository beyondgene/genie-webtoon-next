import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getArtistWebtoons } from '@/controllers/artist/artistController';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const webtoons = await getArtistWebtoons(sessionOrRes.id as number, Number(params.id));
    return NextResponse.json({ webtoons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '웹툰 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
