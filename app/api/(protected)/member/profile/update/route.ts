import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { requireAuth } from '@/lib/middlewares/auth';
import {
  verifyMemberPassword,
  updateMemberProfile,
  deactivateMember,
} from '@/controllers/member/profileController';
export async function PATCH(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const body = await req.json();
  if (body.currentPassword || body.newPassword) {
    if (!body.currentPassword || !body.newPassword)
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    const valid = await verifyMemberPassword(memberId, body.currentPassword);
    if (!valid)
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    body.newPassword = await bcrypt.hash(body.newPassword, 12);
  }
  return NextResponse.json(await updateMemberProfile(memberId, body));
}
export async function DELETE(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const { currentPassword } = await req.json();
  if (!currentPassword)
    return NextResponse.json(
      { error: '탈퇴하려면 현재 비밀번호를 입력해주세요.' },
      { status: 400 }
    );
  const valid = await verifyMemberPassword(memberId, currentPassword);
  if (!valid)
    return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 401 });
  await deactivateMember(memberId);
  return NextResponse.json({ message: '회원 탈퇴 처리되었습니다.' });
}
