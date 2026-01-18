/**
 * LLM 더미 응답 데이터
 * TODO: [API_KEY] 실제 LLM API 연동 시 이 파일 사용하지 않음
 * TODO: [LLM_API] OpenAI GPT-4o 또는 Claude API로 교체
 */

import type { PhotoCategory } from '@/components/photos/PhotoCard';

// 카테고리별 공감 응답 패턴
export const empathyResponses: Record<PhotoCategory, string[]> = {
  family: [
    '가족분들과 함께한 소중한 순간이네요.',
    '정말 따뜻한 가족 모임이었겠네요.',
    '가족과 함께하는 시간은 정말 특별하죠.',
    '사랑이 넘치는 가족 사진이에요.',
  ],
  travel: [
    '정말 아름다운 여행지네요!',
    '멋진 추억을 만드셨네요.',
    '여행의 즐거움이 느껴지는 사진이에요.',
    '정말 인상적인 풍경이에요.',
  ],
  event: [
    '정말 특별한 날이었겠네요!',
    '축하할 일이 있으셨군요.',
    '기념할 만한 순간이네요.',
    '행복한 행사였겠어요.',
  ],
  nature: [
    '정말 아름다운 자연 풍경이에요.',
    '평화로운 느낌이 전해지네요.',
    '자연 속에서의 시간은 정말 좋죠.',
    '힐링되는 풍경이에요.',
  ],
  daily: [
    '일상의 소중한 순간이네요.',
    '평범한 하루도 특별해지는 순간이 있죠.',
    '이런 일상의 기록이 나중에 큰 추억이 되죠.',
    '따뜻한 일상이 느껴져요.',
  ],
  friends: [
    '소중한 친구분들과 함께하셨네요.',
    '오랜 우정이 느껴지는 사진이에요.',
    '좋은 친구가 있다는 건 정말 축복이죠.',
    '즐거운 시간을 보내셨겠어요.',
  ],
};

// 후속 질문 생성 패턴
export const followUpPatterns: string[] = [
  '{detail}에 대해 더 자세히 이야기해 주실 수 있을까요?',
  '그때 {topic}은/는 어땠나요?',
  '{person}분과의 특별한 에피소드가 있으신가요?',
  '이 사진을 보면 어떤 감정이 드시나요?',
  '이날의 가장 기억에 남는 순간은 무엇인가요?',
];

// 기억이 안 난다는 표현 감지
function detectMemoryDifficulty(message: string): boolean {
  const patterns = [
    '모르', '기억 안', '기억이 안', '기억안', '기억나지 않',
    '생각 안', '생각이 안', '생각안', '없는데', '없어요', '없어',
    '글쎄', '잘 모르', '잘모르', '어떻게', '뭐였', '뭐지',
    '까먹', '잊어', '기억 못', '생각 못', '모르겠'
  ];
  const lowerMessage = message.toLowerCase();
  return patterns.some(p => lowerMessage.includes(p));
}

// 긍정적인 응답 감지
function detectPositiveResponse(message: string): boolean {
  const patterns = [
    '좋았', '즐거', '재밌', '재미있', '행복', '기뻤', '웃',
    '신났', '최고', '멋있', '예뻤', '아름다', '감동'
  ];
  const lowerMessage = message.toLowerCase();
  return patterns.some(p => lowerMessage.includes(p));
}

// 부정적/슬픈 응답 감지
function detectNegativeResponse(message: string): boolean {
  const patterns = [
    '슬펐', '슬프', '힘들', '어려웠', '그리워', '보고싶', '아쉬',
    '걱정', '무서웠', '두려웠', '외로'
  ];
  const lowerMessage = message.toLowerCase();
  return patterns.some(p => lowerMessage.includes(p));
}

