# ReMemory - AI 기반 회상치료 플랫폼

조기치매/경도인지장애(MCI) 환자를 위한 인지 기능 평가 및 회상치료 플랫폼입니다.

## 프로젝트 소개

- **대상**: 조기치매/경도인지장애(MCI) 환자
- **목적**: 인지 기능 평가 및 회상치료를 통한 인지 기능 개선

## 배포 링크

- **라이브 데모**: https://return.vercel.app/
- **GitHub**: https://github.com/gmlcjf0326/Return.git

## 기술 스택

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS 4
- Zustand (상태 관리)

### Backend

- Next.js API Routes
- Prisma 5
- PostgreSQL (Supabase)

### AI/ML

- Google Gemini 1.5 Flash (대화, 요약)
- Google Imagen 3 (그림일기 생성)
- OpenAI GPT-4o-mini (Vision 분석)
- OpenAI Whisper (음성 인식)
- TensorFlow.js (MoveNet, MediaPipe)

### Storage

- Supabase Storage (사진 업로드)

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router 페이지
│   ├── api/                  # API Routes
│   │   ├── assessment/       # 진단 API
│   │   ├── training/         # 훈련 API
│   │   ├── analytics/        # 분석 API
│   │   ├── photos/           # 사진 API
│   │   ├── reminiscence/     # 회상 API
│   │   └── session/          # 세션 API
│   ├── assessment/           # 인지 진단 페이지
│   ├── training/             # 훈련 페이지
│   ├── photos/               # 사진 관리 페이지
│   ├── analytics/            # 분석 대시보드
│   └── settings/             # 설정 페이지
├── components/               # React 컴포넌트
│   ├── ui/                   # 공통 UI 컴포넌트
│   ├── assessment/           # 진단 관련 컴포넌트
│   ├── training/             # 훈련 게임 컴포넌트
│   ├── photos/               # 사진 관리 컴포넌트
│   ├── reminiscence/         # 회상 대화 컴포넌트
│   ├── charts/               # 차트 컴포넌트
│   └── demos/                # 데모 플레이어
├── store/                    # Zustand 상태 관리
├── hooks/                    # Custom Hooks
├── lib/                      # 유틸리티 및 API 클라이언트
│   ├── ai/                   # AI API 클라이언트
│   └── db/                   # Prisma 클라이언트
├── data/                     # 정적 데이터
└── types/                    # TypeScript 타입 정의
```

## 설치 및 실행

### 필수 환경 변수 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_postgresql_url

# OpenAI
OPENAI_API_KEY=your_openai_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# 배포 환경
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 개발 서버 실행

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# DB 스키마 푸시 (최초 또는 스키마 변경 시)
npx prisma db push

# 개발 서버 실행
npm run dev
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 주요 기능

### 1. 인지 진단 (6개 영역)

| 영역     | 영문         | 배점 |
| -------- | ------------ | ---- |
| 기억력   | memory       | 20점 |
| 언어력   | language     | 20점 |
| 계산력   | calculation  | 15점 |
| 주의력   | attention    | 15점 |
| 실행기능 | executive    | 15점 |
| 시공간력 | visuospatial | 15점 |

**총점**: 100점

**위험도 판정**:

- 85-100: 정상 (normal)
- 70-84: 경도 주의 (mild_caution)
- 55-69: MCI 의심 (mci_suspected)
- <55: 전문 상담 권장 (consultation_recommended)

### 2. 훈련 프로그램

- 기억력 게임 (카드 매칭)
- 언어력 훈련 (단어 찾기)
- 계산력 훈련 (수학 문제)
- 음성 훈련 (발음 연습)
- 움직임 훈련 (포즈 따라하기)
- 회상 대화 (AI 대화)

### 3. 회상치료

- 사진 기반 AI 대화
- 그림일기 자동 생성
- 추억 기록 저장

### 4. 분석 대시보드

- 점수 변화 추이
- 영역별 상세 분석
- 훈련 통계
- AI 맞춤 추천

## API 엔드포인트

### 세션

```
POST /api/session/create     - 새 세션 생성
GET  /api/session/:id        - 세션 조회
PATCH /api/session/:id       - 세션 업데이트
```

### 진단

```
POST /api/assessment/submit  - 결과 제출
GET  /api/assessment/:id     - 결과 조회
GET  /api/assessment/history - 이력 조회
```

### 훈련

```
POST /api/training/start     - 훈련 시작
POST /api/training/complete  - 훈련 완료
GET  /api/training/complete  - 훈련 이력
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

## 화면 구성

```
/ (홈)
├── /assessment              - 인지 진단
│   ├── /assessment/result   - 진단 결과
│   └── /assessment/history  - 진단 이력
├── /training                - 훈련 선택
│   ├── /training/memory-game     - 기억력 게임
│   ├── /training/language        - 언어력 훈련
│   ├── /training/calculation     - 계산력 훈련
│   ├── /training/voice           - 음성 훈련
│   ├── /training/movement        - 움직임 훈련
│   └── /training/reminiscence    - 회상 대화
│       └── /training/reminiscence/result - 그림일기
├── /photos                  - 사진 관리
├── /analytics               - 분석 대시보드
└── /settings                - 설정
```

## 데이터베이스 스키마

```prisma
model Session {
  id            String    @id @default(uuid())
  nickname      String?
  birthYear     Int?
  profileData   String?   @db.Text
  createdAt     DateTime  @default(now())
  lastActiveAt  DateTime?

  assessments       Assessment[]
  trainingSessions  TrainingSession[]
  photos            Photo[]
  reminiscenceLogs  ReminiscenceLog[]
}

model Assessment {
  id                Int       @id @default(autoincrement())
  sessionId         String
  totalScore        Int?
  memoryScore       Int?
  languageScore     Int?
  calculationScore  Int?
  attentionScore    Int?
  executiveScore    Int?
  visuospatialScore Int?
  riskLevel         String?
  rawResponses      String?   @db.Text
  behaviorData      String?   @db.Text
  createdAt         DateTime  @default(now())

  session Session @relation(...)
}

model TrainingSession { ... }
model Photo { ... }
model ReminiscenceLog { ... }
```

## Supabase Storage 설정

1. Supabase 대시보드에서 Storage 버킷 생성
2. 버킷 이름: `photos`
3. Public 접근 허용 설정
4. RLS 정책 설정 (필요시)

## 주의사항

1. **인증 없음**: 세션 ID가 LocalStorage에 저장됨. 브라우저 데이터 삭제 시 세션 분실.
2. **의료 면책**: 진단 결과는 참고용이며, 정확한 진단을 위해서는 전문 의료기관의 상담을 권장합니다.
3. **API 키 보안**: 환경 변수는 절대 커밋하지 마세요.
4. **고령자 UX**: 큰 버튼, 큰 폰트, 명확한 피드백 필수.

## 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `GOOGLE_AI_API_KEY`
- `NEXT_PUBLIC_BASE_URL`

## 라이선스

MIT License
