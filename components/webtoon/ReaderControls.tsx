// public/ViewerNav을 감싸 키보드 단축키(←/→), 모바일 하단 고정(sticky), ARIA 라벨 추가
'use client';

import * as React from 'react';
import ViewerNav from '@/components/public/ViewerNav';
import { useRouter } from 'next/navigation';

type Props = {
  webtoonId: string | number;
  prevEpId?: string | number | null;
  nextEpId?: string | number | null;
  className?: string;
};

export default function ReaderControls({ webtoonId, prevEpId, nextEpId, className = '' }: Props) {
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevEpId) {
        router.push(`/webtoon/${webtoonId}/episodes/${prevEpId}`);
      } else if (e.key === 'ArrowRight' && nextEpId) {
        router.push(`/webtoon/${webtoonId}/episodes/${nextEpId}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, webtoonId, prevEpId, nextEpId]);

  return (
    <div
      className={`sticky bottom-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${className}`}
      role="navigation"
      aria-label="웹툰 뷰어 내비게이션"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <ViewerNav webtoonId={webtoonId} prevEpId={prevEpId} nextEpId={nextEpId} />
      </div>
    </div>
  );
}
