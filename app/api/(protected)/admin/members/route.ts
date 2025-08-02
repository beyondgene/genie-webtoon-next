import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  try {
    const members = await db.User.findAll({
      attributes: [
        'idx',
        'memberId',
        'nickname',
        'name',
        'age',
        'gender',
        'email',
        'phoneNumber',
        'address',
        'status',
        'isActive',
        'createdAt',
        'updatedAt'
      ]
    });
    return NextResponse.json(members);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
