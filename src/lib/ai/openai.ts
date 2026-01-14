import OpenAI from 'openai';

// OpenAI 클라이언트 (서버 사이드 전용)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-4o-mini로 텍스트 생성
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  options?: { maxTokens?: number; temperature?: number }
) {
  const response = await openai.chat.completions.create({
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
  const response = await openai.chat.completions.create({
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
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

// Whisper로 음성 인식
export async function transcribeAudio(audioFile: File): Promise<string> {
  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ko',
  });

  return response.text;
}

export default openai;
