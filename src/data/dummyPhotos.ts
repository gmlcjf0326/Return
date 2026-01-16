/**
 * 더미 사진 데이터 (월별 10개 이상 - 총 360개+)
 * TODO: [REAL_DATA] 추후 실제 사진 업로드 데이터로 교체
 *
 * Lorem Picsum 사용: https://picsum.photos/seed/{unique-id}/{width}/{height}
 * - 풍경, 인물, 가족 등 다양한 이미지 지원
 * - seed 파라미터로 고유 이미지 보장
 */

import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';

// 월별 테마
const monthlyThemes: Record<number, { theme: string; activities: string[] }> = {
  1: { theme: '새해', activities: ['새해인사', '덕담', '해돋이', '떡국', '세뱃돈'] },
  2: { theme: '설날', activities: ['설날', '세배', '정월대보름', '윷놀이', '연날리기'] },
  3: { theme: '봄', activities: ['개학', '졸업식', '봄나들이', '새싹', '봄꽃'] },
  4: { theme: '벚꽃', activities: ['벚꽃놀이', '식목일', '청명', '봄소풍', '화전놀이'] },
  5: { theme: '가정의달', activities: ['어린이날', '어버이날', '스승의날', '가족여행', '카네이션'] },
  6: { theme: '초여름', activities: ['현충일', '단오', '모내기', '텃밭', '장마'] },
  7: { theme: '여름', activities: ['해수욕', '물놀이', '휴가', '피서', '여름밤'] },
  8: { theme: '한여름', activities: ['광복절', '여름휴가', '수박', '냉면', '계곡'] },
  9: { theme: '추석', activities: ['추석', '송편', '성묘', '보름달', '가을하늘'] },
  10: { theme: '가을', activities: ['단풍', '한글날', '가을소풍', '운동회', '감수확'] },
  11: { theme: '늦가을', activities: ['김장', '낙엽', '난로', '귤', '가을산행'] },
  12: { theme: '겨울', activities: ['크리스마스', '연말', '눈사람', '송년회', '연말정산'] },
};

// 카테고리별 장소
const categoryScenes: Record<PhotoCategory, string[]> = {
  family: ['거실', '식당', '방', '마당', '부엌'],
  travel: ['해변', '산', '공원', '절', '호수'],
  event: ['행사장', '식당', '강당', '교회', '절'],
  nature: ['공원', '산', '바다', '계곡', '정원'],
  daily: ['집', '동네', '시장', '마당', '텃밭'],
  friends: ['카페', '식당', '공원', '집', '동창회장'],
};

// 카테고리별 분위기
const categoryMoods: Record<PhotoCategory, string[]> = {
  family: ['따뜻한', '행복한', '정다운', '포근한', '화목한'],
  travel: ['설레는', '편안한', '신나는', '평화로운', '자유로운'],
  event: ['축하하는', '즐거운', '기쁜', '흥겨운', '감격스러운'],
  nature: ['평화로운', '상쾌한', '고요한', '아름다운', '맑은'],
  daily: ['평온한', '소소한', '일상적인', '편안한', '만족스러운'],
  friends: ['반가운', '즐거운', '웃음가득', '정겨운', '추억의'],
};

// 카테고리별 seed prefix (이미지 구분용)
const categorySeedPrefix: Record<PhotoCategory, string> = {
  family: 'fam',
  travel: 'trv',
  event: 'evt',
  nature: 'nat',
  daily: 'day',
  friends: 'frd',
};

// 사진 데이터 생성 함수
function createPhoto(
  year: number,
  month: number,
  index: number,
  activity: string,
  category: PhotoCategory
): PhotoData {
  const day = Math.min(index * 3 + 1, 28); // 1~28일 사이
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const scene = categoryScenes[category][index % categoryScenes[category].length];
  const mood = categoryMoods[category][index % categoryMoods[category].length];
  const peopleCount = category === 'nature' ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 8) + 1;

  // 고유한 이미지를 위한 시드 값 (Lorem Picsum용)
  const seedPrefix = categorySeedPrefix[category];
  const seed = `${seedPrefix}-${year}-${month}-${index}`;

  return {
    id: `dummy-${year}-${String(month).padStart(2, '0')}-${String(index).padStart(2, '0')}`,
    fileName: `${activity}_${year}.jpg`,
    fileUrl: `https://picsum.photos/seed/${seed}/400/400`,
    uploadedAt: `${date}T${String(10 + index).padStart(2, '0')}:00:00Z`,
    takenDate: date,
    category,
    isAnalyzed: true,
    isDummy: true,
    autoTags: {
      scene,
      peopleCount,
      estimatedEra: `${year}년`,
      mood,
      description: `${year}년 ${month}월, ${monthlyThemes[month].theme} - ${activity}`,
    },
  };
}

// 더미 사진 생성 (2020-2024년, 월별 10개씩)
export const dummyPhotos: PhotoData[] = [];

