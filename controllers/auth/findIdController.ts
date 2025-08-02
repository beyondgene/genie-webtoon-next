import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';

export async function findId(req: NextRequest) {
  const { name, phoneNumber } = await req.json();
  if (!name || !phoneNumber) {
    return NextResponse.json(
      { error: '이름과 전화번호를 모두 입력해주세요.' },
      { status: 400 }
    );
  }

  const user = await db.Member.findOne({ where: { name, phoneNumber } });
  if (!user) {
    return NextResponse.json(
      { error: '일치하는 회원이 없습니다.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ memberId: user.memberId });
}
