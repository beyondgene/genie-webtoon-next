'use client';

import Image from 'next/image';
import * as React from 'react';

export type AdData = {
  idx: number;
  imageUrl: string;
  targetUrl: string;
  alt?: string;
};

type Props = {
  ad?: AdData;
  loading?: boolean;
  className?: string;
  placement?: 'episode-footer' | 'home-hero' | 'sidebar';
  onLogClick?: (payload: { adId: number; placement?: Props['placement']; ts: number }) => void;
};

export default function AdBanner({ ad, loading, className = '', placement, onLogClick }: Props) {
  if (loading || !ad)
    return (
      <div
        className={`h-24 sm:h-28 md:h-32 lg:h-36 w-full animate-pulse rounded-2xl bg-zinc-200 ${className}`}
      />
    );

  const handleClick = () => onLogClick?.({ adId: ad.idx, placement, ts: Date.now() });

  return (
    <a
      href={ad.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      data-ad-id={ad.idx}
      data-ad-placement={placement}
      className={`block overflow-hidden rounded-2xl border shadow hover:opacity-95 ${className}`}
      aria-label="스폰서 배너"
    >
      <div className="relative h-24 sm:h-28 md:h-32 lg:h-36 w-full">
        <Image
          src={ad.imageUrl}
          alt={ad.alt ?? 'Advertisement'}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </a>
  );
}
