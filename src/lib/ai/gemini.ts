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
  return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
}

/**
 * 이미지 모델 이름 가져오기 (Gemini 2.5 Flash Image - 이미지 생성 전용)
 */
export function getImageModel(): string {
  return 'gemini-2.5-flash-image';
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
 * 이미지 생성 (Gemini 2.0 Flash - 네이티브 이미지 생성)
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
    console.log(`Generating image with ${model}...`);

    // Gemini 2.0 Flash 이미지 생성 요청
    // 한글 프롬프트를 영어로 보강하고 이미지 생성 요청 (수채화 스타일)
    const imagePrompt = `Create a warm, nostalgic illustration.
Style: Soft watercolor painting with gentle brush strokes, warm pastel colors, dreamy atmosphere, hand-painted diary illustration feel.
Scene: ${prompt}
Important: Make it look like a hand-painted diary illustration, emotional and heartwarming.
Do NOT include any text or words in the image.
Safe for all ages.

Generate a single beautiful watercolor-style illustration.`;

    const response = await client.models.generateContent({
      model,
      contents: imagePrompt,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    // 응답에서 이미지 추출
    const candidates = response.candidates || [];
    if (candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      for (const part of parts) {
        // inlineData 타입 체크 (이미지 데이터)
        if (part && typeof part === 'object' && 'inlineData' in part) {
          const inlineData = (part as { inlineData: { data: string; mimeType: string } }).inlineData;
          if (inlineData?.data && inlineData?.mimeType) {
            console.log('Image generated successfully');
            return {
              imageData: inlineData.data,
              mimeType: inlineData.mimeType,
            };
          }
        }
      }
    }

    console.warn('No image found in response');
    return null;
  } catch (error) {
    console.error('Gemini 2.5 Flash Image generation failed:', error);
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

  // 짧은 긍정 응답 감지
  const isShortPositive = /^(네|응|예|어|맞아요?|그래요?|그랬어요?|기억나요?|그래|맞아)$/.test(userMessage.trim());

  // 사진 태그 정보 요약 (AI에게 다시 상기)
  const autoTags = photoContext.autoTags;
  const photoReminder = autoTags ? `
[참고: 사진 정보 - 장면: ${autoTags.scene || '알 수 없음'}, 분위기: ${autoTags.mood || '알 수 없음'}, 장소: ${autoTags.locationType || '알 수 없음'}${autoTags.objects?.length ? `, 물체: ${autoTags.objects.join(', ')}` : ''}]` : '';

  const contextInstruction = isShortPositive
    ? `\n\n★중요★ 사용자가 짧은 긍정 응답("${userMessage}")을 했습니다. 이전 대화 맥락을 이어서 더 구체적으로 물어보세요. 사진과 무관한 새로운 주제로 넘어가지 마세요.`
    : '';

  const fullPrompt = `${historyText ? `이전 대화:\n${historyText}\n\n` : ''}사용자: ${userMessage}
${photoReminder}${contextInstruction}

위 대화에 이어서 따뜻하게 응답해주세요.
- 반드시 사진 정보(장면, 분위기, 장소, 물체 등)를 참조하여 질문하세요
- 사진과 무관한 일반적인 질문(TV 프로그램, 라디오 등)은 하지 마세요
- 2-3문장 이내로 짧게 답변하세요`;

  return generateText(fullPrompt, systemPrompt);
}

/**
 * 외부 URL 이미지를 base64로 변환
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    console.log('[fetchImageAsBase64] Fetching URL:', url);

    // follow redirects
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Re:turn/1.0)',
      },
    });

    console.log('[fetchImageAsBase64] Response status:', response.status);

    if (!response.ok) {
      console.error('[fetchImageAsBase64] Response not OK:', response.status, response.statusText);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    console.log('[fetchImageAsBase64] Success! Size:', base64.length, 'chars, type:', contentType);
    return { data: base64, mimeType: contentType };
  } catch (error) {
    console.error('[fetchImageAsBase64] Failed to fetch image:', error);
    return null;
  }
}

/**
 * 이미지를 포함한 회상 대화 응답 생성 (멀티모달)
 * 사용자가 이미지에 대해 질문할 때 실제 이미지를 보고 응답
 */
export async function generateReminiscenceResponseWithImage(
  photoContext: PhotoData,
  conversationHistory: GeminiMessage[],
  userMessage: string,
  userProfile?: UserProfileForChat,
  imageUrl?: string
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;

  const systemPrompt = buildReminiscenceSystemPrompt(photoContext, userProfile);

  // 대화 이력 구성
  const historyText = conversationHistory
    .map(msg => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
    .join('\n');

  // 이미지 분석 요청인지 확인
  const isImageAnalysisRequest = /분석|설명|뭐가|무엇|보이|어떤/.test(userMessage);

  const fullPrompt = isImageAnalysisRequest
    ? `당신은 사진을 보고 따뜻하게 설명해주는 회상치료 도우미입니다.

사용자의 요청: "${userMessage}"

★중요: 첨부된 이미지를 직접 보고 다음을 수행하세요:
1. 이미지에 보이는 것을 구체적으로 설명해주세요 (장소, 사람, 물체, 분위기 등)
2. 따뜻하고 친근한 어투로 설명하세요
3. 2-3문장으로 짧게 답변하세요
4. 기술적 용어(픽셀, 해상도 등)는 사용하지 마세요

이미지를 직접 보고 설명해주세요:`
    : `${systemPrompt}

${historyText ? `이전 대화:\n${historyText}\n\n` : ''}사용자: ${userMessage}

위 대화에 이어서 따뜻하게 응답해주세요.
- 사용자가 이미지에 대해 물어보면 이미지를 직접 보고 구체적으로 설명해주세요
- 기술적인 분석(픽셀, 해상도, 파일형식 등)은 하지 마세요
- 2-3문장 이내로 짧게 답변하세요`;

  try {
    const model = getTextModel();
    console.log('[Gemini] 멀티모달 함수 시작, 모델:', model);

    // 이미지 URL이 있으면 멀티모달로 처리
    if (imageUrl) {
      let imageData: { data: string; mimeType: string } | null = null;
      console.log('[Gemini] 이미지 URL 타입:', imageUrl.startsWith('data:') ? 'base64' : 'external URL');

      if (imageUrl.startsWith('data:')) {
        // Base64 data URL
        const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          imageData = { mimeType: matches[1], data: matches[2] };
        }
      } else {
        // 외부 URL인 경우 fetch하여 base64로 변환
        console.log('[Gemini] 외부 URL 이미지 fetch 시작...');
        imageData = await fetchImageAsBase64(imageUrl);
        console.log('[Gemini] 이미지 fetch 결과:', imageData ? '성공' : '실패');
      }

      if (imageData) {
        console.log('[Gemini] API 호출 시작...');
        const response = await client.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: imageData },
                { text: fullPrompt },
              ],
            },
          ],
        });
        console.log('[Gemini] API 응답 받음');
        return response.text || null;
      } else {
        console.log('[Gemini] 이미지 데이터가 없어서 텍스트 전용으로 전환');
      }
    }

    // 이미지 없으면 텍스트 전용
    return generateText(fullPrompt, systemPrompt);
  } catch (error) {
    console.error('[Gemini] 멀티모달 응답 실패:', error);
    return null;
  }
}

