'use client';

import dynamic from 'next/dynamic';

const CommentSection = dynamic(() => import('@/components/viewer/CommentSection'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center text-black/60">댓글 불러오는 중…</div>
  ),
});

type Props = {
  webtoonId: number;
  episodeId: number;
};

export default function CommentSectionClient(props: Props) {
  return <CommentSection {...props} />;
}
