'use client';
import Image from 'next/image';
import Link from 'next/link';
import { formatK } from '@/lib/format';

type Item = { idx: number; webtoonName: string; thumbnailUrl: string; views?: number };
export default function Podium({ items }: { items: Item[] }) {
  const top3 = items.slice(0, 3);
  return (
    <div className="grid grid-cols-3 gap-4">
      {top3.map((w, i) => (
        <Link key={w.idx} href={`/webtoon/${w.idx}`} className="group">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow">
            <Image
              src={w.thumbnailUrl}
              alt={w.webtoonName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="font-semibold">
              {i + 1}. {w.webtoonName}
            </div>
            {typeof w.views === 'number' && (
              <span className="text-xs text-zinc-500">{formatK(w.views)}👀</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
