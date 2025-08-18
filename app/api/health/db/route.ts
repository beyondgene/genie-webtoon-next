// app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { sequelize } from '@/db/sequelize';

export async function GET() {
  try {
    await sequelize.authenticate();
    const [r] = await sequelize.query('SELECT 1 AS ok');
    return NextResponse.json({ ok: true, r });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message }, { status: 500 });
  }
}
