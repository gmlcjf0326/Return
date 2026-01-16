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
 * 회상 대화 시스템 프롬프트 생성
 */
function buildReminiscenceSystemPrompt(photoContext: PhotoData): string {
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

  return `당신은 어르신들의 회상 치료를 돕는 따뜻한 대화 상대입니다.

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
  photoContext: PhotoData
): Promise<string> {
  const category = photoContext.category || 'daily';
  const config = getCurrentConfig();

  // Gemini API 사용
  if (config.provider === 'gemini') {
    try {
      const result = await geminiInitialQuestion(photoContext);
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
    const systemPrompt = buildReminiscenceSystemPrompt(photoContext);
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
  userMessage: string
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
      const result = await geminiReminiscenceResponse(photoContext, geminiHistory, userMessage);
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
    const systemPrompt = buildReminiscenceSystemPrompt(photoContext);

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
    const summaryPrompt = `다음 대화 내용을 1-2문장으로 요약해주세요.
사진 속 추억의 핵심 내용만 간단히 정리해주세요.

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
 * 이미지 생성 프롬프트 생성 (그림일기용)
 * TODO: [IMAGE_API] DALL-E 또는 Stable Diffusion 연동
 */
export async function generateDiaryImagePrompt(
  photoContext: PhotoData,
  conversationSummary: string
): Promise<string> {
  const category = photoContext.category || 'daily';
  const scene = photoContext.autoTags?.scene || '';
  const mood = photoContext.autoTags?.mood || '';

  // 기본 프롬프트 생성
  const basePrompt = `A warm, nostalgic illustration in watercolor style depicting: ${conversationSummary}`;

  // 스타일 요소 추가
  const styleElements = [
    'soft pastel colors',
    'gentle lighting',
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
