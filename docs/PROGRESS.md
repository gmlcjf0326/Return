# ReMemory 개발 진행 기록

> AI 기반 회상치료 플랫폼 개발 히스토리

---

## 진행 상태 요약

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1: 기반 구축 | ✅ 완료 | 2025-01-14 |
| Phase 2: 진단 모듈 | ✅ 완료 | 2025-01-14 |
| Phase 3: 사진 태깅 + 회상 | ✅ 완료 | 2025-01-16 |
| Phase 4: 훈련 모듈 | ✅ 완료 | 2025-01-17 |
| Phase 5: 분석 + 배포 | ✅ 완료 | 2025-01-17 |

---

## Phase 1: 기반 구축 ✅

### 완료일: 2025-01-14

### TASK-001: 프로젝트 초기 설정 ✅
**완료 시각**: 2025-01-14

**산출물**:
- Next.js 16 + TypeScript + TailwindCSS 4 프로젝트
- 필수 패키지 설치 완료
  - @supabase/supabase-js, prisma@5, @prisma/client@5
  - zustand, openai, uuid

**파일 구조**:
```
rememory/
├── src/app/
├── src/components/
├── src/hooks/
├── src/lib/
├── src/store/
├── src/types/
├── prisma/
└── public/
```

---

### TASK-002: 세션 시스템 ✅
**완료 시각**: 2025-01-14

**산출물**:
- `src/store/sessionStore.ts` - Zustand 세션 관리 + LocalStorage persist
- `src/app/api/session/create/route.ts` - POST 세션 생성 API
- `src/app/api/session/[id]/route.ts` - GET/PATCH 세션 조회/업데이트 API

**주요 기능**:
- UUID 기반 세션 자동 생성
- LocalStorage 영속화 (재방문 시 세션 유지)
- 서버 DB 동기화

---

### TASK-003: 전문 의료기관 스타일 UI 시스템 ✅
**완료 시각**: 2025-01-14

**산출물**:
| 컴포넌트 | 파일 | 기능 |
|---------|------|------|
| Button | `src/components/ui/Button.tsx` | 5가지 variant, 4가지 size |
| Card | `src/components/ui/Card.tsx` | Card, CardHeader, CardContent, CardFooter |
| DataPanel | `src/components/ui/DataPanel.tsx` | 의료기기 스타일 수치 표시 |
| ProgressBar | `src/components/ui/ProgressBar.tsx` | 진행률 표시 |
| StatusBadge | `src/components/ui/StatusBadge.tsx` | 상태 배지 (6가지 상태) |

