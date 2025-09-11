export const runtime = 'nodejs';
// app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { sequelize } from '@/db/sequelize';

// db에서 정보 갖고올때 sequelize 에러 방지
export async function GET() {
  try {
    await sequelize.authenticate();
    const [r] = await sequelize.query('SELECT 1 AS ok');
    return NextResponse.json({ ok: true, r });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message }, { status: 500 });
  }
}
