/**
 * 인지 평가 문항 데이터
 * 6개 영역 x 5문항 = 총 30문항
 */

export type CognitiveCategory =
  | 'memory'       // 기억력 (20점)
  | 'language'     // 언어력 (20점)
  | 'calculation'  // 계산력 (15점)
  | 'attention'    // 주의력 (15점)
  | 'executive'    // 실행기능 (15점)
  | 'visuospatial'; // 시공간력 (15점)

export type QuestionType =
  | 'multiple_choice'  // 객관식
  | 'text_input'       // 텍스트 입력
  | 'sequence'         // 순서 맞추기
  | 'pattern_match'    // 패턴 매칭
  | 'reaction'         // 반응 속도
  | 'recall';          // 회상

export interface AssessmentQuestion {
  id: string;
  category: CognitiveCategory;
  type: QuestionType;
  difficulty: 1 | 2 | 3; // 1: 쉬움, 2: 보통, 3: 어려움
  question: string;
  instruction?: string; // 추가 안내
  options?: string[];   // 객관식 선택지
  correctAnswer: string | string[] | number;
  timeLimit: number;    // 제한 시간 (초)
  points: number;       // 배점
  hint?: string;        // 힌트 (선택적)
  multiSelect?: boolean; // 다중 선택 가능 여부
}

// 카테고리별 설정
export const categoryConfig: Record<CognitiveCategory, {
  name: string;
  nameEn: string;
  maxPoints: number;
  description: string;
  icon: string;
}> = {
  memory: {
    name: '기억력',
    nameEn: 'Memory',
    maxPoints: 20,
    description: '단어 회상, 이미지 기억 능력을 평가합니다.',
    icon: '🧠',
  },
  language: {
    name: '언어력',
    nameEn: 'Language',
    maxPoints: 20,
    description: '문장 이해, 단어 연상 능력을 평가합니다.',
    icon: '💬',
  },
  calculation: {
    name: '계산력',
    nameEn: 'Calculation',
    maxPoints: 15,
    description: '사칙연산, 숫자 패턴 인식 능력을 평가합니다.',
    icon: '🔢',
  },
  attention: {
    name: '주의력',
    nameEn: 'Attention',
    maxPoints: 15,
    description: '집중력, 반응 속도를 평가합니다.',
    icon: '🎯',
  },
  executive: {
    name: '실행기능',
    nameEn: 'Executive Function',
    maxPoints: 15,
    description: '계획 수립, 순서 배열 능력을 평가합니다.',
    icon: '📋',
  },
  visuospatial: {
    name: '시공간력',
    nameEn: 'Visuospatial',
    maxPoints: 15,
    description: '도형 인식, 공간 지각 능력을 평가합니다.',
    icon: '🔷',
  },
};

// ============================================
// 기억력 문항 (Memory) - 20점
// ============================================
const memoryQuestions: AssessmentQuestion[] = [
  {
    id: 'memory-1',
    category: 'memory',
    type: 'recall',
    difficulty: 1,
    question: '다음 단어들을 기억하고 똑같이 따라 적어주세요: 사과, 자동차, 연필',
    instruction: '세 단어를 쉼표(,)로 구분하여 입력해주세요.\n예시: 사과, 자동차, 연필',
    correctAnswer: ['사과', '자동차', '연필'],
    timeLimit: 30,
    points: 4,
    hint: '세 단어를 쉼표로 구분하여 입력하세요. (예: 사과, 자동차, 연필)',
  },
  {
    id: 'memory-2',
    category: 'memory',
    type: 'multiple_choice',
    difficulty: 1,
    question: '방금 보여드린 단어 중 과일은 무엇이었나요?',
    options: ['연필', '사과', '자동차', '책상'],
    correctAnswer: '사과',
    timeLimit: 20,
    points: 4,
  },
  {
    id: 'memory-3',
    category: 'memory',
    type: 'recall',
    difficulty: 2,
    question: '다음 숫자를 보고 순서대로 따라 적어주세요: 7, 3, 9, 2, 5',
    instruction: '위의 다섯 숫자를 띄어쓰기 없이 순서대로 입력해주세요. 예: 73925',
    correctAnswer: '73925',
    timeLimit: 30,
    points: 4,
    hint: '숫자만 붙여서 입력하세요.',
  },
  {
    id: 'memory-4',
    category: 'memory',
    type: 'multiple_choice',
    difficulty: 2,
    question: '첫 번째 문제에서 기억했던 세 단어를 모두 고르세요. (3개 선택)',
    instruction: '정답을 모두 선택한 후 다음 버튼을 눌러주세요. 여러 개를 선택할 수 있습니다.',
    options: ['사과', '바나나', '자동차', '비행기', '연필', '지우개'],
    correctAnswer: ['사과', '자동차', '연필'],
    timeLimit: 30,
    points: 4,
    multiSelect: true, // 다중 선택 가능
  },
  {
    id: 'memory-5',
    category: 'memory',
    type: 'recall',
    difficulty: 3,
    question: '다음 문장을 기억하고 그대로 입력해주세요: "오늘 아침 공원에서 강아지가 뛰어놀았습니다."',
    instruction: '위 문장을 그대로 입력해주세요. (따옴표 제외)\n예시: 오늘 아침 공원에서 강아지가 뛰어놀았습니다',
    correctAnswer: '오늘 아침 공원에서 강아지가 뛰어놀았습니다',
    timeLimit: 40,
    points: 4,
    hint: '문장을 그대로 입력해주세요.',
  },
];

