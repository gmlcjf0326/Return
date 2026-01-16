/**
 * 회상 치료 질문 템플릿
 * TODO: [REAL_DATA] 실제 회상 치료 전문가 감수 필요
 * TODO: [AI_TAG] GPT-4 프롬프트 최적화 필요
 */

import type { PhotoCategory } from '@/components/photos/PhotoCard';

// 카테고리별 초기 질문
export const initialQuestions: Record<PhotoCategory, string[]> = {
  family: [
    '이 사진 속 분들은 누구신가요?',
    '가족분들과 함께 찍은 사진이네요. 어떤 날이었나요?',
    '사진 속 분들과의 추억을 들려주세요.',
  ],
  travel: [
    '이 장소는 어디인가요?',
    '멋진 곳에 다녀오셨네요! 어떤 여행이었나요?',
    '이 풍경을 보니 어떤 기억이 떠오르시나요?',
  ],
  event: [
    '이 행사는 어떤 날이었나요?',
    '특별한 날의 사진이네요. 어떤 기념일이었나요?',
    '이날의 특별한 순간을 기억하시나요?',
  ],
  nature: [
    '이 풍경은 어디에서 찍은 건가요?',
    '아름다운 자연 풍경이네요. 언제 가셨나요?',
    '이 장소에서 어떤 활동을 하셨나요?',
  ],
  daily: [
    '이 사진은 언제 찍은 건가요?',
    '일상의 한 장면이네요. 이때 무엇을 하고 계셨나요?',
    '이 순간이 기억나시나요?',
  ],
  friends: [
    '사진 속 분들은 누구신가요?',
    '친구분들과 함께 찍은 사진이네요. 어떤 모임이었나요?',
    '이 친구분들과의 추억을 들려주세요.',
  ],
};

// 카테고리별 후속 질문 (대화 진행용)
export const followUpQuestions: Record<PhotoCategory, string[]> = {
  family: [
    '가족분들과 함께하면 가장 행복했던 기억은 무엇인가요?',
    '이때 가장 기억에 남는 순간이 있으신가요?',
    '가족들과 자주 하셨던 활동이 있으신가요?',
    '명절이나 특별한 날에 가족들과 무엇을 하셨나요?',
    '가족 중에서 특히 가까웠던 분이 계셨나요?',
  ],
  travel: [
    '이 여행에서 가장 인상 깊었던 것은 무엇인가요?',
    '다시 가고 싶은 곳이 있으신가요?',
    '여행 중에 맛있게 드셨던 음식이 있으신가요?',
    '이 여행에서 특별한 에피소드가 있으셨나요?',
    '누구와 함께 여행을 가셨나요?',
  ],
  event: [
    '이날의 특별한 순간이 있었나요?',
    '함께한 분들은 누구셨나요?',
    '이 행사를 준비하면서 기억나는 일이 있으신가요?',
    '이날 어떤 음식을 드셨나요?',
    '이 행사 후에 어떤 일들이 있었나요?',
  ],
  nature: [
    '이 풍경을 보면 어떤 감정이 드시나요?',
    '자연 속에서 즐겨 하셨던 활동이 있으신가요?',
    '계절마다 특별히 좋아하셨던 풍경이 있으신가요?',
    '이 장소에 다시 가보고 싶으신가요?',
    '어린 시절 자연에서 놀았던 기억이 있으신가요?',
  ],
  daily: [
    '평소에 즐겨 하셨던 일과가 있으신가요?',
    '이 시기에 특별히 좋아하셨던 것이 있으신가요?',
    '하루 중 가장 좋아하셨던 시간은 언제였나요?',
    '취미 활동으로 무엇을 하셨나요?',
    '이때 살던 동네는 어땠나요?',
  ],
  friends: [
    '이 친구분들과는 어떻게 알게 되셨나요?',
    '친구분들과 자주 하셨던 활동이 있으신가요?',
    '가장 기억에 남는 친구와의 추억은 무엇인가요?',
    '학창시절 친구들과의 추억도 있으신가요?',
    '지금도 연락하는 친구분이 계신가요?',
  ],
};

// 대화 마무리 질문
export const closingQuestions: string[] = [
  '오늘 이야기 나누면서 어떤 기분이 드셨나요?',
  '더 이야기하고 싶은 추억이 있으신가요?',
  '이 사진이 특별한 이유가 있으신가요?',
  '오늘 대화가 즐거우셨나요?',
];

// 힌트 질문 (대화가 막힐 때 사용)
export const hintQuestions: Record<PhotoCategory, string[]> = {
  family: [
    '그때 먹었던 음식 중 기억나는 것은?',
    '가족들의 성격은 어떠셨나요?',
    '집안의 전통이나 관습이 있었나요?',
  ],
  travel: [
    '여행지의 날씨는 어땠나요?',
    '기념품으로 뭘 사오셨나요?',
    '여행 중 불편했던 점은 없었나요?',
  ],
  event: [
    '어떤 선물을 주고받으셨나요?',
    '행사 때 입었던 옷이 기억나시나요?',
    '준비하느라 힘드셨던 점은요?',
  ],
  nature: [
    '그날 날씨는 어땠나요?',
    '어떤 소리가 들렸나요?',
    '어떤 냄새가 났나요?',
  ],
  daily: [
    '그때 유행했던 것이 있나요?',
    '좋아하셨던 TV 프로그램이 있으셨나요?',
    '그때 즐겨 드시던 음식은요?',
  ],
  friends: [
    '친구의 별명이 있었나요?',
    '함께 갔던 장소가 기억나시나요?',
    '친구와 나눈 비밀이 있으셨나요?',
  ],
};

// 랜덤 초기 질문 가져오기
export function getRandomInitialQuestion(category: PhotoCategory): string {
  const questions = initialQuestions[category] || initialQuestions.daily;
  return questions[Math.floor(Math.random() * questions.length)];
}

// 랜덤 후속 질문 가져오기
export function getRandomFollowUpQuestion(category: PhotoCategory): string {
  const questions = followUpQuestions[category] || followUpQuestions.daily;
  return questions[Math.floor(Math.random() * questions.length)];
}

// 랜덤 힌트 질문 가져오기
export function getRandomHintQuestion(category: PhotoCategory): string {
  const hints = hintQuestions[category] || hintQuestions.daily;
  return hints[Math.floor(Math.random() * hints.length)];
}

export default {
  initialQuestions,
  followUpQuestions,
  closingQuestions,
  hintQuestions,
};
