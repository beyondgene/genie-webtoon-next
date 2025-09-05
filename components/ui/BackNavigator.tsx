'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

type Props = {
  /**
   * 필요 시 페이지에서 숨기고 싶다면 false로.
   */
  showButton?: boolean;
  /**
   * 이 값이 있으면 ESC·X 클릭 시 히스토리 back 대신 이 경로로 이동합니다.
   */
  href?: string;
};

export default function BackNavigator({ showButton = true, href }: Props) {
  const router = useRouter();

  const goBack = useCallback(() => {
    // 입력 중일 때는 동작하지 않도록 예외
    const ae = document.activeElement as HTMLElement | null;
    const tag = (ae?.tagName || '').toLowerCase();
    if (ae?.isContentEditable || ['input', 'textarea', 'select'].includes(tag)) return;

    if (href) {
      router.replace(href);
    } else {
      router.back();
    }
  }, [router, href]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goBack]);

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="닫기"
      title="닫기 (Esc)"
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 50,
        width: 36,
        height: 36,
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 1)',
        background: '#4f4f4f', // 기존 #9f9f9f에서 변경
        display: 'grid',
        placeItems: 'center',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px #4f4f4f', // 기존 #9f9f9f에서 변경
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      <XMarkIcon aria-hidden="true" width={20} height={20} />
    </button>
  );
}
