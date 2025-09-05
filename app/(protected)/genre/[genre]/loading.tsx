// app/genre/[genre]/loading.tsx
// 장르별 카드들이 로딩되는 동안 뜨는 스켈레톤 코드
export default function LoadingGenre() {
  return (
    <main className="min-h-screen bg-[#9f9f9f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
          <aside className="rounded-3xl border border-white/20 p-6">
            <div className="h-4 w-24 animate-pulse bg-white/30" />
            <div className="mt-2 h-8 w-40 animate-pulse bg-white/30" />
            <div className="mt-4 h-20 w-full animate-pulse bg-white/20" />
          </aside>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl">
                <div className="aspect-[3/4] w-full animate-pulse bg-white/30" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
