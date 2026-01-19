/**
 * LLM API 래퍼 (회상 대화용)
 *
 * 지원 LLM:
 * - Google Gemini (기본, 나노/플래시 모델)
 * - OpenAI GPT-4o
 * - Claude API
 * - Ollama (로컬 테스트용)
 */

import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';
import type { UserProfileForChat } from '@/types';
import { generateDummyResponse, generateDiarySummary } from '@/data/dummyLLMResponses';
import { getRandomInitialQuestion } from '@/data/reminiscenceQuestions';
import {
  hasGeminiApiKey,
  getGeminiConfig,
  generateInitialQuestion as geminiInitialQuestion,
  generateReminiscenceResponse as geminiReminiscenceResponse,
  generateReminiscenceResponseWithImage as geminiReminiscenceResponseWithImage,
  generateDiarySummary as geminiDiarySummary,
  type GeminiMessage,
} from './gemini';

// 대화 메시지 타입
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// LLM 설정
interface LLMConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'ollama' | 'dummy';
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

// 현재 설정 결정 함수
function getCurrentConfig(): LLMConfig {
  // Gemini 우선
  if (hasGeminiApiKey()) {
    const geminiConfig = getGeminiConfig();
    return {
      provider: 'gemini',
      model: geminiConfig.textModel,
    };
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      model: 'gpt-4o-mini',
    };
  }

  // Claude
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'claude',
      model: 'claude-3-haiku',
    };
  }

  // 기본값: dummy
  return {
    provider: 'dummy',
    model: 'dummy',
  };
}

// 현재 설정 (동적으로 결정)
const currentConfig: LLMConfig = getCurrentConfig();

/**
 * API 키 유효성 확인
 */
export function hasValidApiKey(): boolean {
  const geminiKey = hasGeminiApiKey();
  const openaiKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.ANTHROPIC_API_KEY;

  return !!(geminiKey || openaiKey || claudeKey);
}

/**
 * 사용자 프로필 정보를 프롬프트 문자열로 변환
 */
function buildUserProfilePrompt(userProfile?: UserProfileForChat): string {
  if (!userProfile) return '';

  const parts: string[] = [];

  if (userProfile.nickname) {
    parts.push(`- 이름/닉네임: ${userProfile.nickname}`);
  }
  if (userProfile.age || userProfile.birthYear) {
    const ageInfo = userProfile.age
      ? `약 ${userProfile.age}세${userProfile.birthYear ? ` (${userProfile.birthYear}년생)` : ''}`
      : `${userProfile.birthYear}년생`;
    parts.push(`- 나이: ${ageInfo}`);
  }
  if (userProfile.gender) {
    const genderText = userProfile.gender === 'male' ? '남성' : userProfile.gender === 'female' ? '여성' : '기타';
    parts.push(`- 성별: ${genderText}`);
  }
  if (userProfile.region) {
    parts.push(`- 거주 지역: ${userProfile.region}`);
  }
  if (userProfile.interests && userProfile.interests.length > 0) {
    parts.push(`- 관심사: ${userProfile.interests.join(', ')}`);
  }

  if (parts.length === 0) return '';

  return `
## 사용자 정보
${parts.join('\n')}

## 개인화된 대화 전략
- 사용자의 이름(닉네임)을 자연스럽게 불러주세요
- 사용자의 관심사와 연결된 질문을 활용하세요
- 거주 지역과 관련된 추억을 물어보세요
- 나이/세대에 맞는 문화적 맥락을 참고하세요`;
}

/**
 * 사용자가 이미지 설명을 요청하는지 감지
 */
function detectImageDescriptionRequest(message: string): boolean {
  const patterns = [
    /이미지.*(설명|말해|알려|보여|뭐야|뭐가|어때|분석|봐)/,
    /사진.*(설명|말해|알려|보여|뭐야|뭐가|어때|분석|봐)/,
    /(설명|말해|알려|분석).*(이미지|사진)/,
    /뭐가.*보여|무엇이.*보여/,
    /현재.*(이미지|사진)/,
    /이.*사진.*(뭐|무엇)/,
    /어떤.*(사진|이미지)/,
    /사진.*보이/,
    /뭐.*찍/,
    /무엇.*찍/,
    /분석.*해|분석해봐|분석해줘/,
    /사진.*대해/,  // "사진에 대해서"
  ];

  return patterns.some(p => p.test(message));
}

/**
 * 회상 대화 시스템 프롬프트 생성
 */
