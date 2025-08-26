export type IdLike = number | string | null | undefined | { idx?: unknown; id?: unknown };

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
