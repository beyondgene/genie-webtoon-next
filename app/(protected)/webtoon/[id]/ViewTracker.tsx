'use client';

import { useEffect, useRef } from 'react';
// webtoonview 조인 테이블에서 정보 불러오는 함수
export default function ViewTracker({ webtoonId }: { webtoonId: number }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!webtoonId) return;

    // ✅ 개발모드 StrictMode로 인한 이펙트 2회 실행만 막고,
    //    같은 탭 재방문은 정상적으로 1회씩 기록되도록 함
    if (firedRef.current) return;
    firedRef.current = true;

    fetch('/api/metrics/webtoon-view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ webtoonId }),
      cache: 'no-store',
    }).catch(() => {});
  }, [webtoonId]);

  return null;
}
