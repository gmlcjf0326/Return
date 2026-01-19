/**
 * LLM 더미 응답 데이터
 * TODO: [API_KEY] 실제 LLM API 연동 시 이 파일 사용하지 않음
 * TODO: [LLM_API] OpenAI GPT-4o 또는 Claude API로 교체
 */

import type { PhotoCategory, PhotoData } from '@/components/photos/PhotoCard';

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
    '신났', '최고', '멋있', '예뻤', '아름다', '감동',
    '기억나', '생각나', '그랬', '맞아',  // 추가 패턴
  ];
  const lowerMessage = message.toLowerCase();
  return patterns.some(p => lowerMessage.includes(p));
}

// 짧은 긍정 응답 감지 (NEW-3)
// "네", "응", "맞아요" 등 짧은 긍정 응답을 감지
function detectShortPositiveResponse(message: string): boolean {
  const trimmed = message.trim();

  // 10글자 이하의 짧은 응답만 체크
  if (trimmed.length > 10) return false;

  // 짧은 긍정 응답 패턴
  const shortPositivePatterns = /^(네|응|예|어|맞아요?|그래요?|그랬어요?|기억나요?|생각나요?|그래|맞아|응응|네네|그렇죠)$/;
  return shortPositivePatterns.test(trimmed);
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

// 짧은 긍정 응답("네", "응", "맞아요")에 대한 맥락 기반 후속 질문 (NEW-4)
const shortPositiveFollowUps: string[] = [
  '그렇군요! 그때 어떤 기분이셨어요?',
  '아, 그러셨군요. 좀 더 이야기해 주실 수 있으세요?',
  '네, 그때 누구와 함께 계셨나요?',
  '그렇군요. 그 다음에는 어떻게 되었나요?',
  '기억해 주셔서 감사해요. 더 자세히 말씀해 주시겠어요?',
  '그러셨군요! 그때의 모습이 눈에 선하네요. 좀 더 들려주세요.',
  '아, 정말요? 그때 기분이 어떠셨어요?',
  '네, 맞아요. 그때 특별히 기억나는 장면이 있으신가요?',
];

// 사용된 질문을 추적하기 위한 전역 Map (세션별 관리)
const usedQuestionsMap = new Map<string, Set<string>>();

// 세션별 사용된 질문 Set 가져오기
function getUsedQuestions(sessionId: string): Set<string> {
  if (!usedQuestionsMap.has(sessionId)) {
    usedQuestionsMap.set(sessionId, new Set());
  }
  return usedQuestionsMap.get(sessionId)!;
}

// 세션별 사용된 질문 초기화
export function clearUsedQuestions(sessionId: string): void {
  usedQuestionsMap.delete(sessionId);
}

// 중복되지 않는 질문 선택
function selectUniqueQuestion(
  questions: string[],
  usedQuestions: Set<string>,
  fallbackPrefix: string = ''
): string {
  // 사용되지 않은 질문 필터링
  const availableQuestions = questions.filter(q => !usedQuestions.has(q));

  if (availableQuestions.length > 0) {
    // 사용되지 않은 질문 중 랜덤 선택
    const selected = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    usedQuestions.add(selected);
    return selected;
  }

  // 모든 질문이 사용됨 - 대화 마무리 유도
  return '지금까지 정말 좋은 이야기를 나눠주셨어요. 혹시 더 떠오르는 기억이 있으신가요?';
}

// 사용자 메시지에서 핵심 내용 추출하여 맥락 있는 응답 생성
function generateContextualResponse(userMessage: string, category: PhotoCategory): string {
  // 음식 관련 언급
  if (/짜장|짬뽕|밥|음식|먹|식사|요리|반찬|김치/.test(userMessage)) {
    return '맛있는 음식 이야기네요! 그 음식을 먹을 때 누구와 함께 계셨나요?';
  }

  // 장소 관련 언급
  if (/여행|바다|산|공원|학교|회사|집|고향|시장|백화점/.test(userMessage)) {
    return '좋은 장소에 다녀오셨네요! 그곳에서 가장 기억에 남는 순간이 있으신가요?';
  }

  // 사람 관련 언급
  if (/엄마|아빠|할머니|할아버지|친구|형|누나|동생|아들|딸/.test(userMessage)) {
    return '소중한 분과의 추억이시네요. 그분과 함께한 특별한 에피소드가 있으신가요?';
  }

  // 활동 관련 언급
  if (/일|직장|면접|출근|퇴근|회의|공부/.test(userMessage)) {
    return '그때의 일상이 떠오르시네요. 그 시절 가장 보람있었던 일은 무엇이었나요?';
  }

  // 감정 관련 언급
  if (/기억|추억|그립|보고싶|생각나/.test(userMessage)) {
    return '소중한 추억이시네요. 그때 어떤 기분이셨는지 더 이야기해 주시겠어요?';
  }

  return '';
}

// 사진 태그 기반 맥락 응답 생성 (NEW: 태그 정보 활용)
function generatePhotoContextResponse(photoContext?: PhotoData, usedQuestions?: Set<string>): string | null {
  if (!photoContext?.autoTags) return null;

  const { scene, mood, peopleCount, objects, locationType, estimatedEra } = photoContext.autoTags;
  const questions: string[] = [];

  // 장면 기반 질문
  if (scene) {
    const sceneQuestions: Record<string, string[]> = {
      '가족모임': ['가족분들이 모두 모이셨네요! 어떤 날이었나요?', '가족분들과 어떤 이야기를 나누셨나요?'],
      '여행': ['여행지가 참 좋아보여요! 어디로 가셨나요?', '이곳에서 가장 좋았던 점이 있으신가요?'],
      '일상': ['평화로운 일상이 느껴져요. 이 날 특별한 일이 있으셨나요?'],
      '명절': ['명절 분위기가 나네요! 어떤 명절이었나요?', '명절에 드신 음식 중 기억나는 게 있으신가요?'],
      '졸업식': ['졸업식이셨군요! 누구의 졸업이었나요?', '졸업식 날 기분이 어떠셨나요?'],
      '결혼식': ['결혼식이네요! 정말 특별한 날이었겠어요.', '신랑신부는 누구셨나요?'],
      '야외활동': ['야외에서 즐거운 시간을 보내셨네요! 무엇을 하고 계셨나요?'],
    };
    Object.entries(sceneQuestions).forEach(([key, qs]) => {
      if (scene.includes(key)) questions.push(...qs);
    });
  }

  // 분위기 기반 질문
  if (mood) {
    if (mood.includes('행복') || mood.includes('즐거')) {
      questions.push('정말 행복해 보이세요! 그때 기분이 어떠셨나요?');
    }
    if (mood.includes('평화') || mood.includes('차분')) {
      questions.push('평화로운 분위기네요. 이런 시간을 자주 가지셨나요?');
    }
    if (mood.includes('축제') || mood.includes('신나')) {
      questions.push('신나는 분위기네요! 무슨 일이 있었나요?');
    }
  }

  // 인원 기반 질문
  if (peopleCount && peopleCount > 1) {
    questions.push(`${peopleCount}분이 함께 계시네요! 어떤 분들이셨나요?`);
  }

  // 장소 유형 기반 질문
  if (locationType) {
    const locationQuestions: Record<string, string> = {
      '해변': '바다가 보여요! 바닷가에서 뭘 하셨나요?',
      '산': '산에 가셨군요! 등산을 좋아하셨나요?',
      '도시': '도시에서 찍은 사진이네요! 어느 도시였나요?',
      '시골': '시골 풍경이 정겨워요! 어디셨나요?',
      '학교': '학교에서 찍은 사진이네요! 어떤 학교였나요?',
      '직장': '직장에서 찍은 사진인가요? 어떤 일을 하셨나요?',
    };
    Object.entries(locationQuestions).forEach(([key, q]) => {
      if (locationType.includes(key)) questions.push(q);
    });
  }

  // 시대 기반 질문 - 중복 방지: 이미 사용되었으면 추가하지 않음
  if (estimatedEra) {
    const eraQuestion = `${estimatedEra}쯤 찍은 사진 같아요! 그때 어떤 일을 하고 계셨나요?`;
    // usedQuestions가 있고 아직 사용되지 않은 경우에만 추가
    if (!usedQuestions || !usedQuestions.has(eraQuestion)) {
      questions.push(eraQuestion);
    }
  }

  // 물체 기반 질문
  if (objects && objects.length > 0) {
    const objectQuestions: Record<string, string> = {
      '케이크': '케이크가 보이네요! 생일이셨나요, 아니면 다른 특별한 날이었나요?',
      '음식': '맛있는 음식이 있네요! 어떤 음식이었는지 기억나세요?',
      '꽃': '예쁜 꽃이 있네요! 특별한 날이었나요?',
      '자동차': '자동차가 보이네요! 드라이브 다녀오셨나요?',
      '강아지': '귀여운 강아지가 있네요! 같이 사시던 반려견인가요?',
      '고양이': '고양이가 있네요! 같이 사시던 반려묘인가요?',
    };
    objects.forEach(obj => {
      const q = objectQuestions[obj];
      if (q) questions.push(q);
    });
  }

  // userTags도 활용 (사용자가 직접 추가한 태그)
  if (photoContext.userTags && photoContext.userTags.length > 0) {
    const userTagQuestions: Record<string, string> = {
      '여름': '여름에 찍은 사진 같아요! 그때 날씨가 어땠나요?',
      '겨울': '겨울 사진이네요! 추웠나요?',
      '봄': '봄 풍경이 느껴져요! 꽃구경을 가셨나요?',
      '가을': '가을 분위기가 나네요! 단풍이 예뻤나요?',
      '생일': '생일이셨군요! 누구 생일이었나요?',
      '결혼': '결혼 관련 사진이네요! 특별한 날이었겠어요.',
    };
    photoContext.userTags.forEach(tag => {
      const q = userTagQuestions[tag];
      if (q) questions.push(q);
    });
  }

  if (questions.length === 0) return null;

  // 사용되지 않은 질문 선택
  if (usedQuestions) {
    const available = questions.filter(q => !usedQuestions.has(q));
    if (available.length > 0) {
      const selected = available[Math.floor(Math.random() * available.length)];
      usedQuestions.add(selected);
      return selected;
    }
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

// 더미 응답 생성 함수
export function generateDummyResponse(
  category: PhotoCategory,
  userMessage: string,
  conversationLength: number,
  conversationHistory?: Array<{ role: string; content: string }>,
  sessionId?: string,
  photoContext?: PhotoData  // NEW: 사진 컨텍스트 추가
): string {
  // 세션 ID가 없으면 임시 생성
  const sid = sessionId || 'default-session';
  const usedQuestions = getUsedQuestions(sid);

  // 대화 길이에 따른 응답 조절
  if (conversationLength >= 6) {
    return '오늘 정말 좋은 이야기를 나눠주셔서 감사해요. 이 추억들이 참 소중하게 느껴지네요. 혹시 더 이야기하고 싶은 부분이 있으신가요?';
  }

  // 1. 기억이 안 난다고 하면 → 힌트 질문 (중복 방지)
  if (detectMemoryDifficulty(userMessage)) {
    const hints = hintQuestions[category] || hintQuestions.daily;
    const hint = selectUniqueQuestion(hints, usedQuestions);
    return `괜찮아요, 천천히 생각해 보셔도 돼요. ${hint}`;
  }

  // 1.5. 짧은 긍정 응답("네", "응", "맞아요")이면 → 맥락 기반 후속 질문 (NEW-4)
  // 이전 대화 맥락을 참조하여 무관한 질문(TV 프로그램 등) 대신 후속 질문 제공
  if (detectShortPositiveResponse(userMessage)) {
    return selectUniqueQuestion(shortPositiveFollowUps, usedQuestions);
  }

  // 2. 긍정적 응답이면 → 공감 + 심화 질문 (중복 방지)
  if (detectPositiveResponse(userMessage)) {
    const followUps = positiveFollowUps[category] || positiveFollowUps.daily;
    return selectUniqueQuestion(followUps, usedQuestions);
  }

  // 3. 부정적/슬픈 응답이면 → 따뜻한 공감 (중복 방지)
  if (detectNegativeResponse(userMessage)) {
    return selectUniqueQuestion(negativeFollowUps, usedQuestions);
  }

  // 4. 사용자 메시지 맥락을 참조한 응답 시도
  const contextualResponse = generateContextualResponse(userMessage, category);
  if (contextualResponse && !usedQuestions.has(contextualResponse)) {
    usedQuestions.add(contextualResponse);
    return contextualResponse;
  }

  // 4.5. 사진 태그 기반 맥락 응답 (NEW: autoTags 활용)
  // 사진의 장면, 분위기, 물체, 태그 등을 활용한 질문 생성
  if (photoContext?.autoTags) {
    const photoContextResponse = generatePhotoContextResponse(photoContext, usedQuestions);
    if (photoContextResponse) {
      return photoContextResponse;
    }
  }

  // 5. 일반 응답 → 기본 공감 + 후속 질문 (중복 방지)
  const empathyList = empathyResponses[category] || empathyResponses.daily;
  const empathy = empathyList[Math.floor(Math.random() * empathyList.length)];
  const followUp = generateFollowUpUnique(category, usedQuestions);

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

// 후속 질문 생성 (중복 방지 버전)
function generateFollowUpUnique(category: PhotoCategory, usedQuestions: Set<string>): string {
  const questions: Record<PhotoCategory, string[]> = {
    family: [
      '그때 가족분들과 어떤 이야기를 나누셨나요?',
      '가장 기억에 남는 가족과의 순간은 무엇인가요?',
      '가족분들의 성격은 어떠셨나요?',
      '가족들과 함께 자주 가던 곳이 있으셨나요?',
      '명절에는 보통 어떻게 보내셨나요?',
    ],
    travel: [
      '이 여행에서 가장 맛있게 드신 음식은 무엇인가요?',
      '여행 중 특별한 에피소드가 있으셨나요?',
      '이 장소를 선택하신 이유가 있으신가요?',
      '여행지에서 만난 사람들 중 기억나는 분이 있으신가요?',
      '다시 가고 싶은 곳이 있으신가요?',
    ],
    event: [
      '이날 준비하면서 기억나는 일이 있으신가요?',
      '어떤 선물을 주고받으셨나요?',
      '이 행사 후에 어떤 일들이 있었나요?',
      '행사 준비하면서 도와주신 분이 있었나요?',
      '그날 입으셨던 옷이 기억나시나요?',
    ],
    nature: [
      '이 풍경을 보면 어떤 생각이 드시나요?',
      '자연 속에서 즐겨 하시던 활동이 있으신가요?',
      '비슷한 풍경의 다른 장소에 가보신 적 있으신가요?',
      '어린 시절 자연에서 놀았던 기억이 있으신가요?',
      '계절마다 좋아하시는 풍경이 있으신가요?',
    ],
    daily: [
      '평소 하루 일과는 어떠셨나요?',
      '이 시기에 특별히 좋아하셨던 것이 있으신가요?',
      '그때와 지금 달라진 점이 있으신가요?',
      '그 시절 자주 듣던 노래가 있으신가요?',
      '그때 즐겨 보시던 TV 프로그램이 있으셨나요?',
    ],
    friends: [
      '이 친구분들과는 어떻게 알게 되셨나요?',
      '친구분들과 자주 하셨던 활동이 있으신가요?',
      '가장 기억에 남는 친구와의 추억은 무엇인가요?',
      '친구분과 처음 만났을 때가 기억나시나요?',
      '지금도 연락하시는 친구분이 계신가요?',
    ],
  };

  const categoryQuestions = questions[category] || questions.daily;
  return selectUniqueQuestion(categoryQuestions, usedQuestions);
}

// 후속 질문 생성 (기존 버전 - 호환성용)
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

// 사용자 메시지를 1인칭 서술형으로 변환
function convertToFirstPersonNarrative(message: string): string | null {
  // 빈 메시지 처리
  if (!message || message.trim().length === 0) return null;

  const trimmed = message.trim();

  // 너무 짧은 메시지 (3글자 이하) 무시
  if (trimmed.length <= 3) return null;

  // 필터링할 메시지 패턴
  const filterPatterns = [
    /\?$/,                                    // 질문 (물음표 끝)
    /^(사진|이|저|그|뭐).*(설명|말해|알려)/,  // AI에게 하는 요청
    /^(네|응|예|어|맞아|그래)$/,              // 짧은 긍정 응답
    /모르|기억.*안|글쎄|잘.*모르|모르겠/,     // 기억 안남
    /쯤.*사진|사진.*같아|픽셀|스타일/,        // AI 응답 반복/기술적 표현
    /^(음|아|어|글쎄요?)$/,                   // 간투사
    /^.{0,3}$/,                               // 너무 짧은 메시지
  ];

  for (const pattern of filterPatterns) {
    if (pattern.test(trimmed)) return null;
  }

  let narrative = trimmed;

  // 활동/행동 패턴 감지 및 변환
  const patterns: Array<{ regex: RegExp; replace: string }> = [
    // 음식 관련
    { regex: /짜장면?(?:을|를)?(?:\s*먹|드)?/, replace: '짜장면을 먹었다' },
    { regex: /짬뽕(?:을|를)?(?:\s*먹|드)?/, replace: '짬뽕을 먹었다' },
    { regex: /밥(?:을|를)?(?:\s*먹|드)?/, replace: '밥을 먹었다' },
    { regex: /식사(?:를)?(?:\s*하)?/, replace: '식사를 했다' },

    // 장소 관련
    { regex: /여행(?:을|를)?(?:\s*갔|다녀)?/, replace: '여행을 다녀왔다' },
    { regex: /바다(?:에)?(?:\s*갔)?/, replace: '바다에 갔다' },
    { regex: /산(?:에)?(?:\s*갔)?/, replace: '산에 갔다' },
    { regex: /공원(?:에)?(?:\s*갔)?/, replace: '공원에 갔다' },

    // 활동 관련
    { regex: /면접(?:을)?(?:\s*봤?|보)?/, replace: '면접을 봤다' },
    { regex: /일(?:을)?(?:\s*하)?/, replace: '일을 했다' },
    { regex: /야경(?:을)?(?:\s*보|봤)?/, replace: '야경을 봤다' },
    { regex: /졸업(?:했|을)?/, replace: '졸업을 했다' },
    { regex: /결혼(?:했|을)?/, replace: '결혼을 했다' },

    // 가족/사람 관련
    { regex: /가족(?:과|이랑|하고)?(?:\s*함께)?/, replace: '가족과 함께했다' },
    { regex: /친구(?:와|랑|하고)?(?:\s*만)?/, replace: '친구를 만났다' },
  ];

  // 패턴 매칭으로 변환 시도
  for (const { regex, replace } of patterns) {
    if (regex.test(narrative)) {
      return replace;
    }
  }

  // 동사 어미 변환 (해요체/존댓말 → 일기체)
  narrative = narrative
    .replace(/했어요\.?$/g, '했다')
    .replace(/갔어요\.?$/g, '갔다')
    .replace(/봤어요\.?$/g, '봤다')
    .replace(/먹었어요\.?$/g, '먹었다')
    .replace(/왔어요\.?$/g, '왔다')
    .replace(/좋았어요\.?$/g, '좋았다')
    .replace(/있었어요\.?$/g, '있었다')
    .replace(/만났어요\.?$/g, '만났다')
    .replace(/했습니다\.?$/g, '했다')
    .replace(/입니다\.?$/g, '이다')
    .replace(/어요\.?$/g, '다')
    .replace(/네요\.?$/g, '다')
    .replace(/요$/g, '');

  // 이미 완성된 문장 (서술형 어미로 끝나면)
  if (/[다요죠네]\.?$/.test(narrative)) {
    // 존댓말 어미를 일기체로 변환
    narrative = narrative.replace(/요$/, '다');
    return narrative.endsWith('.') ? narrative : narrative;
  }

  // 감정 표현이 포함된 경우 자연스럽게 변환
  if (/별로|좋았|싫었|행복|슬펐|힘들/.test(narrative)) {
    if (!narrative.endsWith('다') && !narrative.endsWith('다.')) {
      return `그때 ${narrative}던 기억이 난다`;
    }
    return narrative;
  }

  // 변환 불가능한 경우 null 반환 (어색한 문장 방지)
  return null;
}

// 대화에서 주제 추출
function extractMainTopic(userMsgs: string[], aiMsgs: string[]): string {
  const allText = [...userMsgs, ...aiMsgs].join(' ');

  // 주제 패턴 (우선순위 순)
  const topicPatterns = [
    { pattern: /면접|취업|일자리|구직/, topic: '면접' },
    { pattern: /졸업|학교|대학|학창/, topic: '학창시절' },
    { pattern: /결혼|신혼|배우자|웨딩/, topic: '결혼' },
    { pattern: /여행|휴가|관광|바다|산/, topic: '여행' },
    { pattern: /가족|부모|자녀|아들|딸|손자|손녀/, topic: '가족' },
    { pattern: /친구|동창|모임/, topic: '친구' },
    { pattern: /생일|축하|파티|케이크/, topic: '생일' },
    { pattern: /명절|설날|추석|차례/, topic: '명절' },
    { pattern: /직장|회사|일|근무/, topic: '직장' },
  ];

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(allText)) {
      return topic;
    }
  }

  return '추억';
}

// 감정 추출
function extractEmotion(userMsgs: string[]): '긍정' | '부정' | '중립' {
  const lastMsgs = userMsgs.slice(-3).join(' ');

  // 부정 감정 우선 체크
  if (/별로|싫|슬프|힘들|안좋|무서|걱정|외로|안 좋/.test(lastMsgs)) {
    return '부정';
  }

  // 긍정 감정 체크
  if (/좋|행복|기쁘|즐거|그립|재밌|신나|멋|예쁘/.test(lastMsgs)) {
    return '긍정';
  }

  return '중립';
}

// 자연스러운 일기 문장 조합
function composeDiaryEntry(topic: string, emotion: '긍정' | '부정' | '중립', userDetail?: string): string {
  const templates = {
    부정: [
      `오늘 옛날 ${topic} 사진을 보며 이야기를 나눴다. 그때 마음이 편치 않았던 기억이 떠올랐다.`,
      `사진을 보며 ${topic}을 떠올렸다. 그때는 조금 힘들었던 것 같다.`,
      `오늘 ${topic} 이야기를 했다. 그때 기분이 좋지 않았던 기억이 났다.`,
    ],
    긍정: [
      `오늘 ${topic} 사진을 보며 따뜻한 추억을 나눴다. 그때가 참 그립다.`,
      `옛날 ${topic} 이야기를 했다. 좋은 시절이었다.`,
      `오늘 옛날 사진 속 ${topic} 이야기를 나눴다. 행복했던 그 시절이 생각났다.`,
    ],
    중립: [
      `오늘 ${topic}에 대한 이야기를 나눴다. 여러 생각이 들었다.`,
      `옛날 사진을 보며 ${topic} 이야기를 했다. 그때가 떠올랐다.`,
      `오늘 옛날 ${topic} 사진을 보았다. 세월이 많이 흘렀다.`,
    ],
  };

  const selectedTemplates = templates[emotion];
  return selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
}

// 대화 요약 생성 (그림일기용) - 1인칭 서술형
export function generateDiarySummary(
  messages: Array<{ role: string; content: string }>
): string {
  // 사용자 메시지만 추출
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.trim())
    .filter(m => m.length > 0);

  if (userMessages.length === 0) {
    return '오늘 옛날 사진을 보며 조용히 추억에 잠겼다.';
  }

  // AI 메시지에서 주제 힌트 추출
  const aiMessages = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content);

  // 대화 흐름 기반 일기 생성
  const topic = extractMainTopic(userMessages, aiMessages);
  const emotion = extractEmotion(userMessages);

  // 사용자의 마지막 의미있는 발화 추출 (감정 표현 등)
  const lastMeaningfulMsg = userMessages
    .slice()
    .reverse()
    .find(msg => msg.length > 5 && !/^(네|응|예|맞아|그래)$/.test(msg.trim()));

  // 사용자 발화에서 직접적인 표현 추출 시도
  if (lastMeaningfulMsg) {
    const converted = convertToFirstPersonNarrative(lastMeaningfulMsg);
    if (converted) {
      // 감정과 주제를 조합하여 자연스러운 문장 생성
      if (emotion === '부정') {
        return `오늘 옛날 ${topic} 사진을 보며 이야기를 나눴다. ${converted}. 그래도 소중한 추억이다.`;
      } else if (emotion === '긍정') {
        return `오늘 옛날 ${topic} 사진을 보며 이야기를 나눴다. ${converted}. 따뜻한 시간이었다.`;
      }
      return `오늘 옛날 ${topic} 사진을 보며 이야기를 나눴다. ${converted}.`;
    }
  }

  // 변환 실패 시 템플릿 기반 일기 생성
  return composeDiaryEntry(topic, emotion, lastMeaningfulMsg);
}

export default {
  empathyResponses,
  followUpPatterns,
  generateDummyResponse,
  generateDiarySummary,
  clearUsedQuestions,
};
