export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getEpisodeNavigation } from '@/controllers/episode/navigationController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 에피소드에서 컨트롤러 네비게이션 호출하는 get 라우터
async function GETHandler(
  req: NextRequest,
  { params }: { params: { webtoonId: string; episodeId: string } }
) {
  // 내비게이션 정보(이전/다음/총 회차)
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const webtoonId = parseInt(params.webtoonId, 10);
  const episodeId = parseInt(params.episodeId, 10);

  try {
    const data = await getEpisodeNavigation(webtoonId, episodeId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '내비게이션 정보 조회 중 오류' },
      { status: 500 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
