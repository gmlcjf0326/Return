/**
 * 감정 관련 상수 및 타입 정의
 * TensorFlow 모델과 분리하여 모델 로딩 없이 사용 가능
 */

// 감정 타입
export type EmotionType =
  | 'neutral'    // 중립/집중
  | 'happy'      // 행복/만족
  | 'confused'   // 혼란/당황
  | 'anxious'    // 불안/긴장
  | 'sad'        // 슬픔
  | 'surprised'  // 놀람
  | 'angry';     // 화남

// 감정 이름 한글화
export const emotionLabels: Record<EmotionType, string> = {
  neutral: '집중',
  happy: '만족',
  confused: '혼란',
  anxious: '불안',
  sad: '슬픔',
  surprised: '놀람',
  angry: '화남',
};

// 감정 아이콘
export const emotionIcons: Record<EmotionType, string> = {
  neutral: '😐',
  happy: '😊',
  confused: '😕',
  anxious: '😰',
  sad: '😢',
  surprised: '😮',
  angry: '😠',
};

// 감정 색상
export const emotionColors: Record<EmotionType, string> = {
  neutral: '#6B7280',
  happy: '#10B981',
  confused: '#F59E0B',
  anxious: '#EF4444',
  sad: '#3B82F6',
  surprised: '#8B5CF6',
  angry: '#DC2626',
};