// ============================================
// 언어력 문항 (Language) - 20점
// ============================================
const languageQuestions: AssessmentQuestion[] = [
  {
    id: 'language-1',
    category: 'language',
    type: 'multiple_choice',
    difficulty: 1,
    question: '"행복"의 반대말은 무엇인가요?',
    options: ['기쁨', '슬픔', '화남', '놀람'],
    correctAnswer: '슬픔',
    timeLimit: 20,
    points: 4,
  },
  {
    id: 'language-2',
    category: 'language',
    type: 'text_input',
    difficulty: 1,
    question: '빈칸에 알맞은 단어를 넣어주세요: "나는 매일 아침 ____을 먹습니다."',
    instruction: '음식과 관련된 단어를 입력해주세요.',
    correctAnswer: ['밥', '빵', '아침', '식사', '음식'],
    timeLimit: 30,
    points: 4,
  },
  {
    id: 'language-3',
    category: 'language',
    type: 'multiple_choice',
    difficulty: 2,
    question: '다음 중 "과일"에 해당하지 않는 것은?',
    options: ['사과', '배', '당근', '포도'],
    correctAnswer: '당근',
    timeLimit: 20,
    points: 4,
  },
  {
    id: 'language-4',
    category: 'language',
    type: 'text_input',
    difficulty: 2,
    question: '"ㄱ"으로 시작하는 동물 이름을 말해주세요.',
    instruction: '생각나는 동물 이름을 입력해주세요.',
    correctAnswer: ['개', '고양이', '곰', '기린', '거북이', '고릴라', '강아지', '거위', '까마귀', '꿩'],
    timeLimit: 30,
    points: 4,
  },
  {
    id: 'language-5',
    category: 'language',
    type: 'multiple_choice',
    difficulty: 3,
    question: '"소 잃고 외양간 고친다"의 의미로 가장 적절한 것은?',
    options: [
      '미리 대비하지 않아 때늦은 후회를 한다',
      '소를 잘 돌보아야 한다',
      '외양간은 튼튼해야 한다',
      '농사일은 힘들다',
    ],
    correctAnswer: '미리 대비하지 않아 때늦은 후회를 한다',
    timeLimit: 40,
    points: 4,
  },
];

// ============================================
// 계산력 문항 (Calculation) - 15점
// ============================================
const calculationQuestions: AssessmentQuestion[] = [
  {
    id: 'calculation-1',
    category: 'calculation',
    type: 'text_input',
    difficulty: 1,
    question: '7 + 5 = ?',
    correctAnswer: '12',
    timeLimit: 15,
    points: 3,
  },
  {
    id: 'calculation-2',
    category: 'calculation',
    type: 'text_input',
    difficulty: 1,
    question: '15 - 8 = ?',
    correctAnswer: '7',
    timeLimit: 15,
    points: 3,
  },
  {
    id: 'calculation-3',
    category: 'calculation',
    type: 'text_input',
    difficulty: 2,
    question: '100에서 7을 빼면 얼마인가요? 그 결과에서 다시 7을 빼면?',
    instruction: '최종 결과만 입력해주세요.',
    correctAnswer: '86',
    timeLimit: 30,
    points: 3,
  },
  {
    id: 'calculation-4',
    category: 'calculation',
    type: 'multiple_choice',
    difficulty: 2,
    question: '사과 3개가 500원이라면, 사과 6개는 얼마인가요?',
    options: ['500원', '800원', '1000원', '1500원'],
    correctAnswer: '1000원',
    timeLimit: 30,
    points: 3,
  },
  {
    id: 'calculation-5',
    category: 'calculation',
    type: 'text_input',
    difficulty: 3,
    question: '다음 숫자 패턴의 빈칸을 채워주세요: 2, 4, 8, 16, __',
    correctAnswer: '32',
    timeLimit: 30,
    points: 3,
    hint: '앞의 숫자에 2를 곱합니다.',
  },
];

