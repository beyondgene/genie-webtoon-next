import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/membersController';

export async function GET(req: NextRequest) {
  await requireAuth(req);
  const members = await ctrl.listMembers();
  return NextResponse.json(members);
}
