import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/advertisementViewLogsController';

export async function GET(req: NextRequest, { params }: { params: { adId: string } }) {
  await requireAuth(req);
  const logs = await ctrl.getAdvertisementViewLogsByAdId(+params.adId);
  return NextResponse.json(logs);
}
