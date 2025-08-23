// app/(public)/artist/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';

type ArtistDTO = {
  id: number;
  artistName: string;
  profileImageUrl?: string | null;
  bio?: string | null;
};

type ArtistWebtoonDTO = {
  idx: number;
  webtoonName: string;
  wbthumbnailUrl?: string | null;
  genre?: string;
  views?: number;
};

async function fetchJSON<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export default async function ArtistPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // 1) 퍼블릭 GET 우선 시도 (권장 라우트: /api/(public)/artist/[id])
  let artist = await fetchJSON<ArtistDTO>(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/artist/${id}`
  );
  // 보호 라우트인 경우 { artist } 래핑일 수 있어 언랩 처리
  if (artist && (artist as any).artist) artist = (artist as any).artist;

  // 2) 아티스트의 작품 목록 (권장 라우트: /api/(public)/artist/[id]/webtoons)
  let webtoons = await fetchJSON<{ webtoons: ArtistWebtoonDTO[] }>(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/artist/${id}/webtoons`
  );
  const list: ArtistWebtoonDTO[] =
    webtoons?.webtoons ?? (Array.isArray(webtoons) ? (webtoons as any) : []);

  if (!artist) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold">작가 정보를 불러오지 못했습니다.</h1>
        <p className="mt-2 text-sm text-zinc-600">
          퍼블릭 아티스트 API를 열어주세요: <code>/api/(public)/artist/[id]</code>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="flex items-start gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-zinc-100">
          <Image
            src={artist.profileImageUrl || '/placeholder.png'}
            alt={artist.artistName}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{artist.artistName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">{artist.bio || '소개가 없습니다.'}</p>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">대표 작품</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((w) => (
            <li key={w.idx} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <Link href={`/webtoon/${w.idx}`} className="block">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={w.wbthumbnailUrl || '/placeholder.png'}
                    alt={w.webtoonName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="truncate font-medium">{w.webtoonName}</div>
                  {w.genre && <div className="text-xs text-zinc-500">{w.genre}</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
