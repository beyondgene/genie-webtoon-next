import { NextRequest } from 'next/server';
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

export async function POST(req: NextRequest) {
  const validation = await validateBody(findIdSchema)(req.clone());
  if (!validation.headers.get('x-middleware-next')) {
    return validation;
  }
  return findId(req);
}
