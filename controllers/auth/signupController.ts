// controllers/auth/signupController.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '@/models';
import { sendVerificationEmail } from '@/lib/emailService';

// ✅ 만나이 계산 (UTC 기준으로 날짜 비교)
function calcAge(yyyyMMdd: string): number {
  // yyyy-mm-dd 가정 (슬래시 들어오면 대비)
  const norm = yyyyMMdd.replace(/\//g, '-');
  const [y, m, d] = norm.split('-').map((v) => Number(v));
  const dob = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age--;
  return Math.max(age, 0);
}

export async function signup(req: NextRequest) {
  try {
    const body = await req.json();

    const memberId: string = body.memberId?.trim();
    const plainPassword: string = body.memberPassword;
    const name: string = body.name?.trim();
    const nickname: string = (body.nickname ?? body.name ?? '').trim();
    const email: string = body.email?.trim();
    const phoneNumber: string = body.phoneNumber?.trim();
    const address: string = body.address?.trim();
    const gender: 'MALE' | 'FEMALE' | 'OTHER' = body.gender ?? 'OTHER';

    // ✅ birthDate 보정 (YYYY/MM/DD → YYYY-MM-DD)
    const birthDate: string | null =
      typeof body.birthDate === 'string'
        ? body.birthDate.replace(/\//g, '-')
        : typeof body.birth === 'string'
          ? body.birth.replace(/\//g, '-')
          : null;

    if (!birthDate) {
      return NextResponse.json({ error: 'birthDate는 필수입니다.' }, { status: 400 });
    }

    // ✅ age 계산
    const age = calcAge(birthDate);

    // 중복 체크
    const [idExists, emailExists] = await Promise.all([
      db.Member.findOne({ where: { memberId } }),
      email ? db.Member.findOne({ where: { email } }) : Promise.resolve(null),
    ]);
    if (idExists) {
      return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 });
    }
    if (emailExists) {
      return NextResponse.json({ error: '이미 등록된 이메일입니다.' }, { status: 409 });
    }

    const memberPassword = await hash(plainPassword, 10);
    const verificationToken = uuidv4();

    // ✅ DB에 age 함께 저장
    const newUser = await db.Member.create({
      memberId,
      memberPassword,
      nickname: nickname || name,
      name,
      email,
      phoneNumber,
      address,
      gender,
      birthDate,
      age, // 👈 notNull 방지
      status: 'PENDING',
      verificationToken,
      adminId: null,
    } as any);

    let emailSent = false;
    try {
      await sendVerificationEmail(email, verificationToken);
      emailSent = true;
    } catch (e) {
      console.error('[Signup] sendVerificationEmail failed:', e);
    }

    return NextResponse.json({ success: true, idx: newUser.idx, emailSent }, { status: 201 });
  } catch (err: any) {
    console.error('[Signup] unexpected error:', err?.message ?? err);
    return NextResponse.json({ error: '회원가입 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
