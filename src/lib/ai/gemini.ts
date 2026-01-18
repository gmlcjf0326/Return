/**
 * Google Gemini API 연동 모듈
 *
 * 지원 기능:
 * - 텍스트 생성 (gemini-1.5-flash-8b / gemini-1.5-flash)
 * - 이미지 생성 (Imagen 3)
 * - 음성 → 텍스트 변환 (Gemini STT)
 * - 회상 대화 응답 생성
 * - 일기 요약 생성
 */

import { GoogleGenAI } from '@google/genai';
import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';
import type { UserProfileForChat } from '@/types';

// Gemini 클라이언트 싱글톤
let geminiClient: GoogleGenAI | null = null;

/**
 * Gemini 클라이언트 가져오기 (싱글톤)
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not configured');
    return null;
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

/**
 * Gemini API 키 유효성 확인
 */
export function hasGeminiApiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * 텍스트 모델 이름 가져오기
 */
export function getTextModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';
}

/**
 * 이미지 모델 이름 가져오기 (Imagen 3)
 */
export function getImageModel(): string {
  return 'imagen-3.0-generate-001';
}

/**
 * Gemini 설정 정보 가져오기
 */
export function getGeminiConfig() {
  return {
    hasApiKey: hasGeminiApiKey(),
    textModel: getTextModel(),
    imageModel: getImageModel(),
    provider: 'gemini' as const,
  };
}

/**
 * 텍스트 생성
 */
export async function generateText(prompt: string, systemPrompt?: string): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) {
    console.warn('Gemini client not available');
    return null;
  }

  try {
    const model = getTextModel();
    const contents = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;

    const response = await client.models.generateContent({
      model,
      contents,
    });

    return response.text || null;
  } catch (error) {
    console.error('Gemini text generation failed:', error);
    return null;
  }
}

/**
 * 이미지 생성 (Imagen 3)
 * @returns base64 이미지 데이터 또는 null
 */
export async function generateImage(prompt: string): Promise<{ imageData: string; mimeType: string } | null> {
  const client = getGeminiClient();
  if (!client) {
    console.warn('Gemini client not available');
    return null;
  }

  try {
    const model = getImageModel();

    // Imagen 3 이미지 생성 요청
    const response = await client.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg',
      },
    });

    // 생성된 이미지 추출
    const generatedImages = response.generatedImages || [];
    if (generatedImages.length > 0 && generatedImages[0].image?.imageBytes) {
      return {
        imageData: generatedImages[0].image.imageBytes,
        mimeType: 'image/jpeg',
      };
    }

    console.warn('No image generated in response');
    return null;
  } catch (error) {
    console.error('Imagen 3 image generation failed:', error);
    return null;
  }
}

/**
 * 음성 → 텍스트 변환 (Gemini STT)
 * @param audioData - base64 인코딩된 오디오 데이터
 * @param mimeType - 오디오 MIME 타입 (audio/webm, audio/wav 등)
 * @returns 변환된 텍스트 또는 null
 */
export async function transcribeAudio(
  audioData: string,
  mimeType: string = 'audio/webm'
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) {
    console.warn('Gemini client not available');
    return null;
  }

  try {
    const model = getTextModel();

    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioData,
              },
            },
            {
              text: '이 오디오의 내용을 정확하게 텍스트로 변환해주세요. 오직 오디오에서 들리는 말만 출력하고, 다른 설명은 하지 마세요.',
            },
          ],
        },
      ],
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error('Gemini audio transcription failed:', error);
    return null;
  }
}

/**
 * 음성 응답 분석 (예상 답변과 비교)
 * @param transcript - 변환된 텍스트
 * @param expected - 예상 정답 (문자열 또는 문자열 배열)
 * @returns 정확도 점수 (0-100) 및 분석 결과
 */
export async function analyzeVoiceResponse(
  transcript: string,
  expected: string | string[]
): Promise<{ score: number; isCorrect: boolean; feedback: string }> {
  const client = getGeminiClient();
  if (!client) {
    return { score: 0, isCorrect: false, feedback: 'API 연결 실패' };
  }

  // 예상 정답 배열로 변환
  const expectedAnswers = Array.isArray(expected) ? expected : [expected];

  // 간단한 fuzzy matching
  const normalizedTranscript = transcript.toLowerCase().replace(/\s+/g, '').replace(/[.,!?]/g, '');

  for (const answer of expectedAnswers) {
    const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, '').replace(/[.,!?]/g, '');

    // 정확히 일치
    if (normalizedTranscript === normalizedAnswer) {
      return { score: 100, isCorrect: true, feedback: '정확합니다!' };
    }

    // 포함 관계 확인
    if (normalizedTranscript.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedTranscript)) {
      return { score: 80, isCorrect: true, feedback: '거의 정확합니다.' };
    }
  }

  // AI를 사용한 상세 분석
  try {
    const response = await client.models.generateContent({
      model: getTextModel(),
      contents: `사용자 답변: "${transcript}"
예상 정답: ${expectedAnswers.join(', ')}

위 사용자 답변이 예상 정답과 얼마나 일치하는지 0-100 점수로 평가하고, 간단한 피드백을 주세요.
JSON 형식으로 응답하세요: {"score": 점수, "feedback": "피드백"}`,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.score || 0,
        isCorrect: (result.score || 0) >= 60,
        feedback: result.feedback || '평가 완료',
      };
    }
  } catch (error) {
    console.error('Voice response analysis failed:', error);
  }

  return { score: 0, isCorrect: false, feedback: '답변을 확인해주세요.' };
}

