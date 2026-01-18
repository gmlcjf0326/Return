# ReMemory - Claude 컨텍스트 문서

> 이 문서는 Claude가 프로젝트를 빠르게 이해할 수 있도록 작성되었습니다.

---

## 프로젝트 개요

**ReMemory**는 AI 기반 회상치료 플랫폼입니다.
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

### UI 컴포넌트
- `src/components/ui/` - Button, Card, DataPanel, ProgressBar, StatusBadge
- `src/components/assessment/` - 진단 관련 컴포넌트 (구현 예정)
- `src/components/charts/` - 차트 컴포넌트 (구현 예정)

### API Routes
- `src/app/api/session/` - 세션 CRUD
- `src/app/api/assessment/` - 진단 API (구현 예정)

### 유틸리티
- `src/lib/db/prisma.ts` - Prisma 클라이언트
- `src/lib/ai/openai.ts` - OpenAI API 함수
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/lib/scoring.ts` - 점수 계산 로직 (구현 예정)

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

### 세션 (구현됨)
```
POST /api/session/create     - 새 세션 생성
GET  /api/session/:id        - 세션 조회
PATCH /api/session/:id       - 세션 업데이트
```

### 진단 (구현 예정)
```
POST /api/assessment/start   - 진단 시작
POST /api/assessment/submit  - 응답 제출
POST /api/assessment/analyze - AI 분석
GET  /api/assessment/:id     - 결과 조회
GET  /api/assessment/history - 이력 조회
```

---

## 현재 진행 상태

**완료**: Phase 1 (기반 구축)
- 프로젝트 설정
- 세션 시스템
- UI 컴포넌트
- DB 스키마

**진행 중**: Phase 2 (진단 모듈)
- TASK-005: 문항 설계
- TASK-006: 평가 UI
- TASK-008: 반응 측정
- TASK-010: 결과 대시보드

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

- `docs/PROGRESS.md` - 개발 진행 기록
- 계획 파일: `C:\Users\plani\.claude\plans\wiggly-foraging-bubble.md`
