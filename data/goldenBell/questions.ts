export type GoldenBellQuestion = {
  q: string;
  choices: string[];
  answer: number;
};

export type GoldenBellQuestionSet = {
  webtoonId: number;
  webtoonName: string;
  questions: GoldenBellQuestion[];
};

const QUESTION_SETS: Record<number, { webtoonName: string; questions: GoldenBellQuestion[] }> = {
  26: {
    webtoonName: '김부장',
    questions: [
      {
        q: '〈김부장〉의 세계관을 공유하는 작품은?',
        choices: ['외모지상주의', '전지적 독자 시점', '나 혼자만 레벨업', '기기괴괴'],
        answer: 0,
      },
      {
        q: '김부장이 생업을 그만둔 이유는?',
        choices: ['회사 부도', '딸 민지를 지키기 위해', '상사의 음모', '병환 치료'],
        answer: 1,
      },
      { q: '김부장의 과거 직업은?', choices: ['변호사', '특수요원', '형사', '요리사'], answer: 1 },
      {
        q: '〈김부장〉 웹툰의 기본 장르는?',
        choices: ['로맨스', '액션', '개그', '스포츠'],
        answer: 1,
      },
    ],
  },
  27: {
    webtoonName: '사신소년',
    questions: [
      {
        q: '〈사신소년〉 주인공의 능력은 무엇을 대가로 발동되나?',
        choices: ['돈', '우정', '수명', '기억'],
        answer: 2,
      },
      {
        q: '〈사신소년〉의 장르는?',
        choices: ['드라마', '액션', '스릴러', '판타지 로맨스'],
        answer: 1,
      },
      {
        q: '주인공이 능력을 빌리는 대상은?',
        choices: ['전설의 영웅', '외계인', '죽은 자', '동물'],
        answer: 2,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진코믹스', '픽코마'],
        answer: 0,
      },
    ],
  },
  28: {
    webtoonName: '재벌집 막내아들',
    questions: [
      {
        q: '윤현우가 회귀/환생해 살게 되는 인물은?',
        choices: ['진도준', '김독자', '성진우', '유중혁'],
        answer: 0,
      },
      {
        q: '윤현우의 원래 직책은 순양그룹의 무엇인가?',
        choices: ['비서', '실장', '차장', '팀장'],
        answer: 1,
      },
      {
        q: '작품의 핵심 무대가 되는 그룹명은?',
        choices: ['순양그룹', '제우그룹', '한양그룹', '신광그룹'],
        answer: 0,
      },
      { q: '이 작품의 원작 형식은?', choices: ['웹소설', '영화', '연극', '다큐멘터리'], answer: 0 },
    ],
  },
  29: {
    webtoonName: '백수세끼',
    questions: [
      {
        q: '〈백수세계〉의 기본 장르는?',
        choices: ['드라마', '로맨스', '스릴러', '스포츠'],
        answer: 0,
      },
      {
        q: '작품의 핵심 정서는?',
        choices: ['무직/재도전과 관계', '학교폭력 복수극', '괴담 옴니버스', '프로 스포츠 리그'],
        answer: 0,
      },
      {
        q: '주요 전개 방식으로 가장 알맞은 것은?',
        choices: ['일상 기반 연속극', '단편 옴니버스', '배틀 토너먼트', '추리 에피소드'],
        answer: 0,
      },
      {
        q: '다음 중 작품 분위기와 가장 거리가 먼 것은?',
        choices: ['현실 고민', '사회 초년생', '가정의 일상', '슈퍼파워 액션'],
        answer: 3,
      },
    ],
  },
  30: {
    webtoonName: '전지적 독자 시점',
    questions: [
      {
        q: '주인공 김독자가 “오직 나만 완주”했던 것은?',
        choices: ['드라마 대본', '소설', '만화', '게임'],
        answer: 1,
      },
      {
        q: '김독자가 읽은 소설의 제목은?',
        choices: [
          '그림자 군주',
          '멸망한 세계에서 살아남는 세 가지 방법',
          '재벌집 막내아들',
          '던전 일지',
        ],
        answer: 1,
      },
      {
        q: '김독자가 손잡는 원작 소설의 주인공은?',
        choices: ['성진우', '진도준', '유중혁', '김부장'],
        answer: 2,
      },
      {
        q: '웹툰 작화를 맡은 스튜디오/팀으로 맞는 것은?',
        choices: ['YLAB', 'Redice Studio', 'Studio JHS', 'RIDI STUDIO'],
        answer: 1,
      },
    ],
  },
  31: {
    webtoonName: '나 혼자만 레벨업',
    questions: [
      {
        q: '〈나 혼자만 레벨업〉의 주인공 이름은?',
        choices: ['김독자', '성진우', '유중혁', '진도준'],
        answer: 1,
      },
      {
        q: '게이트 안에서 싸우는 각성자들을 부르는 용어는?',
        choices: ['탐험가', '헌터', '정찰자', '워커'],
        answer: 1,
      },
      {
        q: '성진우의 대표 핵심 능력은?',
        choices: ['시간 역행', '그림자 지배', '염동력', '투명화'],
        answer: 1,
      },
      {
        q: '원작/웹툰이 처음 연재된 주요 플랫폼은?',
        choices: ['카카오페이지', '네이버 웹툰', '레진', '탑툰'],
        answer: 0,
      },
    ],
  },
  32: {
    webtoonName: '방구석 재민이',
    questions: [
      {
        q: '작품의 핵심 테마는?',
        choices: ['게임/집순이·집돌이의 일상', '좀비 생존', '회사 정치', '귀신 퇴마'],
        answer: 0,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '픽코마'],
        answer: 0,
      },
      { q: '작가(필명)는?', choices: ['뽈쟁이', '강견', '류', '오성대'], answer: 0 },
      { q: '장르는?', choices: ['개그/에피소드', '스릴러', '스포츠', 'SF'], answer: 0 },
    ],
  },
  33: {
    webtoonName: '수능일기',
    questions: [
      {
        q: '〈수능일기〉의 작가는?',
        choices: ['자까', '오성대', '강태진', '나(작가명)'],
        answer: 0,
      },
      {
        q: '작품의 배경/주제는?',
        choices: ['기숙학원 수험생활', '회사 생활', '군대 일상', '야구부 이야기'],
        answer: 0,
      },
      {
        q: '연재 분량으로 맞는 것은?',
        choices: ['총 16화', '총 50화', '총 100화', '총 291화'],
        answer: 0,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '탑툰', '문피아'],
        answer: 0,
      },
    ],
  },
  34: {
    webtoonName: '귀혼',
    questions: [
      {
        q: '〈귀혼〉 주인공 천령이 가진 특별한 능력은?',
        choices: ['염동력', '영안', '시간정지', '순간이동'],
        answer: 1,
      },
      {
        q: '천령의 가문은 무슨 일을 하는 가문인가?',
        choices: ['퇴귀/퇴마', '의술', '검술', '요리'],
        answer: 0,
      },
      {
        q: '작품의 정서/장르로 알맞은 것은?',
        choices: ['호러 옴니버스', '로맨스 드라마 판타지', '실화 다큐', '스포츠'],
        answer: 1,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '문피아'],
        answer: 0,
      },
    ],
  },
  35: {
    webtoonName: '레베카의 기도',
    questions: [
      {
        q: '작품의 시대·지역 배경은?',
        choices: ['조선 후기 한양', '산업혁명기 영국 런던', '근대 일본 오사카', '미국 서부 개척기'],
        answer: 1,
      },
      {
        q: '레베카의 출신은?',
        choices: ['귀족가문', '구빈원', '중산층 상인 집안', '왕실'],
        answer: 1,
      },
      {
        q: '레베카가 선택한 극단적 행동은?',
        choices: ['상속녀의 운명을 훔친다', '왕궁에 들어간다', '수녀가 된다', '해적단에 들어간다'],
        answer: 0,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '문피아'],
        answer: 0,
      },
    ],
  },
  36: {
    webtoonName: '육아일기',
    questions: [
      {
        q: '〈육아일기〉의 기본 장르는?',
        choices: ['액션', '라이프', '스릴러', '판타지'],
        answer: 1,
      },
      {
        q: '작품의 주요 소재는?',
        choices: ['아기와 부모의 일상', '귀신 퇴마 이야기', '좀비 생존', '대기업 승계'],
        answer: 0,
      },
      {
        q: '연재 톤/형식으로 맞는 것은?',
        choices: ['에세이형 에피소드', '미궁 공략 배틀', '범죄 추리물', '스포츠 경기 중계'],
        answer: 0,
      },
      {
        q: '다음 중 작품과 가장 거리가 먼 키워드는?',
        choices: ['육아템/공감', '밤샘/체력전', '아이 성장', '검술 대결'],
        answer: 3,
      },
    ],
  },
  37: {
    webtoonName: '독립일기',
    questions: [
      { q: '〈독립일기〉의 작가는?', choices: ['자까', '오성대', '산경', 'UMI'], answer: 0 },
      {
        q: '작품의 주요 소재는?',
        choices: ['자취/1인 가구의 일상', '고교 야구', '던전 공략', '재벌가 승계전'],
        answer: 0,
      },
      { q: '작품 상태는?', choices: ['연재중', '완결', '연재 예정', '단행본 미공개'], answer: 1 },
      {
        q: '〈독립일기〉의 프리퀄 격으로 이어지는 자까의 작품은?',
        choices: ['수능일기', '대학일기', '서랍일기', '게임일기'],
        answer: 0,
      },
    ],
  },
  38: {
    webtoonName: '내향남녀',
    questions: [
      {
        q: '남녀 주인공이 서로 오해를 풀어가는 학원 로맨스에서 남주 이름은?',
        choices: ['자유', '자혁', '진도준', '성진우'],
        answer: 1,
      },
      {
        q: '여주(또는 주요 주인공)의 이름은?',
        choices: ['자유', '민지', '해인', '도아'],
        answer: 0,
      },
      { q: '작가명(필명)은?', choices: ['나', '자까', '오성대', '산경'], answer: 0 },
      {
        q: '작품의 키워드로 알맞은 것은?',
        choices: ['극I 내향형·MBTI 테마', '좀비·아포칼립스', '시대극 스릴러', '사이버펑크'],
        answer: 0,
      },
    ],
  },
  39: {
    webtoonName: '이직로그',
    questions: [
      {
        q: '〈이직로그〉의 배경 조직 형태는?',
        choices: ['스타트업 회사', '고등학교', '군부대', '병원'],
        answer: 0,
      },
      {
        q: '두 주인공의 조합으로 맞는 것은?',
        choices: ['조이 & 맥스', '자유 & 자혁', '도준 & 해인', '민지 & 현우'],
        answer: 0,
      },
      { q: '장르는?', choices: ['로맨스', '공포', '스포츠', '무협'], answer: 0 },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '픽코마'],
        answer: 0,
      },
    ],
  },
  40: {
    webtoonName: '위닝샷!',
    questions: [
      { q: '〈위닝샷!〉이 다루는 스포츠는?', choices: ['축구', '야구', '농구', '배구'], answer: 1 },
      { q: '주요 투수 주인공 이름은?', choices: ['안시윤', '백태오', '성진우', '자혁'], answer: 0 },
      {
        q: '안시윤과 배터리를 이루는 포수 캐릭터는?',
        choices: ['유중혁', '백태오', '진도준', '김독자'],
        answer: 1,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '픽코마'],
        answer: 0,
      },
    ],
  },
  41: {
    webtoonName: '낫오버',
    questions: [
      {
        q: '〈낫오버!〉에서 주인공들이 속한 팀은?',
        choices: ['대장고 야구부', '청명고 야구부', '한결고 야구부', '서라벌고 야구부'],
        answer: 0,
      },
      {
        q: '다음 중 〈낫오버!〉의 두 주인공 조합으로 맞는 것은?',
        choices: ['정노을 & 송다빈', '김독자 & 유중혁', '성진우 & 차해린', '진도준 & 서민영'],
        answer: 0,
      },
      {
        q: '〈낫오버!〉의 작가는?',
        choices: ['돌석', '주호민', '산경', 'SIU'],
        answer: 0,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '픽코마'],
        answer: 0,
      },
    ],
  },
  42: {
    webtoonName: '기기괴괴2',
    questions: [
      {
        q: '〈기기괴괴〉의 작가는?',
        choices: ['슬리피-C', '오성대', '자까', '나(작가명)'],
        answer: 1,
      },
      {
        q: '작품의 형식/성격으로 알맞은 것은?',
        choices: ['장편 로맨스 연재', '단편 옴니버스 괴담', '스포츠 성장물', '하이브리드 판타지'],
        answer: 1,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '픽코마'],
        answer: 0,
      },
      {
        q: '현재 표시되는 상태는?',
        choices: ['완결작', '연재중', '휴재', '단행본만 존재'],
        answer: 0,
      },
    ],
  },
  43: {
    webtoonName: '사변괴담',
    questions: [
      {
        q: '〈사번괴담〉의 기본 장르는?',
        choices: ['스릴러', '로맨스', '스포츠', '개그'],
        answer: 0,
      },
      {
        q: '작품의 주요 배경은?',
        choices: ['회사/사무실', '고등학교', '야구장', '중세 왕국'],
        answer: 0,
      },
      {
        q: '서사 형식으로 가장 알맞은 것은?',
        choices: ['옴니버스 괴담', '장기 연애담', '리그 경기 기록', '궁중 사극'],
        answer: 0,
      },
      {
        q: '연재 플랫폼은?',
        choices: ['네이버 웹툰', '카카오페이지', '레진', '픽코마'],
        answer: 0,
      },
    ],
  },
};

export const GOLDEN_BELL_QUESTION_SET_META = Object.entries(QUESTION_SETS).map(([id, value]) => ({
  webtoonId: Number(id),
  webtoonName: value.webtoonName,
  questionCount: value.questions.length,
}));

export function getGoldenBellQuestionSet(webtoonId: number): GoldenBellQuestionSet | undefined {
  const set = QUESTION_SETS[webtoonId];
  if (!set) return undefined;
  return { webtoonId, webtoonName: set.webtoonName, questions: set.questions };
}
