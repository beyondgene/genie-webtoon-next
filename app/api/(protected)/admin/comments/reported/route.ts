import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/reportedCommentsController';

export async function GET(req: NextRequest) {
  await requireAuth(req);
  const reports = await ctrl.listReportedComments();
  return NextResponse.json(reports);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  await ctrl.deleteReportedCommentReport(+params.id);
  return NextResponse.json(null, { status: 204 });
}
