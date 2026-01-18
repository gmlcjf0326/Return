import OpenAI from 'openai';

// OpenAI 클라이언트 (서버 사이드 전용)
// API 키가 없으면 null을 반환 (빌드 시 에러 방지)
let openaiClient: OpenAI | null = null;
let openaiInitialized = false;

function getOpenAIClient(): OpenAI | null {
  if (!openaiInitialized) {
    openaiInitialized = true;
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        'OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. ' +
        'OpenAI 관련 기능(Vision, Whisper 등)이 비활성화됩니다.'
      );
      return null;
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export const openai = {
  get client(): OpenAI | null {
    return getOpenAIClient();
  },
  get isAvailable(): boolean {
    return getOpenAIClient() !== null;
  }
};

// GPT-4o-mini로 텍스트 생성
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

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
): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

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
export async function createEmbedding(text: string): Promise<number[] | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

// Whisper로 음성 인식
export async function transcribeAudio(audioFile: File): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  const response = await client.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ko',
  });

  return response.text;
}

export { getOpenAIClient };
export default openai;
