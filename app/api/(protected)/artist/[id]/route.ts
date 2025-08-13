import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { getArtistById, updateArtist, deleteArtist } from '@/controllers/artist/artistController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const artist = await getArtistById(Number(params.id));
    if (!artist) {
      return NextResponse.json({ error: '작가를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ artist });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '작가 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function PATCHHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const body = await req.json();
    const artist = await updateArtist(Number(params.id), body, sessionOrRes.id as number);
    return NextResponse.json({ artist });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '작가 수정 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}

async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    await deleteArtist(Number(params.id));
    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '작가 삭제 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
export const PATCH = withErrorHandler(PATCHHandler);
export const DELETE = withErrorHandler(DELETEHandler);
