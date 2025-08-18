import GenreGrid from '@/components/public/GenreGrid';

async function getGenres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/genre/list`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [] as { name: string; slug: string; count?: number }[];
  return res.json();
}

export default async function GenresPage() {
  const genres = await getGenres();
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">장르</h1>
      <GenreGrid genres={genres} />
    </main>
  );
}
