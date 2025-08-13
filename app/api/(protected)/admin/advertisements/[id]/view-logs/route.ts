import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/advertisementViewLogsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest, { params }: { params: { adId: string } }) {
  await requireAuth(req);
  const logs = await ctrl.getAdvertisementViewLogsByAdId(+params.adId);
  return NextResponse.json(logs);
}
export const GET = withErrorHandler(GETHandler);