// 카테고리 배분 (월별 테마에 맞게)
const monthCategories: Record<number, PhotoCategory[]> = {
  1: ['family', 'family', 'event', 'daily', 'daily', 'family', 'friends', 'daily', 'family', 'nature'],
  2: ['family', 'family', 'event', 'daily', 'event', 'family', 'friends', 'daily', 'family', 'nature'],
  3: ['nature', 'event', 'nature', 'daily', 'travel', 'family', 'friends', 'nature', 'daily', 'travel'],
  4: ['nature', 'nature', 'travel', 'daily', 'travel', 'family', 'friends', 'nature', 'event', 'travel'],
  5: ['family', 'family', 'event', 'travel', 'event', 'family', 'friends', 'family', 'daily', 'nature'],
  6: ['nature', 'event', 'daily', 'daily', 'nature', 'family', 'friends', 'daily', 'travel', 'nature'],
  7: ['travel', 'travel', 'travel', 'daily', 'travel', 'family', 'friends', 'nature', 'travel', 'daily'],
  8: ['travel', 'event', 'travel', 'daily', 'travel', 'family', 'friends', 'nature', 'travel', 'daily'],
  9: ['family', 'family', 'event', 'daily', 'family', 'family', 'friends', 'nature', 'event', 'travel'],
  10: ['nature', 'event', 'travel', 'event', 'nature', 'family', 'friends', 'nature', 'daily', 'travel'],
  11: ['daily', 'nature', 'daily', 'daily', 'nature', 'family', 'friends', 'daily', 'family', 'nature'],
  12: ['event', 'event', 'family', 'daily', 'event', 'family', 'friends', 'daily', 'event', 'family'],
};

// 2024년 - 최근 (월별 10개)
for (let month = 1; month <= 12; month++) {
  const activities = monthlyThemes[month].activities;
  const categories = monthCategories[month];
  for (let i = 0; i < 10; i++) {
    const activity = activities[i % activities.length];
    const category = categories[i];
    dummyPhotos.push(createPhoto(2024, month, i, activity, category));
  }
}

// 2023년 (월별 10개)
for (let month = 1; month <= 12; month++) {
  const activities = monthlyThemes[month].activities;
  const categories = monthCategories[month];
  for (let i = 0; i < 10; i++) {
    const activity = activities[i % activities.length];
    const category = categories[i];
    dummyPhotos.push(createPhoto(2023, month, i, activity, category));
  }
}

// 2022년 (월별 5개 - 축소)
for (let month = 1; month <= 12; month++) {
  const activities = monthlyThemes[month].activities;
  const categories = monthCategories[month];
  for (let i = 0; i < 5; i++) {
    const activity = activities[i % activities.length];
    const category = categories[i];
    dummyPhotos.push(createPhoto(2022, month, i, activity, category));
  }
}

// 2021년 (월별 3개 - 축소)
for (let month = 1; month <= 12; month++) {
  const activities = monthlyThemes[month].activities;
  const categories = monthCategories[month];
  for (let i = 0; i < 3; i++) {
    const activity = activities[i % activities.length];
    const category = categories[i];
    dummyPhotos.push(createPhoto(2021, month, i, activity, category));
  }
}

// 2020년 (월별 2개 - 최소)
for (let month = 1; month <= 12; month++) {
  const activities = monthlyThemes[month].activities;
  const categories = monthCategories[month];
  for (let i = 0; i < 2; i++) {
    const activity = activities[i % activities.length];
    const category = categories[i];
    dummyPhotos.push(createPhoto(2020, month, i, activity, category));
  }
}

// 날짜 내림차순 정렬
dummyPhotos.sort((a, b) => {
  const dateA = new Date(a.takenDate || a.uploadedAt);
  const dateB = new Date(b.takenDate || b.uploadedAt);
  return dateB.getTime() - dateA.getTime();
});

// 년도별로 그룹핑된 사진 가져오기
export function getDummyPhotosByYear(): Map<number, PhotoData[]> {
  const photosByYear = new Map<number, PhotoData[]>();

  dummyPhotos.forEach(photo => {
    if (photo.takenDate) {
      const year = new Date(photo.takenDate).getFullYear();
      const existing = photosByYear.get(year) || [];
      existing.push(photo);
      photosByYear.set(year, existing);
    }
  });

  // 년도 내림차순 정렬
  return new Map([...photosByYear.entries()].sort((a, b) => b[0] - a[0]));
}

// 월별로 그룹핑된 사진 가져오기
export function getDummyPhotosByMonth(): Map<string, PhotoData[]> {
  const photosByMonth = new Map<string, PhotoData[]>();

  dummyPhotos.forEach(photo => {
    if (photo.takenDate) {
      const date = new Date(photo.takenDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = photosByMonth.get(key) || [];
      existing.push(photo);
      photosByMonth.set(key, existing);
    }
  });

  // 년월 내림차순 정렬
  return new Map([...photosByMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

// 특정 년월의 사진 가져오기
export function getDummyPhotosForYearMonth(year: number, month: number): PhotoData[] {
  return dummyPhotos.filter(photo => {
    if (!photo.takenDate) return false;
    const date = new Date(photo.takenDate);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

// 카테고리별로 필터링된 사진 가져오기
export function getDummyPhotosByCategory(category: string): PhotoData[] {
  return dummyPhotos.filter(photo => photo.category === category);
}

// 통계 정보 가져오기
export function getDummyPhotosStats(): {
  total: number;
  byYear: Record<number, number>;
  byMonth: Record<string, number>;
  byCategory: Record<PhotoCategory, number>;
} {
  const byYear: Record<number, number> = {};
  const byMonth: Record<string, number> = {};
  const byCategory: Record<PhotoCategory, number> = {
    family: 0,
    travel: 0,
    event: 0,
    nature: 0,
    daily: 0,
    friends: 0,
  };

  dummyPhotos.forEach(photo => {
    // 년도별
    if (photo.takenDate) {
      const date = new Date(photo.takenDate);
      const year = date.getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;

      // 월별
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    }

    // 카테고리별
    if (photo.category) {
      byCategory[photo.category] = (byCategory[photo.category] || 0) + 1;
    }
  });

  return {
    total: dummyPhotos.length,
    byYear,
    byMonth,
    byCategory,
  };
}

export default dummyPhotos;
