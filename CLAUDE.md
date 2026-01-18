# Re:turn - Claude 컨텍스트 문서

> 이 문서는 Claude가 프로젝트를 빠르게 이해할 수 있도록 작성되었습니다.

---

## 프로젝트 개요

**Re:turn**은 AI 기반 회상치료 플랫폼입니다.
- **대상**: 조기치매/경도인지장애(MCI) 환자
- **목적**: 인지 기능 평가 및 회상치료를 통한 인지 기능 개선
- **특징**: 인증 없음 (UUID 세션 기반), 전문 의료기관 UI

---

## 기술 스택

```
Frontend: Next.js 16 + TypeScript + TailwindCSS 4
Backend: Next.js API Routes + Prisma 5 + PostgreSQL
State: Zustand + LocalStorage persist
AI: OpenAI (GPT-4o-mini, Whisper, Vision, Embedding)
Storage: Supabase Storage
```

---

## 핵심 파일 위치

### 상태 관리
- `src/store/sessionStore.ts` - 세션 관리 (UUID, LocalStorage)
- `src/store/assessmentStore.ts` - 진단 상태 관리
- `src/store/trainingStore.ts` - 훈련 상태 관리
- `src/store/photoStore.ts` - 사진 상태 관리

### UI 컴포넌트
- `src/components/ui/` - 공통 UI (Button, Card, Modal, DataPanel, ProgressBar, StatusBadge)
- `src/components/assessment/` - 진단 컴포넌트 (Timer, QuestionCard, AnswerInput, AssessmentProgress, CameraPreview)
- `src/components/charts/` - 차트 컴포넌트 (RadarChart, LineChart, BarChart, HeatmapChart, BehaviorMetrics 등 8개)
- `src/components/training/` - 훈련 게임 컴포넌트 (MemoryGame, LanguageGame, CalculationGame, VoiceTraining, MovementTraining)
- `src/components/photos/` - 사진 관리 컴포넌트 (PhotoAlbum, PhotoUploader, PhotoGallery, PhotoCard 등)
- `src/components/reminiscence/` - 회상 컴포넌트 (ChatInterface, DiaryPage, DiaryEntry, ManuscriptPaper 등)
- `src/components/demos/` - 데모 플레이어 시스템 (AssessmentDemo, MemoryGameDemo, ReminiscenceDemo 등)

### 훅 (Hooks)
- `src/hooks/useFaceDetection.ts` - 얼굴 감지 및 감정 분석
- `src/hooks/usePoseDetection.ts` - 자세 감지
- `src/hooks/useAudioRecording.ts` - 음성 녹음
- `src/hooks/useSpeechRecognition.ts` - 음성 인식
- `src/hooks/useMouseTracking.ts` - 마우스 추적

### API Routes
- `src/app/api/session/` - 세션 CRUD
- `src/app/api/assessment/` - 진단 API
- `src/app/api/training/` - 훈련 API
- `src/app/api/analytics/` - 분석 API
- `src/app/api/photos/` - 사진 API
- `src/app/api/reminiscence/` - 회상 API

### 유틸리티
- `src/lib/db/prisma.ts` - Prisma 클라이언트
- `src/lib/ai/openai.ts` - OpenAI API 함수
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/lib/scoring.ts` - 점수 계산 로직 (340줄)

### 타입 정의
- `src/types/index.ts` - 전체 TypeScript 타입 (22개 인터페이스)

### 데이터베이스
- `prisma/schema.prisma` - DB 스키마 (5개 테이블)

---

## 인지 평가 영역 (6개)

| 영역 | 영문 | 배점 |
|------|------|------|
| 기억력 | memory | 20점 |
| 언어력 | language | 20점 |
| 계산력 | calculation | 15점 |
| 주의력 | attention | 15점 |
| 실행기능 | executive | 15점 |
| 시공간력 | visuospatial | 15점 |

**총점**: 100점

**위험도 판정**:
- 85-100: 정상 (normal)
- 70-84: 경도 주의 (mild_caution)
- 55-69: MCI 의심 (mci_suspected)
- <55: 전문 상담 권장 (consultation_recommended)

---

## 디자인 가이드라인

### 색상 (CSS 변수)
```css
--primary-deep: #1E40AF   /* 주요 액션 */
--primary: #3B82F6        /* 버튼 */
--primary-light: #60A5FA  /* 호버 */
--success: #10B981        /* 정상 */
--warning: #F59E0B        /* 주의 */
--danger: #EF4444         /* 위험 */
--info: #8B5CF6           /* 훈련 */
```

### 타이포그래피
- 폰트: Pretendard
- 제목: 32-48px
- 본문: 18-20px (고령자 친화적)

### 컴포넌트 규칙
- 버튼 최소 높이: 56px
- 모서리: rounded-xl (12px), rounded-2xl (16px)
- 터치 영역: 충분히 크게 (고령자 고려)

---

## API 엔드포인트

### 세션
```
POST /api/session/create     - 새 세션 생성
GET  /api/session/:id        - 세션 조회
PATCH /api/session/:id       - 세션 업데이트
```

### 진단
```
POST /api/assessment/submit  - 응답 제출
POST /api/assessment/analyze - AI 분석
GET  /api/assessment/:id     - 결과 조회
GET  /api/assessment/history - 이력 조회
```

### 훈련
```
POST /api/training/start     - 훈련 시작
POST /api/training/complete  - 훈련 완료
```

### 분석
```
GET /api/analytics/summary        - 요약 데이터
GET /api/analytics/trends         - 트렌드 분석
GET /api/analytics/recommendations - AI 추천
GET /api/analytics/training-stats - 훈련 통계
```

### 사진
```
GET  /api/photos             - 사진 목록
POST /api/photos             - 사진 등록
POST /api/photos/upload      - 사진 업로드
POST /api/photos/:id/auto-tag - 자동 태깅
```

### 회상
```
POST /api/reminiscence/start - 회상 세션 시작
POST /api/reminiscence/chat  - 대화 메시지
```

---

## 현재 진행 상태

**완료**: Phase 1-5
- Phase 1: 기반 구축 (프로젝트 설정, 세션 시스템, UI 컴포넌트, DB 스키마)
- Phase 2: 진단 모듈 (문항 설계, 평가 UI, 반응 측정, 결과 대시보드)
- Phase 3: 회상치료 모듈 (사진 관리, AI 대화, 회상 기록)
- Phase 4: 훈련 모듈 (기억력, 언어력, 계산력, 주의력 게임)
- Phase 5: 분석 모듈 (트렌드 분석, AI 추천, 행동 분석)

**진행 중**: 버그 수정 및 안정화

---

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# Prisma 클라이언트 생성
npx prisma generate

# DB 마이그레이션 (Supabase 연결 필요)
npx prisma db push
```

---

## 주의 사항

1. **인증 없음**: 세션 ID가 LocalStorage에 저장됨. 브라우저 데이터 삭제 시 세션 분실.
2. **Prisma 버전**: Prisma 5 사용 (7 아님). 호환성 이슈로 다운그레이드됨.
3. **고령자 UX**: 큰 버튼, 큰 폰트, 명확한 피드백 필수.
4. **의료 면책**: 진단 결과는 참고용. 정확한 진단은 전문 의료기관 권장.

---

## 관련 문서

- `docs/PROGRESS.md` - 개발 진행 기록 (Phase 1-5 완료)
- `docs/ARCHITECTURE.md` - 시스템 아키텍처
- `docs/DECISIONS.md` - 기술 의사결정 기록
