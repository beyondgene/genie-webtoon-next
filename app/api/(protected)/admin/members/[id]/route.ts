import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/membersController';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const member = await ctrl.getMemberById(+params.id);
  return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateMember(+params.id, data);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  await ctrl.deleteMember(+params.id);
  return NextResponse.json(null, { status: 204 });
}
