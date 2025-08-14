// app/(admin)/webtoons/page.tsx
import { listWebtoons } from '@/services/admin/webtoons.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listWebtoons();

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">웹툰 관리</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">장르</th>
              <th className="px-3 py-2 text-left">조회수</th>
              <th className="px-3 py-2 text-left">추천</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={w.idx} className="border-t">
                <td className="px-3 py-2">{w.idx}</td>
                <td className="px-3 py-2">{w.webtoonName}</td>
                <td className="px-3 py-2">{w.genre}</td>
                <td className="px-3 py-2">{w.views ?? '-'}</td>
                <td className="px-3 py-2">{w.recommend ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
