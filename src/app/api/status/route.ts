/**
 * API 상태 확인 엔드포인트
 * GET /api/status - 모든 API 연결 상태 확인
 */

import { NextResponse } from 'next/server';
import { hasGeminiApiKey, getGeminiConfig } from '@/lib/ai/gemini';
import { openai } from '@/lib/ai/openai';
import { getAvailableLLMs, getActiveLLM } from '@/lib/ai/llm';
import { getAvailableImageServices, getActiveImageService } from '@/lib/ai/imageGeneration';

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,

    // API 키 상태 (키 값은 보여주지 않음)
    apiKeys: {
      gemini: hasGeminiApiKey(),
      openai: openai.isAvailable,
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      database: !!process.env.DATABASE_URL,
    },

    // Gemini 설정
    gemini: getGeminiConfig(),

    // LLM 상태
    llm: {
      active: getActiveLLM(),
      available: getAvailableLLMs(),
    },

    // 이미지 생성 상태
    imageGeneration: {
      active: getActiveImageService(),
      available: getAvailableImageServices(),
    },

    // 기능 활성화 상태
    features: {
      reminiscenceChat: hasGeminiApiKey() ? 'Gemini AI' : 'Dummy (데모용)',
      photoAnalysis: openai.isAvailable ? 'OpenAI Vision' : 'Disabled',
      voiceRecognition: openai.isAvailable ? 'Whisper' : (hasGeminiApiKey() ? 'Gemini' : 'Disabled'),
      imageGeneration: hasGeminiApiKey() ? 'Imagen 3' : 'Placeholder',
    },
  };

  return NextResponse.json(status);
}
