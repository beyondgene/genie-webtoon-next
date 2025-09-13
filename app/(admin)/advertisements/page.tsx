// app/(admin)/advertisements/page.tsx
import Link from 'next/link';
import { listAdvertisements } from '@/services/admin/advertisements.service';
import { getAdViewStats } from '@/services/admin/advertisements-view-logs.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';

// 짧은 ISR + 리전 고정으로 TTFB 절감
export const revalidate = 60; // 1분 캐시
export const runtime = 'nodejs';
export const preferredRegion = ['icn1', 'hnd1']; // Vercel 한국/일본

// 관리자 페이지 광고 대시보드
export default async function Page() {
  const [items, stats] = await Promise.all([listAdvertisements(), getAdViewStats()]);

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">광고 대시보드</h1>

      {/* 요약 차트 */}
      <div className="grid md:grid-cols-2 gap-4">
        <SimpleBarChart
          title="광고별 노출 수"
          unit="회"
          data={stats.byAd
            .sort((a, b) => b.views - a.views)
            .slice(0, 10)
            .map((d) => ({ label: d.adName, value: d.views }))}
        />
        <SimpleBarChart
          title="회원별 광고 시청 빈도 (Top 10)"
          unit="회"
          data={stats.byMember
            .sort((a, b) => b.views - a.views)
            .slice(0, 10)
            .map((d) => ({ label: d.label, value: d.views }))}
        />
      </div>

      {/* 목록 테이블 */}
      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">이름</th>
              <th className="px-3 py-2 text-left">위치</th>
              <th className="px-3 py-2 text-left">상태</th>
              <th className="px-3 py-2 text-left">기간</th>
              <th className="px-3 py-2 text-left">노출수</th>
              <th className="px-3 py-2 text-left">로그</th>
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
                <td className="px-3 py-2">
                  <Link
                    href={`/advertisements/${ad.idx}/view-logs`}
                    className="underline text-blue-600"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
