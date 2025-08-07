import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getEpisodeDetailWithMeta } from '@/controllers/episode/detailController';

export async function GET(
  req: NextRequest,
  { params }: { params: { webtoonId: string; episodeId: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const webtoonId = parseInt(params.webtoonId, 10);
  const episodeId = parseInt(params.episodeId, 10);

  try {
    const data = await getEpisodeDetailWithMeta(userId, webtoonId, episodeId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '에피소드 상세 조회 중 오류' },
      { status: err.message === '해당 에피소드를 찾을 수 없습니다.' ? 404 : 500 }
    );
  }
}
