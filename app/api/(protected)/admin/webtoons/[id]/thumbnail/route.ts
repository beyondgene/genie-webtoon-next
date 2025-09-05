// app/api/(protected)/admin/webtoons/[id]/thumbnail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import * as ctrl from '@/controllers/admin/webtoonsController';

type Body = {
  /** 전체 공개 URL. 예) https://...amazonaws.com/webtoon-thumbnail/alone_levelup.png */
  url?: string;
  /** S3 객체 키. 예) webtoon-thumbnail/alone_levelup.png */
  key?: string;
};
// 웹툰 썸네일 불러와서 화면에 배치하는 put 컨트롤러를 호출하는 라우터
async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);

  const { url, key }: Body = await req.json();
  if (!url && !key) {
    return NextResponse.json({ error: 'url 또는 key 중 하나는 필수입니다.' }, { status: 400 });
  }

  // .env.local 에 이미 존재: S3_PUBLIC_BASE=https://<bucket>.s3.<region>.amazonaws.com
  const base = process.env.S3_PUBLIC_BASE?.replace(/\/+$/, '') ?? '';
  const finalUrl =
    url?.trim() ??
    (base
      ? `${base}/${String(key).replace(/^\/+/, '')}`
      : (() => {
          throw new Error('S3_PUBLIC_BASE 환경변수가 설정되지 않았습니다.');
        })());

  // 필요 시 간단 검증 (우리 버킷/도메인만 허용)
  if (!finalUrl.startsWith(base)) {
    return NextResponse.json({ error: '허용되지 않은 이미지 URL입니다.' }, { status: 400 });
  }

  const id = Number(params.id);
  const updated = await ctrl.updateWebtoon(id, { wbthumbnailUrl: finalUrl });

  return NextResponse.json({ idx: updated.idx, wbthumbnailUrl: updated.wbthumbnailUrl });
}

export const PUT = withErrorHandler(PUTHandler);
