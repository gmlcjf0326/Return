# Re:turn QA 개선 보고서

> **작성일**: 2026-01-19
> **버전**: 1.0.0
> **작성자**: Claude Opus 4.5

---

## 개요

이 보고서는 Re:turn 프로젝트의 QA 개선 작업 결과를 문서화합니다.
총 **13개 파일**에서 **35개 이상의 개선 항목**이 수정되었습니다.

---

## 1. 점수 기준 변경 (Critical)

### 파일: `src/lib/scoring.ts`

**변경 전:**
```typescript
// 위험도 레벨
export type RiskLevel = 'normal' | 'mild_caution' | 'mci_suspected' | 'consultation_recommended';

// 기준: 85+ → normal, 70-84 → mild_caution, 55-69 → mci_suspected, <55 → consultation_recommended
```

**변경 후:**
```typescript
// 위험도 레벨
export type RiskLevel = 'excellent' | 'mild_caution' | 'caution' | 'severe';

// 기준: 80+ → excellent (우수), 60-79 → mild_caution (경도 주의), 50-59 → caution (주의), <50 → severe (심각)
```

**수정 내용:**
- `riskLevelConfig` 객체의 레벨 명칭 및 점수 범위 변경
- `determineRiskLevel()` 함수 임계값 조정
- 각 레벨의 설명 문구 개선

---

## 2. 사진 초기화 수정 (Critical)

### 파일: `src/store/photoStore.ts`

**변경 전:**
```typescript
clearPhotos: () => set({ photos: [], selectedPhotoId: null }),
```

**변경 후:**
```typescript
clearPhotos: () => set({ photos: [], selectedPhotoId: null, isInitialized: false }),
```

**수정 내용:**
- `clearPhotos()` 호출 시 `isInitialized` 플래그도 함께 리셋
- Zustand persist와 localStorage 동기화 문제 해결

---

## 3. 음성 훈련 단어 수정 (Critical)

### 파일: `src/components/training/VoiceTraining.tsx`

**변경 전:**
```typescript
// 쉼표로 구분된 여러 단어
targetText: '사과, 의자, 시계'
targetText: '바다, 산, 강, 하늘, 꽃'
```

**변경 후:**
```typescript
// 초급: 단일 단어
targetText: '사과'
targetText: '자동차'
targetText: '연필'

// 중급: 연속 문장
targetText: '오늘 날씨가 좋습니다'
targetText: '가족과 함께 산책합니다'
```

**수정 내용:**
- 쉼표 구분 단어 목록 제거
- 초급: 단일 단어 3개 추가
- 중급: 자연스러운 문장으로 변경
- 고급: 자유 발화 유지

---

## 4. 평가 문항 명확화 (Critical)

### 파일: `src/data/assessment-questions.ts`

**문항 1 (memory-1) 변경:**
```typescript
// 변경 전
instruction: '위의 세 단어를 쉼표(,)로 구분하여 순서대로 입력해주세요.'

// 변경 후
instruction: '세 단어를 쉼표(,)로 구분하여 입력해주세요.\n예시: 사과, 자동차, 연필'
hint: '세 단어를 쉼표로 구분하여 입력하세요. (예: 사과, 자동차, 연필)'
```

**문항 5 (memory-5) 변경:**
```typescript
// 변경 전
instruction: '잠시 후 이 문장에 대해 질문할 것입니다.'

// 변경 후
question: '다음 문장을 기억하고 그대로 입력해주세요: "오늘 아침 공원에서 강아지가 뛰어놀았습니다."'
instruction: '위 문장을 그대로 입력해주세요. (따옴표 제외)\n예시: 오늘 아침 공원에서 강아지가 뛰어놀았습니다'
hint: '문장을 그대로 입력해주세요.'
```

---

## 5. 얼굴 인식 시각화 변경 (High)

### 파일: `src/hooks/usePoseDetection.ts`

**변경 전:**
- 얼굴 윤곽선 연결 (FACE_OVAL_INDICES)
- 눈, 입술, 눈썹 등 실선 연결
- 눈동자 원 그리기

**변경 후:**
- 얼굴 영역 바운딩 박스 (점선 사각형)
- 주요 키포인트만 점으로 표시:
  - 왼쪽/오른쪽 눈 중심 (하늘색, 5px)
  - 코끝 (연두색, 4px)
  - 입술 중심 (핑크색, 5px)
  - 눈썹 중심 (연보라색, 3px)
  - 턱 중앙 (흰색, 3px)

**수정 내용:**
- `drawFaceLandmarks()` 함수 전체 재작성
- 연결선 제거, 점 기반 표시로 변경
- 바운딩 박스에 15px 패딩 추가

---

## 6. 동작 훈련 개선 (High)

### 파일: `src/components/training/MovementTraining.tsx`