function buildReminiscenceSystemPrompt(photoContext: PhotoData, userProfile?: UserProfileForChat): string {
  const categoryDescriptions: Record<PhotoCategory, string> = {
    family: '가족과 함께한 소중한 순간',
    travel: '여행의 즐거운 추억',
    event: '특별한 행사나 기념일',
    nature: '아름다운 자연 풍경',
    daily: '일상의 따뜻한 순간',
    friends: '친구들과의 추억',
  };

  const category = photoContext.category || 'daily';
  const categoryDesc = categoryDescriptions[category];
  const userProfilePrompt = buildUserProfilePrompt(userProfile);
  const autoTags = photoContext.autoTags;

  // 사진 정보 문자열 구성 (태그 정보 최대한 활용)
  const photoInfoParts: string[] = [
    `- 카테고리: ${category} (${categoryDesc})`,
    `- 촬영 시기: ${photoContext.takenDate || '알 수 없음'}`,
  ];

  if (autoTags) {
    if (autoTags.scene) photoInfoParts.push(`- 장면: ${autoTags.scene}`);
    if (autoTags.mood) photoInfoParts.push(`- 분위기: ${autoTags.mood}`);
    if (autoTags.peopleCount) photoInfoParts.push(`- 인원: ${autoTags.peopleCount}명`);
    if (autoTags.locationType) photoInfoParts.push(`- 장소 유형: ${autoTags.locationType}`);
    if (autoTags.estimatedEra) photoInfoParts.push(`- 추정 시대: ${autoTags.estimatedEra}`);
    if (autoTags.objects && autoTags.objects.length > 0) {
      photoInfoParts.push(`- 사진 속 물체: ${autoTags.objects.join(', ')}`);
    }
    if (autoTags.description) photoInfoParts.push(`- AI 분석 설명: ${autoTags.description}`);
  }

  if (photoContext.userTags && photoContext.userTags.length > 0) {
    photoInfoParts.push(`- 사용자 태그: ${photoContext.userTags.join(', ')}`);
  }

  const photoInfo = photoInfoParts.join('\n');

  return `당신은 어르신들의 회상 치료를 돕는 따뜻한 대화 상대입니다.
${userProfilePrompt}

## 역할
- 사진을 보며 과거의 추억을 자연스럽게 회상하도록 돕습니다
- 공감적이고 따뜻한 어투로 대화합니다
- 질문을 통해 더 깊은 기억을 이끌어냅니다
- 부정적인 감정이 나오면 공감하되, 긍정적인 방향으로 유도합니다

## 사진 정보 (★매우 중요 - 반드시 참조하세요★)
${photoInfo}

## ★핵심 규칙: 사진 정보를 반드시 활용하세요★
- 위의 "사진 정보"에 있는 장면, 분위기, 장소, 물체, 시대 등을 적극 활용하여 질문하세요
- 사진과 무관한 일반적인 질문(예: "TV 프로그램", "좋아하시던 음식")을 하지 마세요
- 사용자가 "네", "응", "맞아요" 같은 짧은 긍정 응답을 하면, 바로 전 대화 맥락을 이어서 더 구체적인 질문을 하세요
- 항상 사진에 보이는 것, 사진의 상황과 관련된 질문을 하세요

## 기억 유도 전략 (매우 중요!)
1. 사용자가 "기억 안 나요" / "모르겠어요" / "잘 모르겠어요" 라고 하면:
   - 사진 속 물체나 장면을 활용한 힌트 제공
   - 감각 자극: "어떤 냄새가 났을까요?", "어떤 소리가 들렸을까요?"
   - 절대 포기하지 말고 사진의 다른 요소로 질문하세요

2. 사용자가 기억을 말하면:
   - 공감: "정말 좋은 추억이네요!", "아, 그러셨군요!"
   - 심화 질문: "그때 어떤 기분이셨어요?", "그 다음엔 뭘 하셨나요?"
   - 구체화: "누구와 함께 계셨어요?", "어떤 이야기를 나누셨나요?"

3. 사용자가 "네", "응", "맞아요" 같은 짧은 긍정 응답을 하면:
   - 이전 대화 맥락을 이어서 더 깊이 물어보세요
   - "그렇군요! 그때 기분이 어떠셨어요?", "좀 더 이야기해 주시겠어요?" 같은 후속 질문

## 대화 가이드라인
1. 짧고 명확한 질문을 합니다 (한 번에 하나씩)
2. 열린 질문을 사용합니다 ("어땠어요?", "기억나시나요?")
3. 2-3문장 이내로 답변합니다
4. 존댓말을 사용합니다

## 금지 사항
- 사진과 무관한 일반적인 질문 금지 (예: TV 프로그램, 라디오 등)
- 너무 긴 답변 금지
- 사실 확인이나 정정 금지 (어르신의 기억을 존중)
- 부정적인 평가 금지`;
}

/**
 * 회상 대화 초기 질문 생성
 */
