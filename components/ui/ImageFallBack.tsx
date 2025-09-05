'use client';

import { useEffect, useState, ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};
// 이미지 로딩 실패시 대체 이미지 설정 컴포넌트
export default function ImageFallback({
  fallbackSrc = '/images/placeholder-webtoon.png',
  src,
  alt,
  ...rest
}: Props) {
  const [error, setError] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // src 바뀌면 다시 시도
  useEffect(() => {
    setError(false);
    setFailedSrc(null);
  }, [src]);

  const finalSrc = error ? fallbackSrc || '' : src || fallbackSrc || '';

  return (
    <div title={src as string} style={{ height: '100%' }}>
      <img
        {...rest}
        src={finalSrc}
        alt={alt}
        onError={() => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[ImageFallback] load error:', src);
          }
          setFailedSrc((src as string) || null);
          setError(true);
        }}
      />
      {/* 개발 모드에서만 실패 URL 텍스트 노출 (아주 작게) */}
      {process.env.NODE_ENV !== 'production' && failedSrc && (
        <div style={{ fontSize: 10, color: '#fff9', marginTop: 2, wordBreak: 'break-all' }}>
          fail: {failedSrc}
        </div>
      )}
    </div>
  );
}
