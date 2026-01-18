/**
 * 이미지 생성 API 래퍼 (그림일기용)
 *
 * 지원 API:
 * - Google Imagen 3 (기본)
 */

import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';
import { hasGeminiApiKey, generateImage as geminiGenerateImage } from './gemini';

// 이미지 스타일 - 색연필 스케치로 고정
export type DiaryImageStyle = 'pencil';

// 기본 스타일 (색연필 스케치)
export const DEFAULT_DIARY_STYLE: DiaryImageStyle = 'pencil';

// 이미지 생성 설정
export interface DiaryImageConfig {
  style: DiaryImageStyle;
  prompt: string;
  sourcePhotoUrl?: string; // img2img용
  width?: number;
  height?: number;
}

// 이미지 생성 결과
export interface GeneratedImage {
  url: string;
  prompt: string;
  style: DiaryImageStyle;
  isPlaceholder: boolean;
}

// 색연필 스케치 스타일 프롬프트
const COLORED_PENCIL_STYLE = 'colored pencil sketch style, soft hand-drawn lines, gentle shading, warm nostalgic feeling, artistic illustration, like a diary illustration';

// 스타일별 프롬프트 수정자 (색연필 스케치만 유지)
const styleModifiers: Record<DiaryImageStyle, string> = {
  pencil: COLORED_PENCIL_STYLE,
};

// 스타일별 UI 표시 정보 (색연필 스케치만 유지)
export const imageStyleInfo: Record<DiaryImageStyle, { label: string; icon: string; description: string }> = {
  pencil: {
    label: '색연필 스케치',
    icon: '✏️',
    description: '따뜻한 색연필 스케치 스타일',
  },
};

/**
 * 카테고리별 플레이스홀더 이미지 URL
 * TODO: [IMAGE_API] 실제 이미지 생성 연동 시 제거
 */
function getPlaceholderImage(category: PhotoCategory, style: DiaryImageStyle): string {
  // Picsum Photos를 사용한 플레이스홀더
  const seed = `diary-${category}-${style}`;
  return `https://picsum.photos/seed/${seed}/600/600`;
}

/**
 * 그림일기 이미지 프롬프트 생성
 */
export function buildDiaryPrompt(
  conversationSummary: string,
  photoContext: PhotoData,
  style: DiaryImageStyle
): string {
  const category = photoContext.category || 'daily';
  const scene = photoContext.autoTags?.scene || '';
  const mood = photoContext.autoTags?.mood || '';
  const styleModifier = styleModifiers[style];

  // 카테고리별 장면 힌트
  const categoryHints: Record<PhotoCategory, string> = {
    family: 'family gathering, warm home atmosphere',
    travel: 'travel destination, scenic view',
    event: 'celebration, festive moment',
    nature: 'natural landscape, peaceful scenery',
    daily: 'everyday life, cozy moment',
    friends: 'friends together, joyful gathering',
  };

  const sceneHint = categoryHints[category] || '';

  // 프롬프트 구성
  const prompt = [
    `Create a ${style} style illustration depicting:`,
    conversationSummary,
    `Scene: ${scene || sceneHint}`,
    mood && `Mood: ${mood}`,
    styleModifier,
    'Korean cultural elements if appropriate',
    'Warm, nostalgic, suitable for reminiscence therapy',
    'No text or words in the image',
    'Safe for all ages',
  ].filter(Boolean).join('. ');

  return prompt;
}

/**
 * 그림일기 이미지 생성 (Imagen 3)
 */
export async function generateDiaryImage(
  config: DiaryImageConfig,
  photoContext: PhotoData
): Promise<GeneratedImage> {
  const category = photoContext.category || 'daily';

  // Imagen 3 이미지 생성 시도
  if (hasGeminiApiKey()) {
    try {
      console.log('Attempting Imagen 3 image generation...');
      const result = await geminiGenerateImage(config.prompt);
      if (result) {
        // Base64 이미지를 data URL로 변환
        const dataUrl = `data:${result.mimeType};base64,${result.imageData}`;
        return {
          url: dataUrl,
          prompt: config.prompt,
          style: config.style,
          isPlaceholder: false,
        };
      }
    } catch (error) {
      console.error('Imagen 3 image generation failed:', error);
    }
  }

  // 플레이스홀더 반환
  console.log('Using placeholder image - Imagen 3 not available');

  return {
    url: getPlaceholderImage(category, config.style),
    prompt: config.prompt,
    style: config.style,
    isPlaceholder: true,
  };
}

/**
 * 원본 사진에 아트 스타일 필터 적용
 * TODO: [IMAGE_API] img2img 스타일 변환 구현
 */
export async function applyArtStyleToPhoto(
  sourcePhotoUrl: string,
  style: DiaryImageStyle,
  photoContext: PhotoData
): Promise<GeneratedImage> {
  const category = photoContext.category || 'daily';

  // TODO: [IMAGE_API] img2img 스타일 변환 구현
  // 현재는 플레이스홀더 반환

  console.log('img2img style transfer not implemented - using placeholder');

  return {
    url: getPlaceholderImage(category, style),
    prompt: `Style transfer: ${style}`,
    style,
    isPlaceholder: true,
  };
}

/**
 * 이미지 생성 가능 여부 확인
 */
export function isImageGenerationAvailable(): boolean {
  return hasGeminiApiKey();
}

/**
 * 사용 가능한 이미지 생성 서비스 목록
 */
export function getAvailableImageServices(): Array<{ name: string; available: boolean; priority: number }> {
  return [
    {
      name: 'Imagen 3',
      available: hasGeminiApiKey(),
      priority: 1,
    },
    {
      name: 'Placeholder',
      available: true, // 항상 사용 가능
      priority: 99,
    },
  ].sort((a, b) => a.priority - b.priority);
}

/**
 * 현재 활성화된 이미지 생성 서비스 가져오기
 */
export function getActiveImageService(): string {
  if (hasGeminiApiKey()) return 'Imagen 3';
  return 'Placeholder';
}

export default {
  imageStyleInfo,
  buildDiaryPrompt,
  generateDiaryImage,
  applyArtStyleToPhoto,
  isImageGenerationAvailable,
  getAvailableImageServices,
  getActiveImageService,
};