export async function generateInitialQuestion(
  photoContext: PhotoData,
  userProfile?: UserProfileForChat
): Promise<string> {
  const category = photoContext.category || 'daily';
  const config = getCurrentConfig();

  // Gemini API 사용
  if (config.provider === 'gemini') {
    try {
      const result = await geminiInitialQuestion(photoContext, userProfile);
      if (result) return result;
    } catch (error) {
      console.error('Gemini initial question failed:', error);
    }
    // 실패 시 더미 응답 사용
    return getRandomInitialQuestion(category);
  }

  // Dummy 모드
  if (config.provider === 'dummy') {
    return getRandomInitialQuestion(category);
  }

  // 기타 API (미구현)
  try {
    const systemPrompt = buildReminiscenceSystemPrompt(photoContext, userProfile);
    const userPrompt = `이 사진을 처음 보여드리며 대화를 시작합니다.
사진에 대해 자연스럽게 대화를 시작할 수 있는 첫 질문을 해주세요.
질문은 1-2문장으로 짧게 해주세요.`;

    // TODO: [LLM_API] OpenAI/Claude API 호출
    console.log(`${config.provider} API not implemented yet`);
    return getRandomInitialQuestion(category);
  } catch (error) {
    console.error('Failed to generate initial question:', error);
    return getRandomInitialQuestion(category);
  }
}

/**
 * 회상 대화 응답 생성
 */
export async function generateReminiscenceResponse(
  photoContext: PhotoData,
  conversationHistory: Message[],
  userMessage: string,
  userProfile?: UserProfileForChat,
  sessionId?: string,
  imageUrl?: string  // 이미지 URL 추가
): Promise<string> {
  const category = photoContext.category || 'daily';
  const conversationLength = conversationHistory.filter(m => m.role === 'user').length;
  const config = getCurrentConfig();

  console.log('[LLM] 현재 설정:', config.provider, '모델:', config.model);

  // Gemini API 사용
  if (config.provider === 'gemini') {
    try {
      // Message 타입을 GeminiMessage 타입으로 변환
      const geminiHistory: GeminiMessage[] = conversationHistory.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      // 이미지 설명 요청인지 확인
      const isImageRequest = detectImageDescriptionRequest(userMessage);
      const effectiveImageUrl = imageUrl || photoContext.fileUrl;

      console.log('[LLM] 이미지 요청 감지:', isImageRequest, '메시지:', userMessage);
      console.log('[LLM] 이미지 URL:', effectiveImageUrl ? effectiveImageUrl.substring(0, 50) + '...' : 'none');

      let result: string | null = null;

      // 이미지 설명 요청이면 멀티모달 사용
      if (isImageRequest && effectiveImageUrl) {
        console.log('[LLM] 멀티모달 API 호출 시작...');
        result = await geminiReminiscenceResponseWithImage(
          photoContext,
          geminiHistory,
          userMessage,
          userProfile,
          effectiveImageUrl
        );
        console.log('[LLM] 멀티모달 결과:', result ? '성공' : '실패');
      }

      // 멀티모달 실패 또는 일반 대화는 텍스트 전용
      if (!result) {
        console.log('[LLM] 텍스트 전용 API 호출...');
        result = await geminiReminiscenceResponse(photoContext, geminiHistory, userMessage, userProfile);
      }

      if (result) return result;
    } catch (error) {
      console.error('Gemini response generation failed:', error);
    }
    // 실패 시 더미 응답 사용 (sessionId + photoContext 전달)
    console.log('[LLM] Gemini 실패, 더미 응답 사용');
    return generateDummyResponse(category, userMessage, conversationLength, conversationHistory, sessionId, photoContext);
  }

  // Dummy 모드 (sessionId + photoContext 전달)
  if (config.provider === 'dummy') {
    return generateDummyResponse(category, userMessage, conversationLength, conversationHistory, sessionId, photoContext);
  }

  // 기타 API (미구현)
  try {
    const systemPrompt = buildReminiscenceSystemPrompt(photoContext, userProfile);

    // 대화 이력을 LLM 형식으로 변환
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // TODO: [LLM_API] OpenAI/Claude API 호출
    console.log(`${config.provider} API not implemented yet`);
    return generateDummyResponse(category, userMessage, conversationLength, conversationHistory, sessionId, photoContext);
  } catch (error) {
    console.error('Failed to generate reminiscence response:', error);
    return generateDummyResponse(category, userMessage, conversationLength, conversationHistory, sessionId, photoContext);
  }
}

/**
 * 대화 내용 요약 생성 (그림일기용)
 */
