import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { NextRequest } from 'next/server';
import { verifyEmail } from '@/controllers/auth/verifyEmailController';

async function GETHandler(req: NextRequest) {
  return verifyEmail(req);
}
export const GET = withErrorHandler(GETHandler);
