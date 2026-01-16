/**
 * 사진 카테고리 정의
 * TODO: [REAL_DATA] 사용자 커스텀 카테고리 추가 기능 고려
 */

import type { PhotoCategory } from '@/components/photos/PhotoCard';

export interface CategoryInfo {
  id: PhotoCategory;
  label: string;
  icon: string;
  description: string;
  color: string;
}

// 카테고리 목록
export const photoCategories: CategoryInfo[] = [
  {
    id: 'family',
    label: '가족',
    icon: '👨‍👩‍👧‍👦',
    description: '가족 모임, 명절, 가족 행사',
    color: '#F59E0B', // amber
  },
  {
    id: 'travel',
    label: '여행',
    icon: '✈️',
    description: '여행, 나들이, 휴가',
    color: '#3B82F6', // blue
  },
  {
    id: 'event',
    label: '행사',
    icon: '🎉',
    description: '생일, 결혼식, 졸업, 기념일',
    color: '#EC4899', // pink
  },
  {
    id: 'nature',
    label: '자연',
    icon: '🌳',
    description: '풍경, 자연, 계절',
    color: '#10B981', // emerald
  },
  {
    id: 'daily',
    label: '일상',
    icon: '📷',
    description: '일상 생활, 취미, 일과',
    color: '#8B5CF6', // violet
  },
  {
    id: 'friends',
    label: '친구',
    icon: '👥',
    description: '친구와의 추억, 모임',
    color: '#06B6D4', // cyan
  },
];

// 카테고리 ID로 정보 가져오기
export function getCategoryInfo(categoryId: PhotoCategory): CategoryInfo | undefined {
  return photoCategories.find(c => c.id === categoryId);
}

// 카테고리 라벨 가져오기
export function getCategoryLabel(categoryId: PhotoCategory): string {
  return getCategoryInfo(categoryId)?.label ?? categoryId;
}

// 카테고리 아이콘 가져오기
export function getCategoryIcon(categoryId: PhotoCategory): string {
  return getCategoryInfo(categoryId)?.icon ?? '📷';
}

// 카테고리 색상 가져오기
export function getCategoryColor(categoryId: PhotoCategory): string {
  return getCategoryInfo(categoryId)?.color ?? '#6B7280';
}

export default photoCategories;
