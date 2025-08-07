import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/commentsController';

export async function GET(req: NextRequest) {
  await requireAuth(req);
  const list = await ctrl.listComments();
  return NextResponse.json(list);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  await ctrl.deleteComment(+params.id);
  return NextResponse.json(null, { status: 204 });
}
