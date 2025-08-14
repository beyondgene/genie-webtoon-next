// app/(admin)/advertisements/page.tsx
import { listAdvertisements } from '@/services/admin/advertisements.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listAdvertisements();

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">광고 관리</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">이름</th>
              <th className="px-3 py-2 text-left">위치</th>
              <th className="px-3 py-2 text-left">상태</th>
              <th className="px-3 py-2 text-left">기간</th>
              <th className="px-3 py-2 text-left">노출수</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ad) => (
              <tr key={ad.idx} className="border-t">
                <td className="px-3 py-2">{ad.idx}</td>
                <td className="px-3 py-2">{ad.adName}</td>
                <td className="px-3 py-2">{ad.adLocation}</td>
                <td className="px-3 py-2">{ad.status}</td>
                <td className="px-3 py-2">
                  {ad.startDate?.slice(0, 10)} ~ {ad.endDate?.slice(0, 10)}
                </td>
                <td className="px-3 py-2">{ad.currentExposureCount?.toLocaleString?.() ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
