import GenreGrid from '@/components/public/GenreGrid';

export const runtime = 'edge';
export const preferredRegion = ['icn1', 'hnd1'];

// api에서 장르 갖고오는 라우터 로직 호출
async function getGenres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/genre/list`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [] as { name: string; slug: string; count?: number }[];
  return res.json();
}
// 장르 화면이 확대 됐을때 나타나는 장르들
export default async function GenresPage() {
  const genres = await getGenres();
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">장르</h1>
      <GenreGrid genres={genres} />
    </main>
  );
}
