import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { QueryTypes } from 'sequelize';

// 가장 적은 회원을 담당 중인 관리자 1명을 선택 (없으면 undefined 반환)
async function pickAdminId(): Promise<number | undefined> {
  const [rows] = (await db.sequelize.query(
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
    { type: QueryTypes.SELECT, raw: true }
  )) as any;

  // rows가 객체 하나일 수도, 배열일 수도 있어 안전하게 처리
  const first = Array.isArray(rows) ? rows[0] : rows;
  return first?.adminId as number | undefined;
}

export async function verifyEmail(req: NextRequest) {
  // 1) 토큰 파라미터 추출
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: '토큰이 필요합니다.' }, { status: 400 });
  }

  // 2) 토큰으로 회원 조회
  const user = await db.Member.findOne({ where: { verificationToken: token } });
  if (!user) {
    return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 404 });
  }

  // 3) 관리자 배정 후보 선정
  let targetAdminId: number | null = null;
  try {
    const adminId = await pickAdminId();
    if (typeof adminId === 'number') {
      targetAdminId = adminId; // 배정 가능한 관리자 존재
    }
  } catch (e) {
    // 관리자 조회 실패해도 인증 자체는 진행 (배정만 생략)
    console.warn('[verifyEmail] 관리자 배정 후보 조회 실패:', e);
  }

  // 4) 트랜잭션으로 상태/토큰/관리자 배정 원자적 업데이트
  const t = await db.sequelize.transaction();
  try {
    user.set({
      verificationToken: null,
      status: 'ACTIVE', // 가입 확정
      adminId: targetAdminId, // 관리자가 없으면 null 유지
    });

    await user.save({ transaction: t });
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
