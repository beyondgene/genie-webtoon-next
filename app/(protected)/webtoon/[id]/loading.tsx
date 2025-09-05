// 로딩중 스켈레톤 디자인
export default function LoadingWebtoon() {
  return (
    <main className="min-h-screen bg-[#929292] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-6">
            <div className="h-[678px] w-[533px] max-w-full animate-pulse rounded-2xl bg-white/20" />
            <div className="mt-8 space-y-3 text-center">
              <div className="mx-auto h-6 w-40 animate-pulse bg-white/30" />
              <div className="mx-auto h-4 w-80 animate-pulse bg-white/20" />
              <div className="mx-auto h-24 w-full max-w-[640px] animate-pulse bg-white/20" />
            </div>
          </section>
          <aside className="col-span-12 lg:col-span-6">
            <div className="h-[678px] w-[722px] max-w-full animate-pulse rounded-xl bg-white/20" />
          </aside>
        </div>
      </div>
    </main>
  );
}