// 힌트 질문 (기억을 돕는 질문)
const hintQuestions: Record<PhotoCategory, string[]> = {
  family: [
    '혹시 그때 어떤 음식을 드셨는지 기억나세요?',
    '그날 날씨가 어땠는지 생각나시나요?',
    '가족분들 중 가장 먼저 떠오르는 분이 계신가요?',
    '그때 무슨 옷을 입고 계셨을까요?',
  ],
  travel: [
    '그곳의 날씨나 온도가 기억나시나요?',
    '혹시 그곳에서 특별한 냄새가 났을까요?',
    '이동할 때 차로 가셨나요, 기차로 가셨나요?',
    '그곳에서 드신 음식 중 기억나는 게 있으신가요?',
  ],
  event: [
    '그날 어떤 음식이 나왔는지 기억나세요?',
    '혹시 그날 받거나 드린 선물이 있으셨나요?',
    '그 자리에 몇 분 정도 계셨나요?',
    '그날 입으셨던 옷이 기억나시나요?',
  ],
  nature: [
    '그곳의 소리가 기억나시나요? 새소리나 물소리 같은...',
    '그때 어떤 계절이었나요?',
    '혹시 그곳에서 맡았던 특별한 향기가 있었나요?',
    '그 풍경을 처음 보셨을 때 어떤 느낌이셨어요?',
  ],
  daily: [
    '그때 주로 몇 시에 일어나셨나요?',
    '평소 즐겨 드시던 음식이 있으셨나요?',
    '그 시절 좋아하시던 노래나 라디오 프로그램이 있으셨나요?',
    '그때 집 근처에 자주 가시던 곳이 있었나요?',
  ],
  friends: [
    '그 친구분 성함이 기억나시나요?',
    '함께 자주 갔던 장소가 있으신가요?',
    '그 친구분과 처음 만났을 때가 기억나시나요?',
    '함께 즐겨하시던 활동이 있었나요?',
  ],
};

// 긍정적 응답에 대한 공감 + 심화 질문
const positiveFollowUps: Record<PhotoCategory, string[]> = {
  family: [
    '정말 행복한 시간이었겠네요! 그때 가족분들과 어떤 이야기를 나누셨어요?',
    '좋은 추억이시네요! 특별히 기억에 남는 순간이 있으신가요?',
    '따뜻한 시간이었겠어요. 그다음에는 뭘 하셨나요?',
  ],
  travel: [
    '정말 즐거우셨겠네요! 그곳에서 가장 인상 깊었던 건 뭐였어요?',
    '멋진 추억이시네요! 함께 간 분들은 어떻게 생각하셨을까요?',
    '좋은 여행이었겠어요! 다시 가고 싶으신 마음이 드시나요?',
  ],
  event: [
    '정말 기쁜 날이었겠네요! 그날 가장 기억에 남는 장면은 뭐예요?',
    '행복한 순간이셨겠어요! 준비하시면서 특별한 에피소드가 있었나요?',
    '좋은 추억이시네요! 그 후로 어떤 일들이 있었나요?',
  ],
  nature: [
    '아름다운 경험이셨겠네요! 그 풍경을 보며 무슨 생각을 하셨어요?',
    '평화로운 시간이셨겠어요! 자주 그곳에 가셨나요?',
    '좋은 기억이시네요! 비슷한 풍경을 다른 곳에서도 보신 적 있으세요?',
  ],
  daily: [
    '소중한 일상이셨네요! 그때 하루가 어떻게 흘러갔나요?',
    '따뜻한 시간이셨겠어요! 그 시절 가장 좋아하셨던 일과가 있으신가요?',
    '좋은 추억이시네요! 그때와 지금 달라진 점이 있으신가요?',
  ],
  friends: [
    '즐거운 시간이셨겠네요! 그 친구분과 특별한 에피소드가 있으신가요?',
    '좋은 우정이시네요! 얼마나 자주 만나셨어요?',
    '행복한 추억이시네요! 그 친구분과 가장 기억에 남는 순간은요?',
  ],
};

// 부정적 응답에 대한 공감
const negativeFollowUps: string[] = [
  '그러셨군요... 지금 그때 생각이 많이 나시나봐요. 괜찮으세요?',
  '마음이 좀 아프셨겠네요. 그래도 소중한 기억이에요.',
  '그런 마음이 드시는 거 자연스러운 거예요. 천천히 이야기해 주셔도 돼요.',
  '그리운 마음이 드시는군요. 그분과 좋았던 기억도 있으실까요?',
];

