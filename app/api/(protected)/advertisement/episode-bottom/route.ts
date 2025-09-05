import { NextResponse } from 'next/server';
import db from '@/models';
import { Op, col, where } from 'sequelize';

export const revalidate = 30;

export const dynamic = 'force-static';

// 에피소드 하단에 있는 광고에 대한 설정 get 핸들러 라우터
export async function GET(req: Request) {
  const now = new Date();

  try {
    const ad = await db.Advertisement.findOne({
      where: {
        adLocation: 'EPISODE_BOTTOM' as const,
        status: 'ACTIVE',
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },

        // 컬럼-컬럼/NULL 비교는 실제 컬럼명으로!
        [Op.or]: [
          // total_exposure_limit IS NULL
          where(col('totalExposureLimit'), Op.is, null),
          // current_exposure_count < total_exposure_limit
          where(col('currentExposureCount'), Op.lt, col('totalExposureLimit')),
        ],
      },
      order: db.sequelize.random(),
      attributes: ['idx', 'adName', 'targetUrl', 'adImageUrl'],
      raw: true,
    });

    return NextResponse.json({ ok: true, data: ad ?? null }, { status: 200 });
  } catch (e) {
    // 필요하면 서버 로그에 e 찍기
    return NextResponse.json({ ok: false, error: 'FAILED_TO_FETCH_AD' }, { status: 500 });
  }
}