// ============================================
// 주의력 문항 (Attention) - 15점
// ============================================
const attentionQuestions: AssessmentQuestion[] = [
  {
    id: 'attention-1',
    category: 'attention',
    type: 'multiple_choice',
    difficulty: 1,
    question: '다음 중 색깔 이름이 "파란색"인 것을 고르세요.',
    instruction: '글자의 색이 아닌, 글자 자체의 의미를 보세요.',
    options: ['빨간색', '노란색', '파란색', '초록색'],
    correctAnswer: '파란색',
    timeLimit: 15,
    points: 3,
  },
  {
    id: 'attention-2',
    category: 'attention',
    type: 'multiple_choice',
    difficulty: 1,
    question: '다음 중 숫자 "7"이 몇 번 나타나나요? 3, 7, 2, 7, 9, 1, 7, 4',
    options: ['1번', '2번', '3번', '4번'],
    correctAnswer: '3번',
    timeLimit: 20,
    points: 3,
  },
  {
    id: 'attention-3',
    category: 'attention',
    type: 'sequence',
    difficulty: 2,
    question: '다음 글자들 중 "ㅎ"을 모두 찾아 개수를 세어주세요: ㄱ ㅎ ㄴ ㅎ ㄷ ㅎ ㅁ ㅂ ㅎ',
    options: ['2개', '3개', '4개', '5개'],
    correctAnswer: '4개',
    timeLimit: 25,
    points: 3,
  },
  {
    id: 'attention-4',
    category: 'attention',
    type: 'multiple_choice',
    difficulty: 2,
    question: '다음 중 올바른 행동은 무엇인가요? "빨간 불에는 멈추고, 파란 불에만 건너세요"',
    instruction: '신호등 규칙을 생각해보세요.',
    options: ['빨간 불에서 건넌다', '파란 불에서 건넌다', '아무 때나 건넌다', '노란 불에서 건넌다'],
    correctAnswer: '파란 불에서 건넌다',
    timeLimit: 20,
    points: 3,
  },
  {
    id: 'attention-5',
    category: 'attention',
    type: 'multiple_choice',
    difficulty: 3,
    question: '1부터 10까지 숫자 중 홀수만 순서대로 나열하면?',
    options: ['1, 3, 5, 7, 9', '2, 4, 6, 8, 10', '1, 2, 3, 4, 5', '5, 6, 7, 8, 9'],
    correctAnswer: '1, 3, 5, 7, 9',
    timeLimit: 25,
    points: 3,
  },
];

// ============================================
// 실행기능 문항 (Executive) - 15점
// ============================================
const executiveQuestions: AssessmentQuestion[] = [
  {
    id: 'executive-1',
    category: 'executive',
    type: 'sequence',
    difficulty: 1,
    question: '아침에 일어나서 하는 일을 순서대로 선택하세요',
    options: ['세수하기', '아침 먹기', '일어나기'],
    correctAnswer: ['일어나기', '세수하기', '아침 먹기'],
    timeLimit: 30,
    points: 3,
  },
  {
    id: 'executive-2',
    category: 'executive',
    type: 'multiple_choice',
    difficulty: 1,
    question: '다음 중 "계절"을 순서대로 나열한 것은?',
    options: [
      '봄 → 여름 → 가을 → 겨울',
      '여름 → 봄 → 겨울 → 가을',
      '가을 → 겨울 → 봄 → 여름',
    ],
    correctAnswer: '봄 → 여름 → 가을 → 겨울',
    timeLimit: 20,
    points: 3,
  },
  {
    id: 'executive-3',
    category: 'executive',
    type: 'sequence',
    difficulty: 2,
    question: '다음 숫자를 작은 것부터 순서대로 배열하세요: 8, 3, 6, 1, 9',
    instruction: '쉼표로 구분하여 입력해주세요.',
    correctAnswer: '1, 3, 6, 8, 9',
    timeLimit: 30,
    points: 3,
  },
  {
    id: 'executive-4',
    category: 'executive',
    type: 'multiple_choice',
    difficulty: 2,
    question: '마트에서 장을 볼 때 가장 먼저 해야 할 일은?',
    options: ['계산하기', '물건 담기', '장바구니 챙기기', '영수증 받기'],
    correctAnswer: '장바구니 챙기기',
    timeLimit: 20,
    points: 3,
  },
  {
    id: 'executive-5',
    category: 'executive',
    type: 'sequence',
    difficulty: 3,
    question: '요리 과정을 올바른 순서대로 선택하세요',
    options: ['재료 손질', '플레이팅', '재료 구입', '요리하기'],
    correctAnswer: ['재료 구입', '재료 손질', '요리하기', '플레이팅'],
    timeLimit: 35,
    points: 3,
  },
];

