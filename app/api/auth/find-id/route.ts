import { NextRequest } from 'next/server';
import { findId } from '@/controllers/auth/findIdController';

export async function POST(req: NextRequest) {
  return findId(req);
}