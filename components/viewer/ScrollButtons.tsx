'use client';

import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';

type Props = {
  /** 댓글 래퍼 셀렉터. 기본: #comments */
  commentSelector?: string;
  /** 스크롤시 상단 여유(고정 헤더가 있다면 높이만큼 주면 좋음) */
  topOffset?: number;
};

export default function ScrollButtons({ commentSelector = '#comments', topOffset = 12 }: Props) {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToComments = useCallback(() => {
    // 댓글 엘리먼트를 최대한 관대한 셀렉터로 탐색
    const el =
      (document.querySelector(commentSelector) as HTMLElement | null) ||
      (document.getElementById('comments') as HTMLElement | null) ||
      (document.querySelector('[data-comments]') as HTMLElement | null);

    if (!el) {
      // 댓글이 지연 로드되는 경우를 대비해 한 번 더 시도(짧게)
      const start = performance.now();
      const tryFind = () => {
        const found =
          (document.querySelector(commentSelector) as HTMLElement | null) ||
          (document.getElementById('comments') as HTMLElement | null) ||
          (document.querySelector('[data-comments]') as HTMLElement | null);

        if (found) {
          const y = window.scrollY + found.getBoundingClientRect().top - topOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (performance.now() - start < 1500) {
          requestAnimationFrame(tryFind);
        }
      };
      requestAnimationFrame(tryFind);
      return;
    }

    const y = window.scrollY + el.getBoundingClientRect().top - topOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [commentSelector, topOffset]);

  return (
    <div
      className="
        fixed left-2 md:left-4 top-1/2 -translate-y-1/2
        flex flex-col gap-3
        z-[99999] pointer-events-auto
      "
      aria-label="뷰어 이동 버튼"
    >
      <button
        onClick={scrollToTop}
        aria-label="맨 위로"
        className="
          w-9 h-9 md:w-10 md:h-10 rounded-full
          bg-white text-black
          shadow-lg border border-black/10
          hover:scale-105 active:scale-95 transition
          flex items-center justify-center
        "
      >
        <ChevronUpIcon className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={scrollToComments}
        aria-label="댓글로 이동"
        className="
          w-9 h-9 md:w-10 md:h-10 rounded-full
          bg-white text-black
          shadow-lg border border-black/10
          hover:scale-105 active:scale-95 transition
          flex items-center justify-center
        "
      >
        <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
