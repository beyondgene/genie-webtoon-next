// app/(admin)/episodes/page.tsx
import { listEpisodes } from '@/services/admin/episodes.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listEpisodes();

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">회차 관리</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[680px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">웹툰 ID</th>
              <th className="px-3 py-2 text-left">업로드</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.idx} className="border-t">
                <td className="px-3 py-2">{e.idx}</td>
                <td className="px-3 py-2">{e.title}</td>
                <td className="px-3 py-2">{e.webtoonId}</td>
                <td className="px-3 py-2">{e.uploadDate?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
