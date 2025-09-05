// 1000보다 큰 n값에 대해 정규화 수정값을 제공해주는 포멧코드
export const formatK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);
