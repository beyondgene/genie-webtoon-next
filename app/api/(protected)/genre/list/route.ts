import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getGenreList } from '@/controllers/genre/listGenreController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  // 로그인 검사
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // 장르 목록 조회
    const genres: string[] = await getGenreList();
    return NextResponse.json({ genres }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? '장르 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
