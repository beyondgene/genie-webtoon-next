// controllers/auth/findPasswordController.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import db from '@/models';
import { isEmailConfigured, sendResetPasswordEmail } from '@/lib/emailService';
import { randomInt } from 'crypto';
//허용하는 문자,숫자,특수기호 나열
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*()-_=+[]{};:,.?'; // 필요에 따라 허용 문자 조정
// 위 허용하는 조합에서 랜덤으로 정해진 길이까지 조합해서 문자열 생성
function pick(set: string) {
  return set[randomInt(0, set.length)];
}

/** 영문/숫자/특수문자 각 1개 이상 보장 */
export function generateTempPassword(len = 12): string {
  if (len < 3) throw new Error('Password length must be ≥ 3');

  // 필수 3종
  const required = [pick(LETTERS), pick(DIGITS), pick(SPECIAL)];

  // 나머지 채우기(전체 풀에서)
  const ALL = LETTERS + DIGITS + SPECIAL;
  const rest: string[] = [];
  for (let i = 0; i < len - required.length; i++) {
    rest.push(ALL[randomInt(0, ALL.length)]);
  }

  // 합치고 암호학적으로 셔플(Fisher–Yates)
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
// 비밀번호 찾기 로직
export async function findPassword(req: NextRequest) {
  try {
    const { memberId, name, phoneNumber } = await req.json();
    if (!memberId || !name || !phoneNumber) {
      return NextResponse.json(
        { error: '아이디, 이름, 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    // 멤버 아이디, 이름, 전화번호로 db에 검색해 일치하는 회원 검색
    const user = await db.Member.findOne({ where: { memberId, name, phoneNumber } });
    if (!user) return NextResponse.json({ error: '일치하는 회원이 없습니다.' }, { status: 404 });

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: '메일 발송 설정이 누락되어 임시 비밀번호를 보낼 수 없습니다.' },
        { status: 503 }
      );
    }

    const tempPassword = generateTempPassword(12);
    const hashed = await hash(tempPassword, 12);

    // 트랜잭션: 메일 성공시에만 커밋
    const t = await db.sequelize.transaction();
    try {
      await user.update(
        {
          memberPassword: hashed,
          ...('resetToken' in user && { resetToken: null }),
          ...('resetTokenExpiry' in user && { resetTokenExpiry: null }),
        } as any,
        { transaction: t }
      );

      await sendResetPasswordEmail(user.email!, tempPassword);
      await t.commit();

      return NextResponse.json({
        message: '임시 비밀번호를 이메일로 발송했습니다. 로그인 후 반드시 비밀번호를 변경해주세요.',
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  } catch (err) {
    console.error('[findPassword] unexpected error:', err);
    return NextResponse.json(
      { error: '비밀번호 찾기 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