**변경 전:**
```typescript
const trainingMovements: MovementType[] = [
  'smile', 'thumbs_up', 'wave_hand', 'hand_raise_right',
  'hand_raise_left', 'hand_raise_both', 'arms_spread',
  'close_eyes', 'open_mouth', 'clap_hands',
];
```

**변경 후:**
```typescript
// 동적 동작 제거 (wave_hand, clap_hands)
const trainingMovements: MovementType[] = [
  'smile', 'thumbs_up', 'hand_raise_right', 'hand_raise_left',
  'hand_raise_both', 'arms_spread', 'close_eyes', 'open_mouth',
];
```

**카메라 영역 변경:**
```typescript
// 변경 전
className="aspect-video"

// 변경 후 (세로로 더 넓게)
className="aspect-[4/5] sm:aspect-[3/4] md:aspect-video"
```

**수정 내용:**
- 인식 어려운 동적 동작 (손 흔들기, 박수) 제거
- 고정 자세 8개로 통일
- 모바일에서 세로 비율 증가로 인식 영역 확대

---

## 7. 사진 페이지 개선 (High)

### 파일: `src/app/photos/page.tsx`

**변경 1: 더미 데이터 초기화 제거**
```typescript
// 변경 전
useEffect(() => {
  initSession();
  initializeDummyData(); // 제거됨
}, []);

// 변경 후
useEffect(() => {
  initSession();
  // 더미 데이터 초기화 제거 - 실제 사진 업로드만 사용
}, []);
```

**변경 2: 모바일 플로팅 버튼 추가**
```tsx
{/* 모바일 플로팅 버튼 - 사진 선택 시 하단에 표시 */}
{selectedPhoto && viewMode === 'album' && (
  <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
    <Button variant="primary" className="w-full shadow-lg" size="lg" onClick={handleStartReminiscence}>
      이 사진으로 회상 대화 시작
    </Button>
  </div>
)}
```

---

## 8. 모바일 스타일 개선 (High)

### 파일: `src/app/globals.css`

**폰트 크기 조정:**
```css
/* 변경 전 */
html { font-size: 18px; }
@media (min-width: 768px) { html { font-size: 19px; } }
@media (min-width: 1024px) { html { font-size: 20px; } }

/* 변경 후 */
html { font-size: 16px; } /* 작은 모바일 (iPhone SE 등) */
@media (min-width: 376px) { html { font-size: 17px; } } /* 일반 모바일 */
@media (min-width: 768px) { html { font-size: 18px; } } /* 태블릿 */
@media (min-width: 1024px) { html { font-size: 19px; } } /* 데스크톱 */
@media (min-width: 1280px) { html { font-size: 20px; } } /* 대형 화면 */
@media (max-width: 280px) { html { font-size: 14px; } } /* Galaxy Fold */
```

