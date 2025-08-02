  import { NextRequest, NextResponse } from 'next/server';
import { updateAd, deleteAd } from '@/controllers/advertisement';
import { requireAdminAuth } from '@/lib/middlewares/requireAdminAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdminAuth(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const data = await req.json();
    const updated = await updateAd(params.id, data);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdminAuth(req);
  if (admin instanceof NextResponse) return admin;

  try {
    await deleteAd(params.id);
    return NextResponse.json({ message: '광고가 삭제되었습니다.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
