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

  return `당신은 어르신들의 회상 치료를 돕는 따뜻한 대화 상대입니다.
${userProfilePrompt}

## 역할
- 사진을 보며 과거의 추억을 자연스럽게 회상하도록 돕습니다
- 공감적이고 따뜻한 어투로 대화합니다
- 질문을 통해 더 깊은 기억을 이끌어냅니다
- 부정적인 감정이 나오면 공감하되, 긍정적인 방향으로 유도합니다

## 사진 정보
- 카테고리: ${category} (${categoryDesc})
- 촬영 시기: ${photoContext.takenDate || '알 수 없음'}
${photoContext.autoTags?.description ? `- 사진 설명: ${photoContext.autoTags.description}` : ''}
${photoContext.autoTags?.scene ? `- 장면: ${photoContext.autoTags.scene}` : ''}
${photoContext.autoTags?.mood ? `- 분위기: ${photoContext.autoTags.mood}` : ''}
${photoContext.autoTags?.peopleCount ? `- 인원: ${photoContext.autoTags.peopleCount}명` : ''}

## 기억 유도 전략 (매우 중요!)
1. 사용자가 "기억 안 나요" / "모르겠어요" / "잘 모르겠어요" 라고 하면:
   - 힌트 제공: "혹시 그때 날씨가 어땠는지 기억나세요?", "어떤 음식을 드셨을까요?"
   - 감각 자극: "어떤 냄새가 났을까요?", "어떤 소리가 들렸을까요?"
   - 연상 유도: "이 장소에서 자주 하셨던 일이 있으신가요?"
   - 절대 포기하지 말고 다른 각도로 질문하세요

2. 사용자가 기억을 말하면:
   - 공감: "정말 좋은 추억이네요!", "아, 그러셨군요!"
   - 심화 질문: "그때 어떤 기분이셨어요?", "그 다음엔 뭘 하셨나요?"
   - 연결 질문: "비슷한 경험이 또 있으셨나요?"
   - 구체화: "누구와 함께 계셨어요?", "어떤 이야기를 나누셨나요?"

3. 대화 톤:
   - 절대 부정하지 않음
   - 항상 따뜻하고 격려하는 어투
   - 어르신의 기억을 존중하고 칭찬
   - "잘 기억하고 계시네요!", "좋은 말씀이에요" 같은 격려 사용

## 대화 가이드라인
1. 짧고 명확한 질문을 합니다 (한 번에 하나씩)
2. 열린 질문을 사용합니다 ("어땠어요?", "기억나시나요?")
3. 구체적인 감각을 물어봅니다 (소리, 냄새, 맛, 감촉)
4. 감정에 공감하고 인정합니다
5. 2-3문장 이내로 답변합니다
6. 존댓말을 사용합니다

## 금지 사항
- 너무 긴 답변 금지
- 사실 확인이나 정정 금지 (어르신의 기억을 존중)
- 부정적인 평가 금지
- 의학적 조언 금지`;
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
  userProfile?: UserProfileForChat
): Promise<string> {
  const category = photoContext.category || 'daily';
  const conversationLength = conversationHistory.filter(m => m.role === 'user').length;
  const config = getCurrentConfig();

  // Gemini API 사용
  if (config.provider === 'gemini') {
    try {
      // Message 타입을 GeminiMessage 타입으로 변환
      const geminiHistory: GeminiMessage[] = conversationHistory.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));
      const result = await geminiReminiscenceResponse(photoContext, geminiHistory, userMessage, userProfile);
      if (result) return result;
    } catch (error) {
      console.error('Gemini response generation failed:', error);
    }
    // 실패 시 더미 응답 사용
    return generateDummyResponse(category, userMessage, conversationLength);
  }

  // Dummy 모드
  if (config.provider === 'dummy') {
    return generateDummyResponse(category, userMessage, conversationLength);
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
    return generateDummyResponse(category, userMessage, conversationLength);
  } catch (error) {
    console.error('Failed to generate reminiscence response:', error);
    return generateDummyResponse(category, userMessage, conversationLength);
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
    const summaryPrompt = `다음 대화 내용을 바탕으로 그날의 일기를 작성해주세요.

## 일기 작성 가이드
- 1인칭 시점으로 작성 ("오늘은...", "그날 나는...")
- 대화에서 언급된 구체적인 내용 포함 (장소, 사람, 활동, 감정)
- 3-5문장 정도의 짧은 일기 형태
- 따뜻하고 감성적인 어투
- 그날 무엇을 했는지, 어떤 기분이었는지 자연스럽게 서술

대화 내용:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`;

    // TODO: [LLM_API] OpenAI/Claude API 호출
    console.log(`${config.provider} API not implemented yet`);
    return generateDiarySummary(conversationHistory);
  } catch (error) {
    console.error('Failed to generate conversation summary:', error);
    return generateDiarySummary(conversationHistory);
  }
}

/**
 * 이미지 생성 프롬프트 생성 (그림일기용 - 색연필 스케치 스타일 고정)
 * TODO: [IMAGE_API] DALL-E 또는 Stable Diffusion 연동
 */
export async function generateDiaryImagePrompt(
  photoContext: PhotoData,
  conversationSummary: string
): Promise<string> {
  const scene = photoContext.autoTags?.scene || '';
  const mood = photoContext.autoTags?.mood || '';

  // 색연필 스케치 스타일 프롬프트
  const coloredPencilStyle = 'colored pencil sketch style, soft hand-drawn lines, gentle shading, warm nostalgic feeling, artistic illustration';

  // 기본 프롬프트 생성
  const basePrompt = `A warm, nostalgic colored pencil sketch illustration depicting: ${conversationSummary}`;

  // 스타일 요소 추가
  const styleElements = [
    coloredPencilStyle,
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
