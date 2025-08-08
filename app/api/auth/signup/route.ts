import { NextRequest } from 'next/server';
import * as yup from 'yup';
import { signup } from '@/controllers/auth/signupController';
import { validateBody } from '@/lib/middlewares/validate';

// 회원가입 요청 바디 검증 스키마
const signupSchema = yup.object({
  memberId: yup
    .string()
    .matches(/^[A-Za-z0-9_]+$/, 'ID는 영문, 숫자, 언더바(_)만 허용됩니다.')
    .required(),
  memberPassword: yup
    .string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w]).{8,}$/,
      '비밀번호는 8자 이상, 영문·숫자·특수문자 조합이어야 합니다.'
    )
    .required(),
  nickname: yup.string().required(),
  name: yup
    .string()
    .matches(/^[가-힣]+$/, '이름은 한국어만 입력 가능합니다.')
    .required(),
  birthDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '생년월일은 YYYY-MM-DD 형식이어야 합니다.')
    .required(),
  gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']).required(),
  email: yup.string().email().required(),
  phoneNumber: yup
    .string()
    .matches(/^(\d{2,3}-\d{3,4}-\d{4})$/, '전화번호는 000-0000-0000 형식이어야 합니다.')
    .required(),
  address: yup.string().required(),
});

export async function POST(req: NextRequest) {
  const validation = await validateBody(signupSchema)(req.clone());
  if (!validation.headers.get('x-middleware-next')) {
    return validation;
  }
  return signup(req);
}
