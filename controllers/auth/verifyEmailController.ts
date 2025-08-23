// controllers/auth/verifyEmailController.ts (전체 교체)
import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { QueryTypes, Transaction } from 'sequelize';

/** 가장 적은 ACTIVE 회원을 관리 중인 관리자 1명을 선택 (없으면 undefined) */
async function pickAdminId(t?: Transaction): Promise<number | undefined> {
  const rows = (await db.sequelize.query<{ adminId: number }[]>(
    `
    SELECT a.idx AS adminId
    FROM admin a
    LEFT JOIN member m
      ON m.adminId = a.idx
     AND m.status = 'ACTIVE'
    GROUP BY a.idx
    ORDER BY COUNT(m.idx) ASC, a.idx ASC
    LIMIT 1
  `,
    { type: QueryTypes.SELECT, transaction: t }
  )) as unknown as { adminId: number }[];

  return rows?.[0]?.adminId ?? undefined;
}

export async function verifyEmail(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: '인증 토큰이 없습니다.' }, { status: 400 });
  }

  // 토큰으로 회원 찾기
  const user = await db.Member.findOne({ where: { verificationToken: token } });
  if (!user) {
    return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 404 });
  }

  // 이미 ACTIVE면 멱등 응답
  if (user.status === 'ACTIVE') {
    return NextResponse.json({ message: '이미 인증이 완료된 계정입니다.' }, { status: 200 });
  }

  const t = await db.sequelize.transaction();
  try {
    // 관리자 자동 배정 (없으면 그대로 null 유지)
    const targetAdminId = await pickAdminId(t);

    await user.update(
      {
        status: 'ACTIVE',
        verificationToken: null,
        adminId: targetAdminId ?? null,
      } as any,
      { transaction: t }
    );

    await t.commit();
    return NextResponse.json(
      {
        message: '이메일 인증이 완료되었습니다.',
        adminAssigned: targetAdminId ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    await t.rollback();
    console.error('[verifyEmail] update failed:', err);
    return NextResponse.json({ error: '인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
