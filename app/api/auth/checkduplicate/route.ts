import { NextRequest } from 'next/server';
import * as yup from 'yup';
import { checkDuplicateId } from '@/controllers/auth/checkDuplicateController';
import { validateBody } from '@/lib/middlewares/validate';

const checkDuplicateSchema = yup.object({
  memberId: yup.string().required('memberId는 필수 입력입니다.'),
});

export async function POST(req: NextRequest) {
  const validation = await validateBody(checkDuplicateSchema)(req.clone());
  if (!validation.headers.get('x-middleware-next')) {
    return validation;
  }
  return checkDuplicateId(req);
}
