'use client';
import Link from 'next/link';
// 장르 속성이 그리드 디자인에서 나열되는 설정 컴포넌트
type Genre = { name: string; slug: string; count?: number };
export default function GenreGrid({ genres }: { genres: Genre[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {genres.map((g) => (
        <Link
          key={g.slug}
          href={`/genre/${g.slug}`}
          className="rounded-2xl border bg-white p-4 shadow hover:shadow-md"
        >
          <div className="text-lg font-semibold">{g.name}</div>
          {typeof g.count === 'number' && (
            <div className="text-xs text-zinc-500">{g.count} 작품</div>
          )}
        </Link>
      ))}
    </div>
  );
}
