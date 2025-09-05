// app/api/(protected)/admin/episodes/[id]/thumbnail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import * as ctrl from '@/controllers/admin/episodesController';

type Body = {
  /** 전체 공개 URL. 예) https://...amazonaws.com/webtoon-thumbnail/alone_levelup.png */
  url?: string;
  /** S3 객체 키. 예) webtoon-thumbnail/alone_levelup.png */
  key?: string;
};

// 에피소드 썸네일을 불러오는 컨트롤러를 호출하는 put 핸들러 라우터
async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);

  const { url, key }: Body = await req.json();
  if (!url && !key) {
    return NextResponse.json({ error: 'url 또는 key 중 하나는 필수입니다.' }, { status: 400 });
  }

  // .env.local 예) S3_PUBLIC_BASE=https://geniewebtoon-bucket.s3.ap-northeast-2.amazonaws.com
  const base = process.env.S3_PUBLIC_BASE?.replace(/\/+$/, '') ?? '';
  const finalUrl =
    url?.trim() ??
    (base
      ? `${base}/${String(key).replace(/^\/+/, '')}`
      : (() => {
          throw new Error('S3_PUBLIC_BASE 환경변수가 설정되지 않았습니다.');
        })());
  // 에러 처리
  if (!finalUrl.startsWith(base)) {
    return NextResponse.json({ error: '허용되지 않은 이미지 URL입니다.' }, { status: 400 });
  }

  const id = Number(params.id);
  const updated = await ctrl.updateEpisode(id, { epthumbnailUrl: finalUrl });

  return NextResponse.json({ idx: updated.idx, epthumbnailUrl: updated.epthumbnailUrl });
}

export const PUT = withErrorHandler(PUTHandler);
