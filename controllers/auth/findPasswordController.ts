import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/models';
import { sendResetLinkEmail } from '@/lib/emailService';

export async function findPassword(req: NextRequest) {
  const { memberId, name, phoneNumber } = await req.json();
  if (!memberId || !name || !phoneNumber) {
    return NextResponse.json(
      { error: '아이디, 이름, 전화번호를 모두 입력해주세요.' },
      { status: 400 }
    );
  }

  const user = await db.Member.findOne({
    where: { memberId, name, phoneNumber },
  });
  if (!user) {
    return NextResponse.json({ error: '일치하는 회원이 없습니다.' }, { status: 404 });
  }

  // 비밀번호는 해시되어 복호화 불가하므로, 리셋 링크 발송
  const resetToken = uuidv4();
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1시간 유효
  user.resetToken = resetToken;
  user.resetTokenExpiry = expiry;
  await user.save();

  await sendResetLinkEmail(user.email!, resetToken);

  return NextResponse.json({
    message: '비밀번호 재설정을 위한 이메일을 발송했습니다.',
  });
}