export async function generateConversationSummary(
  photoContext: PhotoData,
  conversationHistory: Message[]
): Promise<string> {
  const config = getCurrentConfig();

  // Gemini API 사용
  if (config.provider === 'gemini') {
    try {
      // Message 타입을 GeminiMessage 타입으로 변환
      const geminiHistory: GeminiMessage[] = conversationHistory.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));
      const result = await geminiDiarySummary(geminiHistory);
      if (result) return result;
    } catch (error) {
      console.error('Gemini summary generation failed:', error);
    }
    // 실패 시 더미 응답 사용
    return generateDiarySummary(conversationHistory);
  }

  // Dummy 모드
  if (config.provider === 'dummy') {
    return generateDiarySummary(conversationHistory);
  }

  // 기타 API (미구현)
  try {
    const summaryPrompt = `다음은 어르신과 AI가 옛날 사진을 보며 나눈 대화입니다.
이 대화를 바탕으로 자연스러운 그림일기 문장을 1-2문장으로 작성해주세요.

## 필수 규칙
- "~했다", "~였다" 형식의 일기체로 작성
- 어르신이 말한 구체적인 내용과 감정을 반영
- "에 대한 추억이 있다" 같은 어색한 표현 금지
- 따뜻하고 회상적인 톤 유지
- 과거 시제 사용

## 좋은 예시
- "오늘 면접 보던 시절 사진을 보며 이야기를 나눴다. 그때 기분이 좋지 않았던 기억이 떠올랐다."
- "옛날 가족 여행 사진을 보았다. 함께 웃던 그 시절이 그립다."

## 나쁜 예시 (피해야 할 표현)
- "면접에 대한 추억이 있다." (어색함)
- "기분이 썩 별로였어에 대한 추억이 있다." (문법 오류)

대화:
${conversationHistory.map(m => `${m.role === 'user' ? '어르신' : 'AI'}: ${m.content}`).join('\n')}

그림일기 문장:`;

    // TODO: [LLM_API] OpenAI/Claude API 호출
    console.log(`${config.provider} API not implemented yet`);
    return generateDiarySummary(conversationHistory);
  } catch (error) {
    console.error('Failed to generate conversation summary:', error);
    return generateDiarySummary(conversationHistory);
  }
}

/**
 * 이미지 생성 프롬프트 생성 (그림일기용 - 수채화 스타일 기본)
 * TODO: [IMAGE_API] DALL-E 또는 Stable Diffusion 연동
 */
export async function generateDiaryImagePrompt(
  photoContext: PhotoData,
  conversationSummary: string
): Promise<string> {
  const scene = photoContext.autoTags?.scene || '';
  const mood = photoContext.autoTags?.mood || '';

  // 수채화 스타일 프롬프트
  const watercolorStyle = 'soft watercolor painting style, gentle brush strokes, warm pastel colors, dreamy nostalgic atmosphere, hand-painted diary illustration feel';

  // 기본 프롬프트 생성
  const basePrompt = `A warm, nostalgic watercolor illustration depicting: ${conversationSummary}`;

  // 스타일 요소 추가
  const styleElements = [
    watercolorStyle,
    'heartwarming atmosphere',
    mood && `${mood} mood`,
    scene && `${scene} setting`,
  ].filter(Boolean).join(', ');

  return `${basePrompt}. Style: ${styleElements}. Korean elderly-friendly, reminiscence therapy art style.`;
}

/**
 * LLM 설정 확인
 */
export function getLLMConfig(): LLMConfig {
  return { ...getCurrentConfig() };
}

/**
 * 사용 가능한 LLM 목록
 */
export function getAvailableLLMs(): Array<{ provider: string; available: boolean; priority: number; model?: string }> {
  return [
    {
      provider: 'gemini',
      available: hasGeminiApiKey(),
      priority: 1,
      model: getGeminiConfig().textModel,
    },
    {
      provider: 'openai',
      available: !!process.env.OPENAI_API_KEY,
      priority: 2,
      model: 'gpt-4o-mini',
    },
    {
      provider: 'claude',
      available: !!process.env.ANTHROPIC_API_KEY,
      priority: 3,
      model: 'claude-3-haiku',
    },
    {
      provider: 'ollama',
      available: false, // TODO: Ollama 연결 확인 로직
      priority: 4,
    },
    {
      provider: 'dummy',
      available: true, // 항상 사용 가능
      priority: 99,
    },
  ].sort((a, b) => a.priority - b.priority);
}

/**
 * 현재 활성화된 LLM 가져오기
 */
export function getActiveLLM(): { provider: string; model?: string } {
  const config = getCurrentConfig();
  return {
    provider: config.provider,
    model: config.model,
  };
}

export default {
  hasValidApiKey,
  generateInitialQuestion,
  generateReminiscenceResponse,
  generateConversationSummary,
  generateDiaryImagePrompt,
  getLLMConfig,
  getAvailableLLMs,
  getActiveLLM,
};
