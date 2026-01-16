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

// 더미 응답 생성 함수
export function generateDummyResponse(
  category: PhotoCategory,
  userMessage: string,
  conversationLength: number
): string {
  // 공감 응답 선택
  const empathyList = empathyResponses[category] || empathyResponses.daily;
  const empathy = empathyList[Math.floor(Math.random() * empathyList.length)];

  // 사용자 메시지에서 키워드 추출 (간단한 버전)
  const keywords = extractKeywords(userMessage);

  // 대화 길이에 따른 응답 조절
  if (conversationLength >= 6) {
    // 대화가 충분히 진행됨 - 마무리 유도
    return `${empathy} 오늘 이렇게 좋은 이야기를 나눠주셔서 감사해요. 이 추억이 정말 소중하게 느껴지네요. 혹시 더 이야기하고 싶은 부분이 있으신가요?`;
  }

  // 후속 질문 생성
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
