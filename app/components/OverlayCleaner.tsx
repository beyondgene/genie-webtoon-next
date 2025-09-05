'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
// 오버레이 청소 컴포넌트
export default function OverlayCleaner() {
  const pathname = usePathname();

  useEffect(() => {
    // 전역 클래스/스타일 리셋
    document.body.classList.remove('overflow-hidden', 'home-overlay-open', 'no-scroll');

    // 흔히 쓰는 오버레이 DOM 제거 (선택적으로 존재하는 것들만)
    const ids = ['home-overlay', 'global-dim', 'fullscreen-skeleton'];
    ids.forEach((id) => document.getElementById(id)?.remove());

    // data-attr로 마운트된 오버레이들도 제거
    document.querySelectorAll('[data-overlay="home"]').forEach((el) => el.remove());
  }, [pathname]);

  return null;
}
