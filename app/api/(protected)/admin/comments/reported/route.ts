import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/reportedCommentsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const reports = await ctrl.listReportedComments();
  return NextResponse.json(reports);
}

async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  await ctrl.deleteReportedCommentReport(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const DELETE = withErrorHandler(DELETEHandler);
