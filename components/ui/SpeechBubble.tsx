import React from 'react';

/**
 * Reusable speech bubble component for Genie Webtoon
 * - Primary color: #ff6d00 (customizable via `color`)
 * - "Thick" outline by default (customizable via `thickness`)
 * - Tail sits near the bottom-left corner
 * - Moderate roundness (rounded-xl by default)
 * - Two variants: "outline" (default, BORDER ONLY — fill follows parent) and "solid"
 *
 * Usage examples:
 *   // border-only orange, fill follows parent bg (default)
 *   <SpeechBubble>바로가기</SpeechBubble>
 *   // border-only orange, but force white fill explicitly
 *   <SpeechBubble fill="#fff">장르별 추천</SpeechBubble>
 *   // fully filled orange
 *   <SpeechBubble variant="solid">추천 웹툰</SpeechBubble>
 */

export type SpeechBubbleProps = {
  children: React.ReactNode;
  /** 'outline' (thick #ff6d00 border, fill follows parent unless `fill` given) or 'solid' (filled #ff6d00) */
  variant?: 'outline' | 'solid';
  /** Border thickness in px (outline only). Default: 4 */
  thickness?: number;
  /** Tail size in px (triangle leg length). Default: 14 */
  tailSize?: number;
  /** Horizontal offset of tail from the left edge in px. Default: 18 */
  tailOffset?: number;
  /** Border/primary color. Default: '#ff6d00' */
  color?: string;
  /** Outline fill color. Defaults to 'inherit' (follows parent). Use '#fff' for white or 'transparent' to punch through. */
  fill?: string;
  /** Roundness preset. Default: 'xl' */
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  /** Extra classes for layout/spacing */
  className?: string;
};

const radiusClass = (r: SpeechBubbleProps['radius']) => {
  switch (r) {
    case 'md':
      return 'rounded-md';
    case 'lg':
      return 'rounded-lg';
    case '2xl':
      return 'rounded-2xl';
    case 'xl':
    default:
      return 'rounded-xl';
  }
};

export default function SpeechBubble({
  children,
  variant = 'outline',
  thickness = 4,
  tailSize = 14,
  tailOffset = 18,
  color = '#ff6d00',
  fill = 'transparent', // follows parent visually by showing parent bg
  radius = 'xl',
  className = '',
}: SpeechBubbleProps) {
  // Inline CSS variables for color & geometry (works with Tailwind safely)
  const styleVars: React.CSSProperties = {
    '--bubble-color': color,
    '--bubble-fill': variant === 'solid' ? color : fill,
    '--bubble-thickness': `${thickness}px`,
    '--tail-size': `${tailSize}px`,
    '--tail-offset': `${tailOffset}px`,
  } as React.CSSProperties;

  const base = `relative inline-block max-w-full ${radiusClass(radius)}`;

  const outlineBox = `bg-[var(--bubble-fill)] px-4 py-3 shadow-sm`; // border is now enforced inline to guarantee #ff6d00
  const solidBox = `bg-[var(--bubble-color)] text-white px-4 py-3 shadow-sm`;

  return (
    <div
      className={`${base} ${variant === 'solid' ? solidBox : outlineBox} ${className}`}
      style={
        variant === 'solid'
          ? { ...styleVars, fontSize: 'inherit', lineHeight: 'inherit' }
          : {
              ...styleVars,
              borderStyle: 'solid',
              borderWidth: thickness,
              borderColor: color,
              fontSize: 'inherit',
              lineHeight: 'inherit',
            }
      }
    >
      {/* Content */}
      <div className="break-words hyphens-auto">{children}</div>

      {/* Tail: bottom-left. For outline, we use two triangles to simulate border-only tail. */}
      <div className="pointer-events-none absolute bottom-0 left-0">
        {variant === 'solid' ? (
          // Single triangle matching the solid color
          <span
            aria-hidden
            className="absolute"
            style={{
              left: 'var(--tail-offset)',
              bottom: 'calc(var(--tail-size) * -1)',
              width: 0,
              height: 0,
              borderRight: 'var(--tail-size) solid transparent',
              borderTop: 'var(--tail-size) solid var(--bubble-color)',
            }}
          />
        ) : (
          <>
            {/* Outer triangle (border color) */}
            <span
              aria-hidden
              className="absolute"
              style={{
                left: 'calc(var(--tail-offset) - 2px)',
                bottom: 'calc((var(--tail-size) + var(--bubble-thickness)) * -1)',
                width: 0,
                height: 0,
                borderRight: 'calc(var(--tail-size) + 2px) solid transparent',
                borderTop: 'calc(var(--tail-size) + 2px) solid var(--bubble-color)',
              }}
            />
            {/* Inner triangle (fill color) — follows parent by default ('inherit'), or explicit `fill` */}
            <span
              aria-hidden
              className="absolute"
              style={{
                left: 'var(--tail-offset)',
                bottom: 'calc(var(--tail-size) * -1)',
                width: 0,
                height: 0,
                borderRight: 'var(--tail-size) solid transparent',
                borderTop: 'var(--tail-size) solid var(--bubble-fill)',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
