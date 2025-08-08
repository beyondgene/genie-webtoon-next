import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '@/models';
import { sendVerificationEmail } from '@/lib/emailService';

export async function signup(req: NextRequest) {
  const {
    memberId,
    memberPassword,
    nickname,
    name,
    birthDate, // "YYYY-MM-DD"
    gender, // "MALE" | "FEMALE" | "OTHER"
    email,
    phoneNumber,
    address,
  } = await req.json();

  // 1) 필수값 검증
  if (
    !memberId ||
    !memberPassword ||
    !nickname ||
    !name ||
    !birthDate ||
    !gender ||
    !email ||
    !phoneNumber ||
    !address
  ) {
    return NextResponse.json({ error: '모든 필드를 정확히 입력해주세요.' }, { status: 400 });
  }

  // 2) 입력 형식 검증
  const idRegex = /^[A-Za-z0-9_]+$/;
  if (!idRegex.test(memberId)) {
    return NextResponse.json(
      { error: 'ID는 한글 불가, 영문·숫자·언더바(_)만 허용됩니다.' },
      { status: 400 }
    );
  }

  const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w]).{8,}$/;
  if (!pwdRegex.test(memberPassword)) {
    return NextResponse.json(
      { error: '비밀번호는 8자 이상, 영문·숫자·특수문자 조합이어야 합니다.' },
      { status: 400 }
    );
  }

  const nameRegex = /^[가-힣]+$/;
  if (!nameRegex.test(name)) {
    return NextResponse.json({ error: '이름은 한국어만 입력 가능합니다.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: '유효한 이메일 형식이 아닙니다.' }, { status: 400 });
  }

  const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return NextResponse.json(
      { error: '전화번호는 000-0000-0000 형식이어야 합니다.' },
      { status: 400 }
    );
  }

  const date = new Date(birthDate);
  if (birthDate.length !== 10 || isNaN(date.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json(
      { error: '생년월일 형식이 잘못되었습니다. YYYY-MM-DD 로 입력해주세요.' },
      { status: 400 }
    );
  }

  // 3) 나이 계산
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  if (age < 0) age = 0;

  // 4) 중복 확인
  const exists = await db.Member.findOne({ where: { memberId } });
  if (exists) {
    return NextResponse.json({ error: '이미 존재하는 ID입니다.' }, { status: 409 });
  }

  // 5) 비밀번호 해싱 및 토큰 생성
  const hashed = await hash(memberPassword, 10);
  const verificationToken = uuidv4(); // DB에 해당 컬럼이 있어야 합니다

  // 6) 회원 생성
  const newUser = await db.Member.create({
    memberId,
    memberPassword: hashed,
    nickname,
    name,
    birthDate,
    age,
    gender,
    email,
    phoneNumber,
    address,
    status: 'ACTIVE',
    verificationToken,
  });

  // 7) 이메일 전송
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (err) {
    console.error('[Signup Error] Failed to send verification email:', err);
    return NextResponse.json({ error: '회원가입 중 이메일 전송에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, idx: newUser.idx }, { status: 201 });
}
