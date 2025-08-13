import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { getArtistList, createArtist } from '@/controllers/artist/artistController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const artists = await getArtistList();
    return NextResponse.json({ artists });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '작가 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function POSTHandler(req: NextRequest) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const body = await req.json();
    const artist = await createArtist(body, sessionOrRes.id as number);
    return NextResponse.json({ artist }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '작가 생성 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
