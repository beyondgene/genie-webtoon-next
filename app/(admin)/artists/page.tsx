// app/(admin)/artists/page.tsx
import { listArtists } from '@/services/admin/artists.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listArtists();

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">작가 관리</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[680px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">활동명</th>
              <th className="px-3 py-2 text-left">실명</th>
              <th className="px-3 py-2 text-left">이메일</th>
              <th className="px-3 py-2 text-left">데뷔일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.idx} className="border-t">
                <td className="px-3 py-2">{a.idx}</td>
                <td className="px-3 py-2">{a.artistName}</td>
                <td className="px-3 py-2">{a.realName}</td>
                <td className="px-3 py-2">{a.artistEmail}</td>
                <td className="px-3 py-2">{a.debutDate?.slice(0, 10) ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
