# 아키텍처 문서

> **프로젝트**: ReMemory
> **최종 업데이트**: 2025-01-18

---

## 시스템 개요

ReMemory는 AI 기반 회상치료 플랫폼으로, 조기치매/경도인지장애(MCI) 환자를 대상으로 인지 기능 평가 및 회상치료를 제공합니다.

**주요 특징**:
- 인증 없음 (UUID 세션 기반)
- 전문 의료기관 스타일 UI
- 고령자 친화적 UX

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16 | React 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| TailwindCSS | 4 | 스타일링 |
| Zustand | latest | 상태 관리 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js API Routes | 16 | REST API |
| Prisma | 5 | ORM |

### Database
| 기술 | 버전 | 용도 |
|------|------|------|
| SQLite | - | 개발 환경 DB |
| PostgreSQL | - | 배포 환경 DB (Supabase) |

### AI/ML
| 기술 | 용도 |
|------|------|
| TensorFlow.js | 브라우저 내 ML |
| MediaPipe | 얼굴/포즈 인식 |
| OpenAI API | GPT-4o-mini, Whisper, Vision |
| Google Gemini | 텍스트/이미지 생성 |

### Infrastructure
| 기술 | 용도 |
|------|------|
| Vercel | 배포 플랫폼 |
| Supabase Storage | 파일 저장 |

---

## 폴더 구조

```
Retrun_PoC/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes
│   │   ├── assessment/      # 인지 평가 페이지
│   │   ├── training/        # 훈련 모듈 페이지
│   │   ├── photos/          # 사진 관리 페이지
│   │   └── analytics/       # 분석 리포트 페이지
│   ├── components/
│   │   ├── ui/              # 공통 UI 컴포넌트
│   │   ├── assessment/      # 진단 관련 컴포넌트
│   │   ├── training/        # 훈련 관련 컴포넌트
│   │   ├── demos/           # 데모 재생 컴포넌트
│   │   └── reminiscence/    # 회상치료 컴포넌트
│   ├── hooks/               # Custom React Hooks
│   ├── lib/
│   │   ├── ai/              # AI API 함수
│   │   └── db/              # Prisma 클라이언트
│   ├── store/               # Zustand 상태 관리
│   ├── types/               # TypeScript 타입 정의
│   └── data/                # 정적 데이터 (문항, 더미 사진 등)
├── prisma/
│   └── schema.prisma        # DB 스키마
├── docs/                    # 프로젝트 문서
├── .claude-pm/              # Claude PM 가이드/규칙
└── public/                  # 정적 파일
```

### 폴더별 역할

| 폴더 | 역할 | 예시 |
|------|------|------|
| `src/app/api/` | REST API 엔드포인트 | `session/create/route.ts` |
| `src/components/ui/` | 재사용 가능 UI 컴포넌트 | `Button.tsx`, `Card.tsx` |
| `src/store/` | 전역 상태 관리 | `sessionStore.ts` |
| `src/hooks/` | 커스텀 훅 | `useFaceDetection.ts` |
| `src/lib/ai/` | AI API 통합 | `openai.ts`, `gemini.ts` |

---

## 데이터 흐름

```
[Client Browser]
       │
       ▼
[Next.js App Router] → 페이지 렌더링
       │
       ▼
[React Components] → UI 표시
       │
       ├── [Zustand Store] → 클라이언트 상태
       │         │
       │         └── [LocalStorage] → 세션 영속화
       │
       └── [API Routes] → 서버 요청
                │
                ▼
         [Prisma ORM]
                │
                ▼
          [Database]
```

---

## 데이터베이스 스키마

### 주요 테이블

#### Session
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | String | UUID (PK) |
| deviceInfo | String | 기기 정보 (JSON) |
| lastActiveAt | DateTime | 마지막 활동 시간 |
| createdAt | DateTime | 생성일 |

#### Assessment
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | String | UUID (PK) |
| sessionId | String | 세션 FK |
| totalScore | Int | 총점 (100점 만점) |
| riskLevel | String | 위험도 판정 |
| scores | String | 영역별 점수 (JSON) |
| completedAt | DateTime | 완료 시간 |

#### TrainingSession
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | String | UUID (PK) |
| sessionId | String | 세션 FK |
| type | String | 훈련 유형 |
| duration | Int | 소요 시간 (초) |
| metrics | String | 측정 지표 (JSON) |

#### Photo
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | String | UUID (PK) |
| sessionId | String | 세션 FK |
| url | String | 사진 URL |
| tags | String | AI 태깅 결과 (JSON) |
| memory | String | 연결된 기억 |

#### ReminiscenceLog
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | String | UUID (PK) |
| sessionId | String | 세션 FK |
| photoId | String | 사진 FK (선택) |
| dialogue | String | 대화 내용 (JSON) |
| emotions | String | 감정 분석 (JSON) |

### ERD (관계도)
```
Session (1) ──┬── (*) Assessment
              ├── (*) TrainingSession
              ├── (*) Photo
              └── (*) ReminiscenceLog
                         │
Photo (1) ────────── (*) ReminiscenceLog
```

---

## 인증/보안

### 인증 방식
- **방식**: 인증 없음 (UUID 세션)
- **토큰 저장**: LocalStorage
- **만료**: 없음 (브라우저 데이터 삭제 시 분실)

### 보안 조치
- [x] HTTPS 적용 (Vercel 자동)
- [x] CORS 설정
- [ ] Rate Limiting
- [x] Input Validation
- [x] SQL Injection 방지 (Prisma ORM)

### 주의사항
- 민감한 의료 데이터는 저장하지 않음
- 진단 결과는 참고용 (정식 의료 진단 아님)

---

## API 설계

### 세션 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/session/create` | 새 세션 생성 |
| GET | `/api/session/:id` | 세션 조회 |
| PATCH | `/api/session/:id` | 세션 업데이트 |

### 진단 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/assessment/submit` | 결과 저장 |
| POST | `/api/assessment/analyze` | AI 분석 |
| GET | `/api/assessment/history` | 이력 조회 |
| GET | `/api/assessment/:id` | 개별 결과 |
| DELETE | `/api/assessment/:id` | 결과 삭제 |

### 응답 형식
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

### 에러 형식
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

## 배포 구조

```
[GitHub Repository]
        │
        ▼ (Push to main)
[Vercel Build Pipeline]
        │
        ├── prisma generate
        ├── next build
        │
        ▼
[Vercel Edge Network]
        │
        └── [Supabase PostgreSQL]
```

### 환경별 설정
| 환경 | URL | DB |
|------|-----|-----|
| Development | localhost:3000 | SQLite (로컬) |
| Production | Vercel URL | Supabase PostgreSQL |

---

## 참고 사항

1. **Prisma 버전**: 7이 아닌 5 사용 (호환성 이슈)
2. **고령자 UX**: 큰 버튼 (56px+), 큰 폰트 (18-20px)
3. **의료 면책**: 모든 진단 결과는 참고용
4. **브라우저 호환**: Chrome, Edge, Safari (최신 버전)
