/**
 * 자세 관련 상수 및 타입 정의
 * TensorFlow 모델과 분리하여 모델 로딩 없이 사용 가능
 */

// 자세 타입
export type PostureType =
  | 'upright'     // 바른 자세
  | 'leaning_left'  // 왼쪽으로 기울어짐
  | 'leaning_right' // 오른쪽으로 기울어짐
  | 'slouching'   // 구부정한 자세
  | 'unknown';    // 감지 불가

// 자세 이름 한글화
export const postureLabels: Record<PostureType, string> = {
  upright: '바른 자세',
  leaning_left: '왼쪽 기울임',
  leaning_right: '오른쪽 기울임',
  slouching: '구부정함',
  unknown: '감지 불가',
};

// 자세 아이콘
export const postureIcons: Record<PostureType, string> = {
  upright: '🧘',
  leaning_left: '↖️',
  leaning_right: '↗️',
  slouching: '🪑',
  unknown: '❓',
};

// 자세 색상
export const postureColors: Record<PostureType, string> = {
  upright: '#10B981',
  leaning_left: '#F59E0B',
  leaning_right: '#F59E0B',
  slouching: '#EF4444',
  unknown: '#6B7280',
};
