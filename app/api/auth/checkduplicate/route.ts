export const runtime = 'nodejs';
// app/api/auth/checkduplicate/route.ts
import { NextRequest } from 'next/server';
import * as yup from 'yup';
import { checkDuplicateId } from '@/controllers/auth/checkDuplicateController';
import { validateBody } from '@/lib/middlewares/validate';

const checkDuplicateSchema = yup.object({
  memberId: yup.string().required('memberId는 필수 입력입니다.'),
});
// 중복 여부를 확인하는 컨트롤러를 호출하는 라우터
export async function POST(req: NextRequest) {
  const error = await validateBody(checkDuplicateSchema)(req.clone());
  if (error) return error; // 에러면 그대로 반환
  return checkDuplicateId(req); // 검증 통과 → 컨트롤러 실행
}