// 더미 응답 생성 함수
export function generateDummyResponse(
  category: PhotoCategory,
  userMessage: string,
  conversationLength: number
): string {
  // 대화 길이에 따른 응답 조절
  if (conversationLength >= 6) {
    return '오늘 정말 좋은 이야기를 나눠주셔서 감사해요. 이 추억들이 참 소중하게 느껴지네요. 혹시 더 이야기하고 싶은 부분이 있으신가요?';
  }

  // 1. 기억이 안 난다고 하면 → 힌트 질문
  if (detectMemoryDifficulty(userMessage)) {
    const hints = hintQuestions[category] || hintQuestions.daily;
    const hint = hints[Math.floor(Math.random() * hints.length)];
    return `괜찮아요, 천천히 생각해 보셔도 돼요. ${hint}`;
  }

  // 2. 긍정적 응답이면 → 공감 + 심화 질문
  if (detectPositiveResponse(userMessage)) {
    const followUps = positiveFollowUps[category] || positiveFollowUps.daily;
    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  // 3. 부정적/슬픈 응답이면 → 따뜻한 공감
  if (detectNegativeResponse(userMessage)) {
    return negativeFollowUps[Math.floor(Math.random() * negativeFollowUps.length)];
  }

  // 4. 일반 응답 → 기본 공감 + 후속 질문
  const empathyList = empathyResponses[category] || empathyResponses.daily;
  const empathy = empathyList[Math.floor(Math.random() * empathyList.length)];
  const keywords = extractKeywords(userMessage);
  const followUp = generateFollowUp(category, keywords);

  return `${empathy} ${followUp}`;
}

// 키워드 추출 (간단한 버전)
function extractKeywords(message: string): string[] {
  // TODO: [LLM_API] 실제 LLM으로 키워드 추출 개선
  const keywords: string[] = [];

  // 가족 관련 키워드
  if (message.includes('가족') || message.includes('엄마') || message.includes('아빠') ||
      message.includes('할머니') || message.includes('할아버지') || message.includes('손자') ||
      message.includes('손녀') || message.includes('아들') || message.includes('딸')) {
    keywords.push('가족');
  }

  // 장소 관련 키워드
  if (message.includes('집') || message.includes('고향') || message.includes('학교') ||
      message.includes('회사') || message.includes('바다') || message.includes('산')) {
    keywords.push('장소');
  }

  // 음식 관련 키워드
  if (message.includes('먹') || message.includes('음식') || message.includes('밥') ||
      message.includes('요리') || message.includes('케이크')) {
    keywords.push('음식');
  }

  // 감정 관련 키워드
  if (message.includes('행복') || message.includes('즐거') || message.includes('슬프') ||
      message.includes('그립') || message.includes('좋') || message.includes('기억')) {
    keywords.push('감정');
  }

  return keywords;
}

// 후속 질문 생성
function generateFollowUp(category: PhotoCategory, keywords: string[]): string {
  const questions: Record<PhotoCategory, string[]> = {
    family: [
      '그때 가족분들과 어떤 이야기를 나누셨나요?',
      '가장 기억에 남는 가족과의 순간은 무엇인가요?',
      '가족분들의 성격은 어떠셨나요?',
    ],
    travel: [
      '이 여행에서 가장 맛있게 드신 음식은 무엇인가요?',
      '여행 중 특별한 에피소드가 있으셨나요?',
      '이 장소를 선택하신 이유가 있으신가요?',
    ],
    event: [
      '이날 준비하면서 기억나는 일이 있으신가요?',
      '어떤 선물을 주고받으셨나요?',
      '이 행사 후에 어떤 일들이 있었나요?',
    ],
    nature: [
      '이 풍경을 보면 어떤 생각이 드시나요?',
      '자연 속에서 즐겨 하시던 활동이 있으신가요?',
      '비슷한 풍경의 다른 장소에 가보신 적 있으신가요?',
    ],
    daily: [
      '평소 하루 일과는 어떠셨나요?',
      '이 시기에 특별히 좋아하셨던 것이 있으신가요?',
      '그때와 지금 달라진 점이 있으신가요?',
    ],
    friends: [
      '이 친구분들과는 어떻게 알게 되셨나요?',
      '친구분들과 자주 하셨던 활동이 있으신가요?',
      '가장 기억에 남는 친구와의 추억은 무엇인가요?',
    ],
  };

  const categoryQuestions = questions[category] || questions.daily;
  return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
}

// 대화 요약 생성 (그림일기용)
export function generateDiarySummary(
  messages: Array<{ role: string; content: string }>
): string {
  // TODO: [LLM_API] 실제 LLM으로 대화 요약 개선
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  // 간단한 요약 생성
  if (userMessages.length > 100) {
    return userMessages.substring(0, 100) + '...';
  }

  return userMessages || '오늘의 회상 대화';
}

export default {
  empathyResponses,
  followUpPatterns,
  generateDummyResponse,
  generateDiarySummary,
};
