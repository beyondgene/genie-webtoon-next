import { NextRequest } from 'next/server';
import { findPassword } from '@/controllers/auth/findPasswordController';

export async function POST(req: NextRequest) {
  return findPassword(req);
}
