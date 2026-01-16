/**
 * 유틸리티 함수 모음
 * 공통으로 사용되는 헬퍼 함수들
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 클래스명 병합 유틸리티
 * clsx + tailwind-merge 조합으로 Tailwind 클래스 충돌 해결
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
