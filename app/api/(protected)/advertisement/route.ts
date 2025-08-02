import { NextRequest, NextResponse } from 'next/server';
import { getActiveAds, createAd } from '@/controllers/advertisement';
import { requireAdminAuth } from '@/lib/middlewares/requireAdminAuth';
import { requireAuth } from '@/lib/middlewares/requireAuth'; // 로그인 전용 가드

export async function GET(req: NextRequest) {
  // 로그인 여부만 체크
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const ads = await getActiveAds();
    return NextResponse.json(ads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 관리자 권한 체크
  const admin = await requireAdminAuth(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { imageUrl, linkUrl, position, priority } = (await req.json()) as {
      imageUrl: string;
      linkUrl: string;
      position: string;
      priority: number;
    };
    const ad = await createAd({ imageUrl, linkUrl, position, priority });
    return NextResponse.json(ad, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
