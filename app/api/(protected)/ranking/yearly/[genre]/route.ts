import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getYearlyRanking } from '@/controllers/ranking';

export async function GET(req: NextRequest, { params }: { params: { genre: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  try {
    const data = await getYearlyRanking(params.genre);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Yearly Ranking 조회 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '연간 랭킹을 불러오는 중 서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
