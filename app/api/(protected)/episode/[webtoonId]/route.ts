import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getEpisodeList } from '@/controllers/episode/listController';

export async function GET(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const webtoonId = parseInt(params.webtoonId, 10);

  try {
    const data = await getEpisodeList(userId, webtoonId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '에피소드 목록 조회 중 오류' },
      { status: 500 }
    );
  }
}