// 카테고리별 설명
const categoryDescriptions: Record<PhotoCategory, string> = {
  family: '가족과 함께한 소중한 순간',
  travel: '여행의 즐거운 추억',
  event: '특별한 행사나 기념일',
  nature: '아름다운 자연 풍경',
  daily: '일상의 따뜻한 순간',
  friends: '친구들과의 추억',
};

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

// 대화 메시지 타입
export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 회상 대화 초기 질문 생성
 */
export async function generateInitialQuestion(
  photoContext: PhotoData,
  userProfile?: UserProfileForChat
): Promise<string | null> {
  const systemPrompt = buildReminiscenceSystemPrompt(photoContext, userProfile);
  const userPrompt = `이 사진을 처음 보여드리며 대화를 시작합니다.
사진에 대해 자연스럽게 대화를 시작할 수 있는 첫 질문을 해주세요.
질문은 1-2문장으로 짧게 해주세요.`;

  return generateText(userPrompt, systemPrompt);
}

/**
 * 회상 대화 응답 생성
 */
export async function generateReminiscenceResponse(
  photoContext: PhotoData,
  conversationHistory: GeminiMessage[],
  userMessage: string,
  userProfile?: UserProfileForChat
): Promise<string | null> {
  const systemPrompt = buildReminiscenceSystemPrompt(photoContext, userProfile);

  // 대화 이력 구성
  const historyText = conversationHistory
    .map(msg => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
    .join('\n');

  const fullPrompt = `${historyText ? `이전 대화:\n${historyText}\n\n` : ''}사용자: ${userMessage}

위 대화에 이어서 따뜻하게 응답해주세요. 2-3문장 이내로 짧게 답변하세요.`;

  return generateText(fullPrompt, systemPrompt);
}

/**
 * 대화 내용 요약 생성 (그림일기용)
 */
export async function generateDiarySummary(conversationHistory: GeminiMessage[]): Promise<string | null> {
  const summaryPrompt = `다음 대화 내용을 바탕으로 그날의 일기를 작성해주세요.

## 일기 작성 가이드
- 1인칭 시점으로 작성 ("오늘은...", "그날 나는...")
- 대화에서 언급된 구체적인 내용 포함 (장소, 사람, 활동, 감정)
- 3-5문장 정도의 짧은 일기 형태
- 따뜻하고 감성적인 어투
- 그날 무엇을 했는지, 어떤 기분이었는지 자연스럽게 서술
- 과거 시제로 작성

## 예시 형식
"그날 [장소]에서 [활동]을 했다. [함께한 사람]과 함께... [감정/느낌]..."

## 대화 내용:
${conversationHistory.map(m => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`).join('\n')}

위 대화 내용을 바탕으로 일기를 작성해주세요:`;

  return generateText(summaryPrompt);
}

/**
 * 그림일기 이미지 프롬프트 생성 (색연필 스케치 스타일 고정)
 */
export async function generateDiaryImagePrompt(
  photoContext: PhotoData,
  conversationSummary: string,
  style: 'pencil' = 'pencil'
): Promise<string> {
  const coloredPencilStyle = 'colored pencil sketch style, soft hand-drawn lines, gentle shading, warm nostalgic feeling, artistic illustration, like a diary illustration';

  const scene = photoContext.autoTags?.scene || '';
  const mood = photoContext.autoTags?.mood || '';

  return `Create a colored pencil sketch illustration depicting: ${conversationSummary}.
Scene: ${scene}.
Mood: ${mood}.
Style: ${coloredPencilStyle}.
Korean cultural elements if appropriate.
Warm, nostalgic, suitable for reminiscence therapy.
No text or words in the image.
Safe for all ages.`;
}

/**
 * 그림일기 생성 (이미지 + 요약)
 */
export async function generateDiaryContent(
  photoContext: PhotoData,
  conversationHistory: GeminiMessage[],
  style: 'pencil' = 'pencil'
): Promise<{
  summary: string;
  imagePrompt: string;
  image: { imageData: string; mimeType: string } | null;
} | null> {
  // 1. 대화 요약 생성
  const summary = await generateDiarySummary(conversationHistory);
  if (!summary) {
    console.warn('Failed to generate diary summary');
    return null;
  }

  // 2. 이미지 프롬프트 생성
  const imagePrompt = await generateDiaryImagePrompt(photoContext, summary, style);

  // 3. 이미지 생성 시도
  const image = await generateImage(imagePrompt);

  return {
    summary,
    imagePrompt,
    image,
  };
}

export default {
  getGeminiClient,
  hasGeminiApiKey,
  getGeminiConfig,
  generateText,
  generateImage,
  transcribeAudio,
  analyzeVoiceResponse,
  generateInitialQuestion,
  generateReminiscenceResponse,
  generateDiarySummary,
  generateDiaryImagePrompt,
  generateDiaryContent,
};
