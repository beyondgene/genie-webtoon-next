export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import * as yup from 'yup';
import { findId } from '@/controllers/auth/findIdController';
import { validateBody } from '@/lib/middlewares/validate';

const findIdSchema = yup.object({
  name: yup.string().required('이름을 입력해주세요.'),
  phoneNumber: yup
    .string()
    .matches(/^(\d{2,3}-\d{3,4}-\d{4})$/, '전화번호는 000-0000-0000 형식이어야 합니다.')
    .required(),
});
// 컨트롤러에 있는 아이디 검색 로직 호출하는 라우터
export async function POST(req: NextRequest) {
  const error = await validateBody(findIdSchema)(req.clone());
  if (error) return error; // ← 성공: null, 실패: NextResponse(400)
  return findId(req); // ← 컨트롤러 호출
}
