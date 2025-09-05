// controllers/auth/signupController.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import db from '@/models';
import { sendVerificationEmail } from '@/lib/emailService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';

// ✅ 만나이 계산 (UTC 기준으로 날짜 비교)
function calcAge(yyyyMMdd: string): number {
  const norm = yyyyMMdd.replace(/\//g, '-');
  const [y, m, d] = norm.split('-').map((v) => Number(v));
  const dob = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const mm = today.getUTCMonth() - dob.getUTCMonth();
  if (mm < 0 || (mm === 0 && today.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

export async function signup(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 정규화
    const memberId = String(body.memberId).trim();
    const plainPassword = String(body.memberPassword).trim();
    const nickname = (body.nickname ?? body.name ?? '').toString().trim();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const phoneNumber = String(body.phoneNumber ?? '').trim(); // 000-0000-0000 형식
    const address = String(body.address ?? '').trim();
    const gender = String(body.gender ?? '').toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER';

    // birthDate 키 호환 (birthDate | birth)
    const birthDate =
      typeof body.birthDate === 'string'
        ? body.birthDate.replace(/\//g, '-')
        : typeof body.birth === 'string'
          ? body.birth.replace(/\//g, '-')
          : null;

    if (!birthDate) {
      return NextResponse.json({ error: 'birthDate는 필수입니다.' }, { status: 400 });
    }

    // age 계산
    const age = calcAge(birthDate);

    // 사전 중복체크: memberId / email / phoneNumber 전부
    const [idExists, emailExists, phoneExists] = await Promise.all([
      db.Member.findOne({ where: { memberId } }),
      email ? db.Member.findOne({ where: { email } }) : Promise.resolve(null),
      phoneNumber ? db.Member.findOne({ where: { phoneNumber } }) : Promise.resolve(null),
    ]);
    if (idExists) {
      return NextResponse.json(
        { field: 'memberId', error: '이미 사용 중인 아이디입니다.' },
        { status: 409 }
      );
    }
    if (emailExists) {
      return NextResponse.json(
        { field: 'email', error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      );
    }
    if (phoneExists) {
      return NextResponse.json(
        { field: 'phoneNumber', error: '이미 등록된 전화번호입니다.' },
        { status: 409 }
      );
    }

    const memberPassword = await hash(plainPassword, 10);
    const verificationToken = uuidv4();

    // 생성 (status는 PENDING으로 두고 이메일 인증 후 ACTIVE로)
    let newUser;
    try {
      newUser = await db.Member.create({
        memberId,
        memberPassword,
        nickname: nickname || name,
        name,
        email,
        phoneNumber,
        address,
        gender,
        // 모델에는 birthDate 컬럼이 없을 수 있어도 Sequelize가 무시하므로 안전합니다.
        // 필요 시 테이블에도 birthDate 컬럼을 추가하세요.
        birthDate,
        age, // notNull 방지
        status: 'PENDING',
        verificationToken,
      } as any);
    } catch (e: any) {
      // DB 레벨 제약 매핑
      if (e instanceof UniqueConstraintError) {
        const first = e.errors?.[0];
        const path = (first?.path ?? '').toString();
        const msg = path.includes('email')
          ? '이미 등록된 이메일입니다.'
          : path.includes('phone')
            ? '이미 등록된 전화번호입니다.'
            : path.includes('memberId')
              ? '이미 사용 중인 아이디입니다.'
              : '중복된 값이 있습니다.';
        const field = path.includes('email')
          ? 'email'
          : path.includes('phone')
            ? 'phoneNumber'
            : path.includes('memberId')
              ? 'memberId'
              : undefined;

        return NextResponse.json({ field, error: msg }, { status: 409 });
      }
      if (e instanceof ValidationError) {
        // notNull / enum / 길이 등
        const messages = e.errors?.map((x) => x.message) ?? ['유효하지 않은 입력입니다.'];
        return NextResponse.json({ error: messages }, { status: 400 });
      }
      throw e; // 나머지는 상위 catch로
    }
    // (★추가) 소셜 온보딩이라면 어댑터 User.email을 이번에 입력한 email로 동기화
    try {
      const session = await getServerSession(authOptions);
      const suser: any = (session as any)?.user ?? null;
      const oauthUserId = suser?.oauthUserId ?? null;
      if (oauthUserId) {
        const { models } = db.sequelize as any;
        const UserModel: any = models?.User ?? models?.users ?? models?.user;
        if (UserModel) {
          await UserModel.update({ email }, { where: { id: oauthUserId } });
        }
      }
    } catch (e) {
      console.error('[Signup] adapter user email sync failed:', e);
      // 동기화 실패해도 가입 자체는 성공 처리
    }
    // 인증메일 전송 (실패해도 가입은 성공)
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