**iOS Safe Area 및 dvh 지원:**
```css
body {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height - iOS 대응 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**한글 줄바꿈 유틸리티:**
```css
.no-break {
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

---

## 9. AI 자동 태깅 개선 (Medium)

### 파일: `src/lib/ai/vision.ts`

**인터페이스 확장:**
```typescript
export interface PhotoAnalysisResult {
  scene: string;
  peopleCount: number;
  estimatedEra: string;
  locationType: string;
  mood: string;
  objects: string[];
  description: string;
  tags: string[]; // 새로 추가: AI 자동 생성 태그 (5-8개)
}
```

**프롬프트 개선:**
```
- tags: 사진을 대표하는 키워드 태그 (배열, 5-8개). 예: ["가족", "여행", "바다", "여름", "행복"]
```

**기본값 처리:**
```typescript
tags: result.tags || [result.scene, result.mood, result.locationType].filter(Boolean),
```

---

## 10. UI 컴포넌트 반응형화 (Medium)

### 파일: `src/components/ui/Button.tsx`

**버튼 크기 반응형:**
```typescript
// 변경 전
sm: 'min-h-[40px] px-4 text-sm',
md: 'min-h-[48px] px-5 text-base',
lg: 'min-h-[56px] px-6 text-lg',
xl: 'min-h-[64px] px-8 text-xl',

// 변경 후
sm: 'min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 text-sm',
md: 'min-h-[48px] sm:min-h-[52px] px-4 sm:px-5 text-sm sm:text-base',
lg: 'min-h-[52px] sm:min-h-[56px] px-5 sm:px-6 text-base sm:text-lg',
xl: 'min-h-[56px] sm:min-h-[64px] px-6 sm:px-8 text-lg sm:text-xl',
```

### 파일: `src/components/ui/Card.tsx`

**카드 패딩 반응형:**
```typescript
// 변경 전
sm: 'p-4',
md: 'p-6',
lg: 'p-8',

// 변경 후
sm: 'p-3 sm:p-4',
md: 'p-4 sm:p-6',
lg: 'p-5 sm:p-8',
```

---

## 11. 답변 수정 추적 개선 (Medium)

### 파일: `src/app/assessment/page.tsx`

**변경 전:**
```typescript
// 모든 값 변경을 수정으로 기록
if (currentAnswer !== null && currentAnswer !== value) {
  recordCorrection();
}
```

**변경 후:**
```typescript
// 실제 "수정"만 기록 (순차 입력/선택은 제외)
const isCorrection = (() => {
  // 문자열: 길이가 줄어드는 경우 (백스페이스/삭제)
  if (typeof currentAnswer === 'string' && typeof value === 'string') {
    return value.length < currentAnswer.length && currentAnswer.length > 0;
  }
  // 배열 (multiSelect): 항목이 줄어드는 경우
  if (Array.isArray(currentAnswer) && Array.isArray(value)) {
    return value.length < currentAnswer.length;
  }
  // 숫자 (단일 선택): 다른 값으로 변경
  if (typeof currentAnswer === 'number' && typeof value === 'number') {
    return true;
  }
  return false;
})();

if (isCorrection) {
  recordCorrection();
}
```

**평가 종료 다이얼로그 개선:**
```typescript
// 변경 전
if (confirm('평가를 종료하시겠습니까? 진행 상황이 저장되지 않습니다.'))

// 변경 후
if (confirm('평가를 중단하시겠습니까?\n\n⚠️ 현재까지의 응답은 저장되지 않으며, 기록에 반영되지 않습니다.'))
```

---

## 변경된 파일 목록

| 우선순위 | 파일 경로 | 변경 내용 |
|---------|----------|----------|
| Critical | `src/lib/scoring.ts` | 점수 기준 변경 |
| Critical | `src/store/photoStore.ts` | clearPhotos에 isInitialized 추가 |
| Critical | `src/components/training/VoiceTraining.tsx` | 쉼표 단어 제거, 난이도별 개선 |
| Critical | `src/data/assessment-questions.ts` | 문항 1, 5 명확화 |
| High | `src/hooks/usePoseDetection.ts` | 얼굴 시각화 변경 |
| High | `src/components/training/MovementTraining.tsx` | 동적 동작 제거, 비율 변경 |
| High | `src/app/photos/page.tsx` | 더미 제거, 플로팅 버튼 |
| High | `src/app/globals.css` | 모바일 폰트, Safe Area |
| Medium | `src/lib/ai/vision.ts` | tags 필드 추가 |
| Medium | `src/components/ui/Button.tsx` | 반응형 크기 |
| Medium | `src/components/ui/Card.tsx` | 반응형 패딩 |
| Medium | `src/app/assessment/page.tsx` | 수정 추적 개선, 다이얼로그 |
| Medium | `src/app/assessment/result/page.tsx` | 새 RiskLevel 타입 적용, 이전 데이터 호환 |
| Medium | `src/app/api/photos/[id]/auto-tag/route.ts` | tags 기본값 추가 |

---

## 테스트 체크리스트

### 기능 테스트
- [ ] Assessment 1번, 5번 문제 답변 → 정답 인식 확인
- [ ] 평가 종료 → 기록 미반영 확인
- [ ] 결과 페이지 → 새 점수 기준 적용 확인
- [ ] Settings → 사진 초기화 동작 확인
- [ ] Photos → 더미 데이터 없이 시작 확인
- [ ] Voice Training → 쉼표 없는 단어 확인
- [ ] Movement Training → 고정 자세 8개 확인
- [ ] 자동 태깅 → tags 배열 포함 확인

### 모바일 테스트
- [ ] iPhone 12/13/14: Safari에서 전 페이지 확인
- [ ] Galaxy S21/S22: Chrome에서 전 페이지 확인
- [ ] Galaxy Fold: 접힌 상태 (280px) 확인
- [ ] iOS Safe Area 적용 확인
- [ ] 플로팅 버튼 표시 확인

### 빌드 테스트
```bash
npm run build  # 타입 에러 없음 확인
npm run lint   # 린트 에러 없음 확인
```

---

## 알려진 제한사항

1. **이미지 생성 진행률**: Gemini API 연동은 기존 코드 유지, UI 진행률 표시는 별도 구현 필요
2. **태그 수정/삭제 UI**: PhotoCard 컴포넌트에 태그 편집 UI 추가 필요 (별도 작업)
3. **카메라 사전 로드**: useFaceDetection 훅 최적화는 추가 분석 필요

---

## 다음 단계

1. 빌드 및 린트 테스트 실행
2. 개발 서버에서 기능 테스트
3. 실제 모바일 기기에서 UI 확인
4. 필요시 추가 조정

---

*이 보고서는 자동 생성되었습니다.*
