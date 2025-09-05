export type IdLike = number | string | null | undefined | { idx?: unknown; id?: unknown };

// 입력 받은 값이 숫자면 그대로 반환, 문자열이면 숫자로 변환해서 출력, object타입이면 idx,id값인지 확인후 변환
export function toNumericId(x: IdLike): number | null {
  if (x == null) return null;
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  if (typeof x === 'string') {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof x === 'object') {
    const cand = (x as any).idx ?? (x as any).id;
    const n = Number(cand);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
