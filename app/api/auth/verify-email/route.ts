export const runtime = 'nodejs';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { NextRequest } from 'next/server';
import { verifyEmail } from '@/controllers/auth/verifyEmailController';
// 이메일 검증 라우터(컨트롤러에서 주요 로직 처리)
async function GETHandler(req: NextRequest) {
  return verifyEmail(req);
}
export const GET = withErrorHandler(GETHandler);
