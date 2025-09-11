export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import * as yup from 'yup';
import { findPassword } from '@/controllers/auth/findPasswordController';
import { validateBody } from '@/lib/middlewares/validate';

const findPasswordSchema = yup.object({
  memberId: yup.string().required('아이디를 입력해주세요.'),
  name: yup.string().required('이름을 입력해주세요.'),
  phoneNumber: yup
    .string()
    .matches(/^(\d{2,3}-\d{3,4}-\d{4})$/, '전화번호는 000-0000-0000 형식이어야 합니다.')
    .required(),
});
// 컨트롤러에 있는 주요 로직을 호출하는 라우터
export async function POST(req: NextRequest) {
  const error = await validateBody(findPasswordSchema)(req.clone());
  if (error) return error;
  return findPassword(req);
}
