// 웹툰 컨트롤러를 하나로 모아서 index.ts만 호출해도 나머지 컨트롤러를 한번에 호출할 수 있도록 캡슐화 해놓은 파일
export { getDailyRanking } from './dailyRankingController';
export { getWeeklyRanking } from './weeklyRankingController';
export { getMonthlyRanking } from './monthlyRankingController';
export { getYearlyRanking } from './yearlyRankingController';