**디자인 시스템**:
- Medical Blue 색상 팔레트 (#1E40AF, #3B82F6, #60A5FA)
- Pretendard 폰트
- CSS 변수 기반 테마

---

### TASK-004: DB 스키마 및 Prisma 모델 ✅
**완료 시각**: 2025-01-14

**산출물**:
- `prisma/schema.prisma` - 5개 테이블 정의

**테이블 구조**:
| 테이블 | 용도 |
|--------|------|
| Session | 사용자 세션 (인증 대체) |
| Assessment | 인지 진단 결과 |
| TrainingSession | 훈련 기록 |
| Photo | 사진 + AI 태깅 |
| ReminiscenceLog | 회상 대화 기록 |

---

## Phase 2: 진단 모듈 ✅

### 완료일: 2025-01-14

### TASK-005: 인지 평가 문항 설계 ✅
**완료 시각**: 2025-01-14

**산출물**:
- `src/data/assessment-questions.ts` - 30개 문항 데이터 (6개 영역 × 5문항)
- `src/lib/scoring.ts` - 점수 계산 로직 및 위험도 판정

**문항 구성**:
| 영역 | 문항 수 | 배점 | 문항 유형 |
|------|---------|------|----------|
| 기억력 (memory) | 5 | 20점 | 단어 회상, 이미지 기억 |
| 언어력 (language) | 5 | 20점 | 문장 완성, 단어 연상 |
| 계산력 (calculation) | 5 | 15점 | 사칙연산, 숫자 패턴 |
| 주의력 (attention) | 5 | 15점 | 반응 속도, 연속 과제 |
| 실행기능 (executive) | 5 | 15점 | 순서 배열, 계획 과제 |
| 시공간력 (visuospatial) | 5 | 15점 | 도형 인식, 패턴 매칭 |

**점수 로직**:
- 정답 시 기본 점수 부여
- 응답 시간에 따른 보너스/감점
  - 제한시간 50% 이내: +10% 보너스
  - 제한시간 초과: -50% 감점

---

### TASK-006: 인지 평가 UI 구현 ✅
**완료 시각**: 2025-01-14

**산출물**:
| 파일 | 기능 |
|------|------|
| `src/components/assessment/Timer.tsx` | 타이머 컴포넌트 (경고 임계값, 진행 바) |
| `src/components/assessment/AssessmentProgress.tsx` | 진행률 표시 (카테고리별 인디케이터) |
| `src/components/assessment/AnswerInput.tsx` | 답변 입력 (객관식, 주관식, 순서 배열) |
| `src/components/assessment/QuestionCard.tsx` | 문항 카드 (난이도, 타이머 통합) |
| `src/components/assessment/index.ts` | barrel export |
| `src/app/assessment/page.tsx` | 진단 시작/진행 페이지 |
| `src/app/assessment/result/page.tsx` | 결과 페이지 |

**API Routes**:
| 엔드포인트 | 메서드 | 기능 |
|-----------|--------|------|
| `/api/assessment/submit` | POST | 결과 저장 |
| `/api/assessment/analyze` | POST | AI 분석 (인사이트 생성) |
| `/api/assessment/history` | GET | 이력 조회 |
| `/api/assessment/[id]` | GET/DELETE | 개별 결과 조회/삭제 |

**UI 특징**:
- 고령자 친화적 큰 버튼 (56px+)
- 실시간 타이머 및 진행률 표시
- 카테고리별 완료 상태 인디케이터
- 위험도 색상 코딩 (정상/주의/경고/위험)

---

### TASK-008: 반응 측정 시스템
**상태**: 부분 완료 (assessmentStore에 이미 구현됨)

**기존 구현**:
- `src/store/assessmentStore.ts`에 반응 측정 로직 포함
  - 응답 시간 자동 측정
  - 망설임/수정 횟수 기록
  - 감정 타임라인 기록

**추가 구현 필요**:
- [ ] `src/hooks/useResponseTracker.ts` - 반응 측정 훅 분리 (선택)

---

### TASK-010: 점수화 및 결과 대시보드
**상태**: 부분 완료

**완료된 항목**:
- ✅ 결과 페이지 (`/assessment/result`)
- ✅ 영역별 점수 바 차트
- ✅ 위험도 판정 및 표시
- ✅ 강점/취약 영역 분석
- ✅ 훈련 추천 생성

**추가 구현 필요**:
- [ ] `src/components/charts/RadarChart.tsx` - 레이더 차트
- [ ] 이력 대비 비교 기능

---

## 이슈 및 해결 내역

### Issue #001: Prisma 7 호환성 문제
**발생일**: 2025-01-14
**문제**: Prisma 7의 새로운 설정 방식으로 인해 `prisma generate` 실패
**해결**: Prisma 5로 다운그레이드 (`npm install prisma@5 @prisma/client@5`)

---

## 기술 결정 사항

> 상세 내용은 `docs/DECISIONS.md` 참조

- ADR-001: 인증 없음 - 세션 기반
- ADR-002: Prisma 5 사용
- ADR-003: 개발 DB - SQLite

---

## 다음 단계

1. [x] TASK-005: 문항 데이터 생성 ✅
2. [x] TASK-006: 진단 UI 구현 ✅
3. [ ] TASK-008: 반응 측정 훅 분리 (선택)
4. [ ] TASK-010: 레이더 차트 추가
5. [x] Phase 3: Gemini API 연동 및 그림일기 기능 ✅

---

## Phase 3: ReMemory 기능 확장 ✅

### 완료일: 2025-01-16

### TASK-011: Gemini API 연동 ✅
**완료 시각**: 2025-01-16

**산출물**:
| 파일 | 작업 | 설명 |
|------|------|------|
| `.env` | 수정 | GEMINI_API_KEY 환경변수 활성화 |
| `.env.example` | 수정 | Gemini 설정 가이드 추가 |
| `package.json` | 수정 | @google/genai 의존성 추가 |
| `src/lib/ai/gemini.ts` | 신규 | Gemini API 통합 모듈 |
| `src/lib/ai/imageGeneration.ts` | 수정 | Gemini 이미지 생성 연동 |
| `src/lib/ai/llm.ts` | 수정 | Gemini provider 추가 |

**Gemini 모델 설정**:
- 텍스트: `gemini-1.5-flash-8b` (나노급 경량 모델)
- 이미지: `gemini-2.0-flash-exp` (이미지 생성 지원)

**주요 기능**:
- `generateText()`: 텍스트 생성
- `generateImage()`: 이미지 생성 (Base64 반환)
- `generateReminiscenceResponse()`: 회상 대화 응답
- `generateDiarySummary()`: 일기 요약 생성
- `generateDiaryContent()`: 그림일기 생성 (이미지 + 텍스트)

---

### TASK-012: 월별 더미 사진 확장 ✅
**완료 시각**: 2025-01-16

**산출물**:
- `src/data/dummyPhotos.ts` - 360개 더미 사진 (5년 × 월별 다수)

**데이터 구성**:
| 년도 | 월별 개수 | 총 개수 |
|------|----------|---------|
| 2024 | 10개 | 120개 |
| 2023 | 10개 | 120개 |
| 2022 | 5개 | 60개 |
| 2021 | 3개 | 36개 |
| 2020 | 2개 | 24개 |
| **합계** | - | **360개** |

**월별 테마**:
- 1월: 새해, 설날 준비
- 2월: 설날, 정월대보름
- 3월: 봄나들이, 졸업식
- 4월: 벚꽃, 식목일
- 5월: 어버이날, 가정의달
- 6월: 초여름, 단오
- 7월: 여름휴가, 바다
- 8월: 광복절, 여름 끝
- 9월: 추석, 가을 시작
- 10월: 단풍, 한글날
- 11월: 김장철, 늦가을
- 12월: 크리스마스, 연말

**새 헬퍼 함수**:
- `getDummyPhotosByMonth()`: 월별 그룹핑
- `getDummyPhotosForYearMonth(year, month)`: 특정 년월 조회
- `getDummyPhotosStats()`: 통계 정보

---

### TASK-013: 원고지 스타일 그림일기 UI ✅
**완료 시각**: 2025-01-16

**산출물**:
| 파일 | 유형 | 설명 |
|------|------|------|
| `src/components/reminiscence/ManuscriptPaper.tsx` | 신규 | 원고지 그리드 컴포넌트 |
| `src/components/reminiscence/DiaryPage.tsx` | 신규 | 그림일기 페이지 컴포넌트 |
| `src/app/globals.css` | 수정 | 원고지 CSS 스타일 추가 |
| `src/components/reminiscence/index.ts` | 수정 | 새 컴포넌트 export |

**ManuscriptPaper 컴포넌트 기능**:
- 한 글자씩 셀에 배치
- 가로/세로 쓰기 지원
- 글자 수 설정 (charsPerRow, maxRows)
- 폰트 크기 옵션 (small, normal, large)
- 원고지 스타일 CSS (5자마다 굵은 선)

**DiaryPage 컴포넌트 기능**:
- 상단: AI 생성 이미지 (스타일 선택 가능)
- 하단: 원고지 형태 일기장
- 이미지 스타일: 수채화, 연필, 크레용, 파스텔
- 원본/그림 토글 버튼
- 재생성 버튼

**CSS 스타일**:
- 손글씨 폰트 (Nanum Pen Script)
- 원고지 배경 그라데이션
- 셀 호버 효과
- 글자 애니메이션
- 모바일 반응형

---

## Hotfix 2025-01-14

### Issue #002: DB 연결 실패 (P5010 Error)
**발생일**: 2025-01-14
**문제**: 로컬 Prisma Postgres 서버 연결 실패 (prisma dev 미실행)
**해결**: SQLite로 전환
- `prisma/schema.prisma`: provider를 "sqlite"로 변경
- `.env`: DATABASE_URL을 "file:./dev.db"로 변경
- `@db.VarChar` 등 PostgreSQL 전용 수식어 제거
- `Json` 타입을 `String`으로 변경 (SQLite 호환)

### Issue #003: 404 에러 (누락된 페이지)
**발생일**: 2025-01-14
**문제**: 홈페이지에서 링크하는 Phase 3+ 페이지들이 없음
**해결**: 플레이스홀더 페이지 생성

**생성된 파일**:
| 경로 | 설명 |
|------|------|
| `src/app/training/page.tsx` | 훈련 메인 (Phase 4 예정) |
| `src/app/training/reminiscence/page.tsx` | 회상 대화 (Phase 3 예정) |
| `src/app/photos/page.tsx` | 사진 관리 (Phase 3 예정) |
| `src/app/analytics/page.tsx` | 분석 리포트 (Phase 5 예정) |
| `src/app/assessment/history/page.tsx` | 진단 이력 (기능적 페이지) |

