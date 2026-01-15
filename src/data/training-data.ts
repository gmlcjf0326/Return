// 계산력 게임 문제 데이터
export interface CalculationProblem {
  id: string;
  question: string;
  answer: number;
  options: number[];
  difficulty: 1 | 2 | 3 | 4;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
}

// 레벨별 계산 문제 생성
export function generateCalculationProblems(level: number, count: number = 10): CalculationProblem[] {
  const problems: CalculationProblem[] = [];

  for (let i = 0; i < count; i++) {
    let problem: CalculationProblem;

    switch (level) {
      case 1: // 쉬움: 한 자리 덧셈/뺄셈
        problem = generateLevel1Problem(i);
        break;
      case 2: // 보통: 두 자리 덧셈/뺄셈
        problem = generateLevel2Problem(i);
        break;
      case 3: // 어려움: 곱셈/나눗셈 포함
        problem = generateLevel3Problem(i);
        break;
      case 4: // 전문가: 복합 연산
        problem = generateLevel4Problem(i);
        break;
      default:
        problem = generateLevel1Problem(i);
    }

    problems.push(problem);
  }

  return problems;
}

function generateLevel1Problem(index: number): CalculationProblem {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const isAddition = Math.random() > 0.5;

  const question = isAddition ? `${a} + ${b} = ?` : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
  const answer = isAddition ? a + b : Math.max(a, b) - Math.min(a, b);

  return {
    id: `calc-1-${index}`,
    question,
    answer,
    options: generateOptions(answer, 0, 18),
    difficulty: 1,
    type: isAddition ? 'addition' : 'subtraction',
  };
}

function generateLevel2Problem(index: number): CalculationProblem {
  const a = Math.floor(Math.random() * 50) + 10;
  const b = Math.floor(Math.random() * 30) + 5;
  const isAddition = Math.random() > 0.5;

  const question = isAddition ? `${a} + ${b} = ?` : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
  const answer = isAddition ? a + b : Math.max(a, b) - Math.min(a, b);

  return {
    id: `calc-2-${index}`,
    question,
    answer,
    options: generateOptions(answer, 0, 100),
    difficulty: 2,
    type: isAddition ? 'addition' : 'subtraction',
  };
}

function generateLevel3Problem(index: number): CalculationProblem {
  const type = Math.random();

  if (type < 0.5) {
    // 곱셈
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 9) + 2;
    return {
      id: `calc-3-${index}`,
      question: `${a} × ${b} = ?`,
      answer: a * b,
      options: generateOptions(a * b, 1, 100),
      difficulty: 3,
      type: 'multiplication',
    };
  } else {
    // 나눗셈
    const b = Math.floor(Math.random() * 9) + 2;
    const answer = Math.floor(Math.random() * 9) + 2;
    const a = b * answer;
    return {
      id: `calc-3-${index}`,
      question: `${a} ÷ ${b} = ?`,
      answer,
      options: generateOptions(answer, 1, 20),
      difficulty: 3,
      type: 'division',
    };
  }
}

function generateLevel4Problem(index: number): CalculationProblem {
  const a = Math.floor(Math.random() * 20) + 5;
  const b = Math.floor(Math.random() * 10) + 2;
  const c = Math.floor(Math.random() * 10) + 1;

  const operations = [
    { q: `${a} + ${b} × ${c} = ?`, a: a + b * c },
    { q: `${a} × ${b} - ${c} = ?`, a: a * b - c },
    { q: `(${a} + ${b}) × ${c} = ?`, a: (a + b) * c },
  ];

  const selected = operations[Math.floor(Math.random() * operations.length)];

  return {
    id: `calc-4-${index}`,
    question: selected.q,
    answer: selected.a,
    options: generateOptions(selected.a, 1, 200),
    difficulty: 4,
    type: 'mixed',
  };
}

