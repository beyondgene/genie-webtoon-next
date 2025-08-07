// controllers/auth/checkDuplicateController.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';

/**
 * ID 중복 확인
 * Request body: { memberId: string }
 * Response: { available: boolean }
 */
export async function checkDuplicateId(req: NextRequest) {
  const { memberId } = await req.json();
  if (!memberId) {
    return NextResponse.json({ error: 'memberId는 필수 입력입니다.' }, { status: 400 });
  }
  const exists = await db.Member.findOne({ where: { memberId } });
  return NextResponse.json({ available: !Boolean(exists) });
}
