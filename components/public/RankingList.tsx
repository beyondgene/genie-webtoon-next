'use client';
import Image from 'next/image';
import Link from 'next/link';
import { formatK } from '@/lib/format';

export type Item = {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  views?: number;
  rank?: number;
};
export default function RankingList({ items }: { items: Item[] }) {
  const rest = items.slice(3);
  return (
    <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {rest.map((w, i) => (
        <li key={w.idx} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <Link href={`/webtoon/${w.idx}`} className="block">
            <div className="relative aspect-[3/4]">
              <Image src={w.thumbnailUrl} alt={w.webtoonName} fill className="object-cover" />
              <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                #{w.rank ?? i + 4}
              </div>
            </div>
            <div className="p-3">
              <div className="truncate font-medium">{w.webtoonName}</div>
              {typeof w.views === 'number' && (
                <div className="text-xs text-zinc-500">{formatK(w.views)} views</div>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
