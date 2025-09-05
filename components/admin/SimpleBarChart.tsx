// components/admin/SimpleBarChart.tsx
type Datum = { label: string; value: number; hint?: string };
// 아래 코드에서 사용될 데이터 타입 선언과 정의
export default function SimpleBarChart({
  title,
  data,
  unit,
  max,
}: {
  title: string;
  data: Datum[];
  unit?: string;
  max?: number;
}) {
  // 관리자 대쉬보드에서 각 영역을 누르면 db값을 막대 그래프로 표현하기 위한 컴포넌트
  const maxValue = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <section className="rounded-2xl border p-4 md:p-5 space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => {
          const ratio = Math.min(100, Math.round((d.value / maxValue) * 100));
          return (
            <div key={d.label}>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="truncate">{d.label}</span>
                <span className="tabular-nums">
                  {d.value.toLocaleString()}
                  {unit ?? ''}
                </span>
              </div>
              <div className="h-2 rounded bg-gray-100 overflow-hidden">
                <div
                  className="h-2 bg-blue-500"
                  style={{ width: `${ratio}%` }}
                  title={d.hint ?? ''}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
