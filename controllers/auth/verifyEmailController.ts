import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';

export async function verifyEmail(req: NextRequest) {
  // 1) 토큰 파라미터 추출
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json(
      { error: '토큰이 필요합니다.' },
      { status: 400 }
    );
  }

  // 2) 토큰으로 회원 조회
  const user = await db.Member.findOne({
    where: { verificationToken: token },
  });
  if (!user) {
    return NextResponse.json(
      { error: '유효하지 않은 토큰입니다.' },
      { status: 404 }
    );
  }

  // 3) 토큰 제거 및 상태 업데이트
  user.verificationToken = null;
  // ERD 상 MEMBER.status 컬럼이 있으므로, 
  // 필요하다면 PENDING -> ACTIVE로 변경할 수 있습니다.
  user.status = 'ACTIVE';  // :contentReference[oaicite:1]{index=1}
  await user.save();

  // 4) 성공 응답
  return NextResponse.json(
    { message: '이메일 인증이 완료되었습니다.' },
    { status: 200 }
  );
}