// ============================================
// 시공간력 문항 (Visuospatial) - 15점
// ============================================
const visuospatialQuestions: AssessmentQuestion[] = [
  {
    id: 'visuospatial-1',
    category: 'visuospatial',
    type: 'multiple_choice',
    difficulty: 1,
    question: '다음 도형 중 원은 몇 개인가요? ○ □ ○ △ ○ □',
    options: ['1개', '2개', '3개', '4개'],
    correctAnswer: '3개',
    timeLimit: 20,
    points: 3,
  },
  {
    id: 'visuospatial-2',
    category: 'visuospatial',
    type: 'pattern_match',
    difficulty: 1,
    question: '다음 패턴에서 빈칸에 들어갈 도형은? □ ○ □ ○ □ __',
    options: ['□', '○', '△', '◇'],
    correctAnswer: '○',
    timeLimit: 20,
    points: 3,
  },
  {
    id: 'visuospatial-3',
    category: 'visuospatial',
    type: 'multiple_choice',
    difficulty: 2,
    question: '시계가 3시를 가리킬 때, 시침과 분침이 이루는 각도는?',
    options: ['60도', '90도', '120도', '180도'],
    correctAnswer: '90도',
    timeLimit: 30,
    points: 3,
  },
  {
    id: 'visuospatial-4',
    category: 'visuospatial',
    type: 'pattern_match',
    difficulty: 2,
    question: '아래 도형을 90도 회전하면 어떤 모양이 될까요? "ㄱ"',
    options: ['ㄴ', 'ㄷ', 'ㅁ', 'ㅂ'],
    correctAnswer: 'ㄴ',
    timeLimit: 30,
    points: 3,
  },
  {
    id: 'visuospatial-5',
    category: 'visuospatial',
    type: 'multiple_choice',
    difficulty: 3,
    question: '지도에서 북쪽이 위라면, 서쪽은 어느 방향인가요?',
    options: ['위', '아래', '왼쪽', '오른쪽'],
    correctAnswer: '왼쪽',
    timeLimit: 25,
    points: 3,
  },
];

// ============================================
// 전체 문항 합치기
// ============================================
export const assessmentQuestions: AssessmentQuestion[] = [
  ...memoryQuestions,
  ...languageQuestions,
  ...calculationQuestions,
  ...attentionQuestions,
  ...executiveQuestions,
  ...visuospatialQuestions,
];

// 카테고리별 문항 가져오기
export function getQuestionsByCategory(category: CognitiveCategory): AssessmentQuestion[] {
  return assessmentQuestions.filter((q) => q.category === category);
}

// 난이도별 문항 가져오기
export function getQuestionsByDifficulty(difficulty: 1 | 2 | 3): AssessmentQuestion[] {
  return assessmentQuestions.filter((q) => q.difficulty === difficulty);
}

// 문항 순서 섞기 (같은 카테고리 내에서)
export function shuffleQuestions(questions: AssessmentQuestion[]): AssessmentQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 진단용 문항 세트 생성 (카테고리별로 정렬)
export function createAssessmentSet(): AssessmentQuestion[] {
  const categories: CognitiveCategory[] = [
    'memory',
    'language',
    'calculation',
    'attention',
    'executive',
    'visuospatial',
  ];

  return categories.flatMap((category) => {
    const categoryQuestions = getQuestionsByCategory(category);
    // 카테고리 내에서 난이도순 정렬
    return categoryQuestions.sort((a, b) => a.difficulty - b.difficulty);
  });
}

export default assessmentQuestions;
