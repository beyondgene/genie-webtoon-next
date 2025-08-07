import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { addAuthorInterest, removeAuthorInterest } from '@/controllers/member/interestsController';
export async function POST(req: NextRequest, { params }: { params: { artistId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const artistIdx = parseInt(params.artistId, 10);

  try {
    await addAuthorInterest(memberId, artistIdx);
    return NextResponse.json({ message: '관심 작가로 등록되었습니다.' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { artistId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const artistIdx = parseInt(params.artistId, 10);

  try {
    await removeAuthorInterest(memberId, artistIdx);
    return NextResponse.json({ message: '관심 작가 등록이 해제되었습니다.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
