import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getDailyRanking } from '@/controllers/ranking';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest, { params }: { params: { genre: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  try {
    const data = await getDailyRanking(params.genre);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Daily Ranking 조회 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '일간 랭킹을 불러오는 중 서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
