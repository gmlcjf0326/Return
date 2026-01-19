/**
 * 그림일기 생성 API
 * 서버 사이드에서 AI 이미지 생성을 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateDiarySummary as geminiDiarySummary,
  type GeminiMessage,
} from '@/lib/ai/gemini';
import {
  generateDiaryImage,
  buildDiaryPrompt,
  type DiaryImageStyle,
  DEFAULT_DIARY_STYLE,
} from '@/lib/ai/imageGeneration';
import { generateDiarySummary as dummyDiarySummary } from '@/data/dummyLLMResponses';
import type { PhotoData } from '@/components/photos/PhotoCard';

interface DiaryRequestBody {
  photoData: PhotoData;
  messages: Array<{
    role: string;
    content: string;
  }>;
  style?: DiaryImageStyle;
}

export async function POST(request: NextRequest) {
  try {
    const body: DiaryRequestBody = await request.json();
    const { photoData, messages, style = DEFAULT_DIARY_STYLE } = body;

    if (!photoData || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'photoData and messages are required' },
        { status: 400 }
      );
    }

    console.log('[Diary API] Starting diary generation...');
    console.log('[Diary API] Photo:', photoData.id, 'Messages:', messages.length);

    // 1. 대화 요약 생성
    let summary: string;
    try {
      // Message 타입을 GeminiMessage 타입으로 변환
      const geminiHistory: GeminiMessage[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      const geminiSummary = await geminiDiarySummary(geminiHistory);
      if (geminiSummary) {
        summary = geminiSummary;
        console.log('[Diary API] Summary generated via Gemini');
      } else {
        // Fallback to dummy summary
        summary = dummyDiarySummary(messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })));
        console.log('[Diary API] Summary generated via dummy fallback');
      }
    } catch (error) {
      console.error('[Diary API] Summary generation failed:', error);
      // Fallback to dummy summary
      summary = dummyDiarySummary(messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })));
    }

    // 2. 이미지 프롬프트 생성
    const prompt = buildDiaryPrompt(summary, photoData, style);
    console.log('[Diary API] Image prompt built');

    // 3. 이미지 생성 (서버에서 실행 - API 키 접근 가능)
    const image = await generateDiaryImage(
      { style, prompt },
      photoData
    );
    console.log('[Diary API] Image generated, isPlaceholder:', image.isPlaceholder);

    return NextResponse.json({
      success: true,
      summary,
      image,
    });
  } catch (error) {
    console.error('[Diary API] Failed to generate diary:', error);
    return NextResponse.json(
      { error: 'Failed to generate diary' },
      { status: 500 }
    );
  }
}
