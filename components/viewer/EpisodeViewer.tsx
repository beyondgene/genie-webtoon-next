'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EpisodeViewer.module.css';

type EpisodeRow = {
  idx?: number;
  id?: number;
  title?: string;
  epthumbnailUrl?: string | null;
  thumbnailUrl?: string | null;
  contentUrl?: string | string[] | null; // DB는 contentUrl만 사용
  uploadDate?: string | Date;
  webtoonId?: number;
};
type Props = {
  webtoonId: number;
  episodeId: number;
  episode: any; // 다양한 응답 포맷을 받아서 내부에서 정규화
  episodes: any[];
  ad?: { adImageUrl?: string; targetUrl?: string; id?: number } | null;
};

function normalizeEpisode(ep: any): EpisodeRow | null {
  // 응답이 { episode: {...} } 이면 안쪽을 꺼냄
  if (ep?.episode) return ep.episode as EpisodeRow;
  return ep as EpisodeRow;
}

function toImagesFromEpisode(input: any): string[] {
  const ep = normalizeEpisode(input);
  if (!ep) return [];
  const s = ep.contentUrl as any;

  // 배열이면 그대로
  if (Array.isArray(s)) return s.filter(Boolean);

  // 문자열이면 JSON 배열 or 콤마 구분값 모두 처리
  if (typeof s === 'string' && s.trim()) {
    try {
      const maybe = JSON.parse(s);
      if (Array.isArray(maybe)) return maybe.filter(Boolean);
    } catch {}
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [];
}
function getId(ep: any): number {
  const row = normalizeEpisode(ep);
  return Number(row?.idx ?? row?.id);
}
function getThumb(ep: any): string | null {
  const row = normalizeEpisode(ep);
  return (row?.epthumbnailUrl ?? row?.thumbnailUrl ?? null) || null;
}

export default function EpisodeViewer({ webtoonId, episodeId, episode, episodes, ad }: Props) {
  const router = useRouter();
  const images = useMemo(() => toImagesFromEpisode(episode), [episode]);

  const list = useMemo(() => {
    const arr = Array.isArray(episodes) ? episodes : [];
    return [...arr].sort((a, b) => getId(a) - getId(b));
  }, [episodes]);

  const currentIndex = list.findIndex((e) => getId(e) === episodeId);
  const prevEp = currentIndex > 0 ? list[currentIndex - 1] : null;
  const nextEp =
    currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push(`/webtoon/${webtoonId}`);
      if (e.key === 'ArrowLeft' && prevEp)
        router.push(`/webtoon/${webtoonId}/episodes/${getId(prevEp)}`);
      if (e.key === 'ArrowRight' && nextEp)
        router.push(`/webtoon/${webtoonId}/episodes/${getId(nextEp)}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, webtoonId, prevEp, nextEp]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.viewer}>
        {images.length === 0 ? (
          <div className={styles.empty}>이 에피소드에 표시할 이미지가 없습니다.</div>
        ) : (
          images.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`cut-${i + 1}`}
              className={styles.cut}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))
        )}
      </div>

      {/* 리모컨 */}
      <div className={styles.remote}>
        <button
          className={styles.remoteBtn}
          onClick={() => prevEp && router.push(`/webtoon/${webtoonId}/episodes/${getId(prevEp)}`)}
          disabled={!prevEp}
        >
          &laquo;&laquo;
        </button>
        <button className={styles.remoteBtn} onClick={() => router.push(`/webtoon/${webtoonId}`)}>
          =
        </button>
        <button
          className={styles.remoteBtn}
          onClick={() => nextEp && router.push(`/webtoon/${webtoonId}/episodes/${getId(nextEp)}`)}
          disabled={!nextEp}
        >
          &raquo;&raquo;
        </button>
      </div>

      {/* 광고 + 회차 바 */}
      <div ref={bottomRef} className={styles.bottomSection}>
        {ad?.adImageUrl ? (
          <a
            href={ad.targetUrl || '#'}
            target={ad.targetUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={styles.adBox}
          >
            <img src={ad.adImageUrl} alt="advertisement" className={styles.adImg} />
          </a>
        ) : (
          <div className={styles.adBox}>
            <div className={styles.adPlaceholder}>ADS BY GENIE WEBTOON</div>
          </div>
        )}

        <div className={styles.episodeStrip} aria-label="episodes">
          {list.map((ep) => {
            const id = getId(ep);
            const active = id === episodeId;
            const thumb = getThumb(ep);
            const title = normalizeEpisode(ep)?.title ?? `Ep. ${id}`;
            return (
              <button
                key={id}
                className={`${styles.epThumb} ${active ? styles.epThumbActive : ''}`}
                onClick={() => router.push(`/webtoon/${webtoonId}/episodes/${id}`)}
                title={title}
              >
                {thumb ? (
                  <img src={thumb} alt={title} />
                ) : (
                  <div className={styles.noThumb}>No Image</div>
                )}
                <span className={styles.epTitle}>{title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