function generateOptions(answer: number, min: number, max: number): number[] {
  const options = new Set<number>([answer]);

  while (options.size < 4) {
    let option = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
    option = Math.max(min, Math.min(max, option));
    if (option !== answer) {
      options.add(option);
    }
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}


// 언어력 게임 문제 데이터
export interface LanguageProblem {
  id: string;
  type: 'association' | 'completion' | 'proverb' | 'antonym' | 'synonym';
  question: string;
  hint?: string;
  answer: string;
  options: string[];
  difficulty: 1 | 2 | 3 | 4;
}

// 단어 연상 문제
export const WORD_ASSOCIATIONS: LanguageProblem[] = [
  // 레벨 1 - 쉬움
  { id: 'lang-1-1', type: 'association', question: '봄 → ?', hint: '봄에 피는 것', answer: '꽃', options: ['꽃', '눈', '낙엽', '바람'], difficulty: 1 },
  { id: 'lang-1-2', type: 'association', question: '아침 → ?', hint: '아침에 뜨는 것', answer: '해', options: ['해', '달', '별', '구름'], difficulty: 1 },
  { id: 'lang-1-3', type: 'association', question: '학교 → ?', hint: '학교에서 하는 것', answer: '공부', options: ['공부', '요리', '운동', '잠'], difficulty: 1 },
  { id: 'lang-1-4', type: 'association', question: '바다 → ?', hint: '바다에 있는 것', answer: '물고기', options: ['물고기', '사자', '참새', '강아지'], difficulty: 1 },
  { id: 'lang-1-5', type: 'association', question: '겨울 → ?', hint: '겨울에 내리는 것', answer: '눈', options: ['눈', '비', '꽃', '잎'], difficulty: 1 },

  // 레벨 2 - 보통
  { id: 'lang-2-1', type: 'association', question: '의사 → ?', hint: '의사가 일하는 곳', answer: '병원', options: ['병원', '학교', '공장', '시장'], difficulty: 2 },
  { id: 'lang-2-2', type: 'association', question: '요리사 → ?', hint: '요리사가 사용하는 것', answer: '칼', options: ['칼', '망치', '가위', '빗'], difficulty: 2 },
  { id: 'lang-2-3', type: 'association', question: '비행기 → ?', hint: '비행기가 있는 곳', answer: '하늘', options: ['하늘', '바다', '땅', '산'], difficulty: 2 },
  { id: 'lang-2-4', type: 'association', question: '농부 → ?', hint: '농부가 가꾸는 곳', answer: '밭', options: ['밭', '도시', '바다', '산'], difficulty: 2 },
  { id: 'lang-2-5', type: 'association', question: '피아노 → ?', hint: '피아노로 만드는 것', answer: '음악', options: ['음악', '그림', '요리', '책'], difficulty: 2 },
];

// 빈칸 채우기 문제
export const WORD_COMPLETIONS: LanguageProblem[] = [
  { id: 'comp-1-1', type: 'completion', question: '봄__비', answer: '가', options: ['가', '나', '다', '라'], difficulty: 1 },
  { id: 'comp-1-2', type: 'completion', question: '가__집', answer: '을', options: ['을', '에', '의', '도'], difficulty: 1 },
  { id: 'comp-1-3', type: 'completion', question: '행__', answer: '복', options: ['복', '운', '동', '진'], difficulty: 1 },
  { id: 'comp-2-1', type: 'completion', question: '대한__국', answer: '민', options: ['민', '제', '왕', '공'], difficulty: 2 },
  { id: 'comp-2-2', type: 'completion', question: '무__개', answer: '지', options: ['지', '리', '거', '너'], difficulty: 2 },
];

// 속담 완성 문제
export const PROVERBS: LanguageProblem[] = [
  { id: 'prov-1', type: 'proverb', question: '가는 말이 고와야 ___', answer: '오는 말이 곱다', options: ['오는 말이 곱다', '가는 길이 멀다', '바람이 불다', '해가 뜬다'], difficulty: 2 },
  { id: 'prov-2', type: 'proverb', question: '낮말은 새가 듣고 ___', answer: '밤말은 쥐가 듣는다', options: ['밤말은 쥐가 듣는다', '아침말은 개가 듣는다', '저녁말은 새가 듣는다', '밤말은 새가 듣는다'], difficulty: 2 },
  { id: 'prov-3', type: 'proverb', question: '호랑이도 제 말 하면 ___', answer: '온다', options: ['온다', '간다', '뛴다', '운다'], difficulty: 1 },
  { id: 'prov-4', type: 'proverb', question: '세 살 버릇 ___', answer: '여든까지 간다', options: ['여든까지 간다', '열 살까지 간다', '백 살까지 간다', '스무 살까지 간다'], difficulty: 2 },
  { id: 'prov-5', type: 'proverb', question: '콩 심은 데 콩 나고 ___', answer: '팥 심은 데 팥 난다', options: ['팥 심은 데 팥 난다', '쌀 심은 데 쌀 난다', '밀 심은 데 밀 난다', '보리 심은 데 보리 난다'], difficulty: 3 },
];

// 반의어 문제
export const ANTONYMS: LanguageProblem[] = [
  { id: 'ant-1', type: 'antonym', question: '크다의 반대말은?', answer: '작다', options: ['작다', '많다', '높다', '넓다'], difficulty: 1 },
  { id: 'ant-2', type: 'antonym', question: '밝다의 반대말은?', answer: '어둡다', options: ['어둡다', '넓다', '좁다', '깊다'], difficulty: 1 },
  { id: 'ant-3', type: 'antonym', question: '빠르다의 반대말은?', answer: '느리다', options: ['느리다', '짧다', '낮다', '작다'], difficulty: 1 },
  { id: 'ant-4', type: 'antonym', question: '무겁다의 반대말은?', answer: '가볍다', options: ['가볍다', '작다', '짧다', '얇다'], difficulty: 2 },
  { id: 'ant-5', type: 'antonym', question: '시작의 반대말은?', answer: '끝', options: ['끝', '중간', '처음', '마지막'], difficulty: 2 },
];

// 유의어 문제
export const SYNONYMS: LanguageProblem[] = [
  { id: 'syn-1', type: 'synonym', question: '예쁘다와 비슷한 말은?', answer: '아름답다', options: ['아름답다', '추하다', '크다', '작다'], difficulty: 1 },
  { id: 'syn-2', type: 'synonym', question: '기쁘다와 비슷한 말은?', answer: '즐겁다', options: ['즐겁다', '슬프다', '아프다', '무섭다'], difficulty: 1 },
  { id: 'syn-3', type: 'synonym', question: '빠르다와 비슷한 말은?', answer: '신속하다', options: ['신속하다', '천천히', '느리다', '늦다'], difficulty: 2 },
  { id: 'syn-4', type: 'synonym', question: '중요하다와 비슷한 말은?', answer: '소중하다', options: ['소중하다', '하찮다', '가볍다', '쉽다'], difficulty: 2 },
  { id: 'syn-5', type: 'synonym', question: '어렵다와 비슷한 말은?', answer: '힘들다', options: ['힘들다', '쉽다', '가볍다', '간단하다'], difficulty: 2 },
];

// 레벨별 언어 문제 가져오기
export function getLanguageProblems(level: number, count: number = 10): LanguageProblem[] {
  const allProblems: LanguageProblem[] = [
    ...WORD_ASSOCIATIONS,
    ...WORD_COMPLETIONS,
    ...PROVERBS,
    ...ANTONYMS,
    ...SYNONYMS,
  ];

  // 레벨에 맞는 문제 필터링
  const filteredProblems = allProblems.filter(p => {
    if (level === 1) return p.difficulty <= 1;
    if (level === 2) return p.difficulty <= 2;
    if (level === 3) return p.difficulty <= 3;
    return true;
  });

  // 랜덤 선택
  const shuffled = filteredProblems.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 게임 레벨 설정
export const CALCULATION_LEVELS = [
  { level: 1, name: '쉬움', description: '한 자리 덧셈/뺄셈', timeLimit: 60, problemCount: 10 },
  { level: 2, name: '보통', description: '두 자리 덧셈/뺄셈', timeLimit: 90, problemCount: 10 },
  { level: 3, name: '어려움', description: '곱셈/나눗셈 포함', timeLimit: 120, problemCount: 10 },
  { level: 4, name: '전문가', description: '복합 연산', timeLimit: 150, problemCount: 10 },
];

export const LANGUAGE_LEVELS = [
  { level: 1, name: '쉬움', description: '기초 단어 연상', timeLimit: 120, problemCount: 10 },
  { level: 2, name: '보통', description: '속담과 반의어', timeLimit: 150, problemCount: 10 },
  { level: 3, name: '어려움', description: '유의어와 고급 표현', timeLimit: 180, problemCount: 10 },
  { level: 4, name: '전문가', description: '종합 언어 능력', timeLimit: 180, problemCount: 15 },
];
