import OpenAI from 'openai';

// OpenAI 클라이언트 (서버 사이드 전용)
// API 키가 없으면 null을 반환 (빌드 시 에러 방지)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export const openai = {
  get client(): OpenAI {
    return getOpenAIClient();
  }
};

// GPT-4o-mini로 텍스트 생성
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  options?: { maxTokens?: number; temperature?: number }
) {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt },
    ],
    max_tokens: options?.maxTokens ?? 1000,
    temperature: options?.temperature ?? 0.7,
  });

  return response.choices[0]?.message?.content ?? '';
}

// GPT-4 Vision으로 이미지 분석
export async function analyzeImage(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? '';
}

// 텍스트 임베딩 생성
export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

// Whisper로 음성 인식
export async function transcribeAudio(audioFile: File): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ko',
  });

  return response.text;
}

export { getOpenAIClient };
export default openai;
