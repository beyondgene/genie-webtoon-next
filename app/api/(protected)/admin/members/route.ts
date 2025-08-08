import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/membersController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  await requireAuth(req);
  const members = await ctrl.listMembers();
  return NextResponse.json(members);
}
export const GET = withErrorHandler(GETHandler);