/**
 * 대화 내용 요약 생성 (그림일기용)
 */
export async function generateDiarySummary(conversationHistory: GeminiMessage[]): Promise<string | null> {
  const summaryPrompt = `다음은 어르신과 AI가 옛날 사진을 보며 나눈 대화입니다.
이 대화를 바탕으로 자연스러운 그림일기 문장을 1-2문장으로 작성해주세요.

## 필수 규칙
- "~했다", "~였다" 형식의 일기체로 작성
- 어르신이 말한 구체적인 내용과 감정을 반영
- "에 대한 추억이 있다" 같은 어색한 표현 절대 금지
- 따뜻하고 회상적인 톤 유지
- 과거 시제 사용

## 좋은 예시
- "오늘 면접 보던 시절 사진을 보며 이야기를 나눴다. 그때 기분이 좋지 않았던 기억이 떠올랐다."
- "옛날 가족 여행 사진을 보았다. 함께 웃던 그 시절이 그립다."
- "오늘 학창시절 사진을 보며 추억을 나눴다. 그때가 참 좋았다."

## 나쁜 예시 (절대 사용 금지)
- "면접에 대한 추억이 있다." (어색함)
- "기분이 썩 별로였어에 대한 추억이 있다." (문법 오류)
- "~에 대한 추억이 있다" 패턴 (모두 어색함)

## 대화 내용:
${conversationHistory.map(m => `${m.role === 'user' ? '어르신' : 'AI'}: ${m.content}`).join('\n')}

그림일기 문장:`;

  return generateText(summaryPrompt);
}

/**
 * 그림일기 이미지 프롬프트 생성 (수채화 스타일 기본)
 */
export async function generateDiaryImagePrompt(
  photoContext: PhotoData,
  conversationSummary: string,
  style: 'pencil' | 'watercolor' = 'watercolor'
): Promise<string> {
  const stylePrompts = {
    pencil: 'colored pencil sketch style, soft hand-drawn lines, gentle shading, warm nostalgic feeling, artistic illustration, like a diary illustration',
    watercolor: 'soft watercolor painting style, gentle brush strokes, warm pastel colors, dreamy nostalgic atmosphere, artistic diary illustration, hand-painted feel',
  };

  const scene = photoContext.autoTags?.scene || '';
  const mood = photoContext.autoTags?.mood || '';

  return `Create a ${style === 'watercolor' ? 'watercolor' : 'colored pencil sketch'} illustration depicting: ${conversationSummary}.
Scene: ${scene}.
Mood: ${mood}.
Style: ${stylePrompts[style]}.
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
  style: 'pencil' | 'watercolor' = 'watercolor'
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
  generateReminiscenceResponseWithImage,
  generateDiarySummary,
  generateDiaryImagePrompt,
  generateDiaryContent,
};
