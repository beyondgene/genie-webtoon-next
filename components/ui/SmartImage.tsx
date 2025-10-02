// components/ui/SmartImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type SmartImageProps = Omit<ImageProps, 'onError'> & {
  fallbackSrc?: string;
};

export default function SmartImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder-webtoon.png',
  sizes,
  priority,
  ...rest
}: SmartImageProps) {
  const [err, setErr] = useState(false);

  return (
    <Image
      {...rest}
      alt={alt}
      src={err ? fallbackSrc : src}
      onError={() => setErr(true)}
      // LCP 후보: priority=true, 나머지는 lazy
      priority={priority}
      // 반응형 목록/그리드에 유효한 기본 sizes 예시
      sizes={sizes ?? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px'}
      // width/height는 고정 썸네일일 때 지정, 유동이면 fill 사용
    />
  );
}
