import { NextRequest } from 'next/server';
import { checkDuplicateId } from '@/controllers/auth/checkDuplicateController';

export async function POST(req: NextRequest) {
  return checkDuplicateId(req);
}
