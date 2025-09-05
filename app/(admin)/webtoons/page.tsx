import { listWebtoons } from '@/services/admin/webtoons.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
export const dynamic = 'force-dynamic';
// 관리자 페이지 웹툰 대쉬보드
export default async function Page() {
  const items = await listWebtoons();
  // 장르 기준 호출
  const byGenre = Object.entries(
    items.reduce<Record<string, number>>((acc, w) => {
      acc[w.genre] = (acc[w.genre] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  // 조회수 기준 호출
  const byViewsTop = items
    .map((w) => ({ label: w.webtoonName, value: w.views ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">웹툰 관리</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <SimpleBarChart title="장르별 웹툰 수" unit="개" data={byGenre} />
        <SimpleBarChart title="조회수 Top 10" unit="회" data={byViewsTop} />
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">장르</th>
              <th className="px-3 py-2 text-left">조회수</th>
              <th className="px-3 py-2 text-left">추천</th>
              <th className="px-3 py-2 text-left">작가</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={w.idx} className="border-t">
                <td className="px-3 py-2">{w.idx}</td>
                <td className="px-3 py-2">{w.webtoonName}</td>
                <td className="px-3 py-2">{w.genre}</td>
                <td className="px-3 py-2">{(w.views ?? 0).toLocaleString()}</td>
                <td className="px-3 py-2">{w.recommend ?? 0}</td>
                <td className="px-3 py-2">{w.artistId ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
