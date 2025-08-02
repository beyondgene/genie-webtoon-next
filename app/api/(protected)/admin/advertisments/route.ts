import { NextRequest, NextResponse } from 'next/server';
import { fn, col } from 'sequelize';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    // 광고 리스트 + 노출 카운트
    const ads = await db.Advertisement.findAll({
      attributes: [
        'idx',
        'ad_name',
        'ad_location',
        'status',
        'start_date',
        'end_date',
        'total_exposure_limit',
        'current_exposure_count',
        'ad_image_url',
        'target_url',
        'createdAt',
        'updatedAt',
        [fn('COUNT', col('AdViewLogs.idx')), 'viewCount']
      ],
      include: [
        { model: db.AdViewLog, attributes: [] } // 집계용
      ],
      group: ['Advertisement.idx']
    });
    return NextResponse.json(ads);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const {
      ad_name,
      ad_location,
      status,
      start_date,
      end_date,
      total_exposure_limit,
      ad_image_url,
      target_url
    } = await req.json();

    const ad = await db.Advertisement.create({
      ad_name,
      ad_location,
      status,
      start_date,
      end_date,
      total_exposure_limit,
      current_exposure_count: 0,
      ad_image_url,
      target_url,
      adminId: sessionOrRes.id
    });
    return NextResponse.json(ad, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
