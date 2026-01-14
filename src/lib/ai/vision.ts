import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PhotoAnalysisResult {
  scene: string;
  peopleCount: number;
  estimatedEra: string;
  locationType: string;
  mood: string;
  objects: string[];
  description: string;
}

/**
 * GPT-4 Vision을 사용하여 사진을 분석합니다.
 */
export async function analyzePhoto(
  imageUrl: string,
  isBase64: boolean = false
): Promise<PhotoAnalysisResult> {
  const imageContent = isBase64
    ? { type: 'image_url' as const, image_url: { url: imageUrl } }
    : { type: 'image_url' as const, image_url: { url: imageUrl } };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 사진을 분석하여 회상치료에 활용할 수 있는 정보를 추출하는 전문가입니다.
사진을 보고 다음 정보를 JSON 형식으로 제공해주세요:

- scene: 장면 분류 (가족모임, 여행, 일상, 명절, 졸업식, 결혼식, 야외활동, 기타)
- peopleCount: 사진에 보이는 인원 수 (숫자)
- estimatedEra: 사진이 촬영된 것으로 추정되는 시대 (예: "1980년대", "2000년대 초반")
- locationType: 장소 유형 (실내, 실외, 해변, 산, 도시, 시골, 학교, 직장 등)
- mood: 사진의 전체적인 분위기 (행복한, 진지한, 평화로운, 축제분위기, 일상적인 등)
- objects: 사진에서 식별되는 주요 물체 (배열, 최대 5개)
- description: 사진에 대한 간단한 설명 (한국어, 2-3문장)

반드시 유효한 JSON만 출력하세요.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '이 사진을 분석해주세요.',
          },
          imageContent,
        ],
      },
    ],
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from GPT Vision');
  }

  try {
    const result = JSON.parse(content) as PhotoAnalysisResult;
    return {
      scene: result.scene || '기타',
      peopleCount: result.peopleCount || 0,
      estimatedEra: result.estimatedEra || '알 수 없음',
      locationType: result.locationType || '알 수 없음',
      mood: result.mood || '일상적인',
      objects: result.objects || [],
      description: result.description || '분석을 완료했습니다.',
    };
  } catch (error) {
    console.error('Failed to parse GPT Vision response:', content);
    throw new Error('Failed to parse analysis result');
  }
}

/**
 * 사진 분석 결과를 기반으로 회상치료 질문을 생성합니다.
 */
export async function generateReminiscenceQuestions(
  analysis: PhotoAnalysisResult,
  userContext?: {
    birthYear?: number;
    previousResponses?: string[];
  }
): Promise<string[]> {
  const contextInfo = userContext?.birthYear
    ? `사용자는 ${userContext.birthYear}년생입니다.`
    : '';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 치매 환자를 위한 회상치료 전문가입니다.
사진 분석 결과를 바탕으로 환자의 기억을 자극하고 대화를 이끌어낼 수 있는 질문을 생성합니다.

질문 작성 원칙:
1. 간단하고 명확한 언어 사용
2. 긍정적이고 따뜻한 톤 유지
3. 과거의 좋은 기억을 떠올리게 하는 질문
4. 오감(시각, 청각, 후각, 미각, 촉각)을 자극하는 질문
5. 개방형 질문과 예/아니오 질문을 혼합

JSON 배열 형식으로 5개의 질문을 생성해주세요.`,
      },
      {
        role: 'user',
        content: `사진 분석 결과:
- 장면: ${analysis.scene}
- 인원: ${analysis.peopleCount}명
- 시대: ${analysis.estimatedEra}
- 장소: ${analysis.locationType}
- 분위기: ${analysis.mood}
- 물체: ${analysis.objects.join(', ')}
- 설명: ${analysis.description}

${contextInfo}

이 사진을 보며 대화할 수 있는 회상치료 질문 5개를 JSON 배열로 생성해주세요.`,
      },
    ],
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from GPT');
  }

  try {
    const result = JSON.parse(content);
    return result.questions || result || [];
  } catch (error) {
    console.error('Failed to parse questions:', content);
    return [
      '이 사진에서 무엇이 보이시나요?',
      '이 장면을 보니 어떤 기분이 드시나요?',
      '비슷한 경험을 해보신 적이 있으신가요?',
      '이때 누구와 함께 계셨나요?',
      '이 사진에서 가장 기억에 남는 것은 무엇인가요?',
    ];
  }
}
