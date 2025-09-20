export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { requireAuth } from '@/lib/middlewares/auth';
import {
  verifyMemberPassword,
  updateMemberProfile,
  deactivateMember,
} from '@/controllers/member/profileController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 컨트롤러에 정의된 멤버 프로필을 인증하고 변경하는 로직을 불러오는 라우터
async function PATCHHandler(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  const body = await req.json();

  // 비밀번호 변경 로직(선택)
  if (body.currentPassword || body.newPassword) {
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    const ok = await verifyMemberPassword(memberId, body.currentPassword);
    if (!ok) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }
  }

  // 허용 필드만 화이트리스트로 추출
  const allow = {
    nickname: body.nickname,
    name: body.name,
    age: body.age,
    gender: body.gender, // 'MALE'|'FEMALE'|'OTHER'
    email: body.email,
    phoneNumber: body.phoneNumber,
    address: body.address,
  } as Record<string, unknown>;

  if (body.newPassword && typeof body.newPassword === 'string' && body.newPassword.length >= 8) {
    allow.memberPassword = await bcrypt.hash(body.newPassword, 10);
  }

  const updated = await updateMemberProfile(memberId, allow);
  return NextResponse.json(updated);
}

// 멤버 정보를 db에서 삭제하고 회원탈퇴되도록 하는 라우터
async function DELETEHandler(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  const { currentPassword } = await req.json();
  if (!currentPassword) {
    return NextResponse.json(
      { error: '탈퇴하려면 현재 비밀번호를 입력해주세요.' },
      { status: 400 }
    );
  }
  const ok = await verifyMemberPassword(memberId, currentPassword);
  if (!ok) {
    return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }
  await deactivateMember(memberId);

  const res = NextResponse.json({ message: '회원 탈퇴 처리되었습니다.' });
  res.cookies.delete('next-auth.session-token');
  res.cookies.delete('__Secure-next-auth.session-token');
  res.cookies.delete('next-auth.callback-url');
  res.cookies.delete('__Secure-next-auth.callback-url');
  return res;
}

export const PATCH = withErrorHandler(PATCHHandler);
export const DELETE = withErrorHandler(DELETEHandler);
