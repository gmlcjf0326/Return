/**
 * 사진 관련 유틸리티 함수
 */

import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';

// 년도별 그룹핑된 사진 타입
export interface YearGroup {
  year: number;
  months: MonthGroup[];
  totalPhotos: number;
}

// 월별 그룹핑된 사진 타입
export interface MonthGroup {
  month: number;
  monthName: string;
  photos: PhotoData[];
}

// 카테고리별 그룹핑된 사진 타입
export interface CategoryGroup {
  category: PhotoCategory;
  photos: PhotoData[];
}

// 월 이름 (한글)
const monthNames = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

/**
 * 월 번호를 한글 월 이름으로 변환
 */
export function getMonthName(month: number): string {
  if (month < 1 || month > 12) return `${month}월`;
  return monthNames[month - 1];
}

/**
 * 사진을 년도별/월별로 그룹핑
 * @param photos 사진 배열
 * @returns 년도별로 그룹핑된 배열 (내림차순)
 */
export function groupPhotosByDate(photos: PhotoData[]): YearGroup[] {
  const yearMap = new Map<number, Map<number, PhotoData[]>>();

  // 사진을 년도/월별로 분류
  photos.forEach(photo => {
    const dateStr = photo.takenDate || photo.uploadedAt;
    if (!dateStr) return;

    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed → 1-indexed

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }

    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }

    monthMap.get(month)!.push(photo);
  });

  // Map을 배열로 변환 및 정렬
  const result: YearGroup[] = [];

  // 년도 내림차순 정렬
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);

  sortedYears.forEach(year => {
    const monthMap = yearMap.get(year)!;
    const months: MonthGroup[] = [];

    // 월 내림차순 정렬
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);

    sortedMonths.forEach(month => {
      const monthPhotos = monthMap.get(month)!;
      // 사진은 날짜 내림차순 정렬
      monthPhotos.sort((a, b) => {
        const dateA = new Date(a.takenDate || a.uploadedAt);
        const dateB = new Date(b.takenDate || b.uploadedAt);
        return dateB.getTime() - dateA.getTime();
      });

      months.push({
        month,
        monthName: getMonthName(month),
        photos: monthPhotos,
      });
    });

    const totalPhotos = months.reduce((sum, m) => sum + m.photos.length, 0);

    result.push({
      year,
      months,
      totalPhotos,
    });
  });

  return result;
}

/**
 * 사진을 카테고리별로 그룹핑
 * @param photos 사진 배열
 * @returns 카테고리별로 그룹핑된 배열
 */
export function groupPhotosByCategory(photos: PhotoData[]): CategoryGroup[] {
  const categoryMap = new Map<PhotoCategory, PhotoData[]>();

  photos.forEach(photo => {
    const category = photo.category || 'daily';

    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }

    categoryMap.get(category)!.push(photo);
  });

  const result: CategoryGroup[] = [];

  categoryMap.forEach((photos, category) => {
    result.push({ category, photos });
  });

  return result;
}

/**
 * 카테고리로 사진 필터링
 * @param photos 사진 배열
 * @param category 카테고리 (null이면 전체)
 * @returns 필터링된 사진 배열
 */
export function filterPhotosByCategory(
  photos: PhotoData[],
  category: PhotoCategory | null
): PhotoData[] {
  if (!category) return photos;
  return photos.filter(photo => photo.category === category);
}

/**
 * 같은 날짜의 다른 사진 찾기
 * @param photos 전체 사진 배열
 * @param currentPhoto 현재 사진
 * @returns 같은 날짜의 다른 사진들
 */
export function findSameDatePhotos(
  photos: PhotoData[],
  currentPhoto: PhotoData
): PhotoData[] {
  const currentDate = currentPhoto.takenDate || currentPhoto.uploadedAt;
  if (!currentDate) return [];

  const targetDate = new Date(currentDate).toDateString();

  return photos.filter(photo => {
    if (photo.id === currentPhoto.id) return false;
    const photoDate = photo.takenDate || photo.uploadedAt;
    if (!photoDate) return false;
    return new Date(photoDate).toDateString() === targetDate;
  });
}

/**
 * 같은 카테고리의 관련 사진 찾기
 * @param photos 전체 사진 배열
 * @param currentPhoto 현재 사진
 * @param limit 최대 개수
 * @returns 같은 카테고리의 다른 사진들
 */
export function findRelatedPhotos(
  photos: PhotoData[],
  currentPhoto: PhotoData,
  limit = 5
): PhotoData[] {
  const category = currentPhoto.category;
  if (!category) return [];

  return photos
    .filter(photo => photo.id !== currentPhoto.id && photo.category === category)
    .slice(0, limit);
}

/**
 * 날짜를 사용자 친화적 형식으로 포맷팅
 * @param dateStr ISO 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export function formatPhotoDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 사진 수에 따른 그리드 열 수 결정
 * @param photoCount 사진 수
 * @returns 권장 열 수
 */
export function getGridColumns(photoCount: number): number {
  if (photoCount <= 2) return photoCount;
  if (photoCount <= 6) return 3;
  return 4;
}

export default {
  groupPhotosByDate,
  groupPhotosByCategory,
  filterPhotosByCategory,
  findSameDatePhotos,
  findRelatedPhotos,
  formatPhotoDate,
  getMonthName,
  getGridColumns,
};
