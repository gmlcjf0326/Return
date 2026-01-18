# 📋 사전 기획 가이드

> 코딩 전에 충분히 기획하면 10배 빠르게 완성됩니다

---

## 🎯 기획의 목적

```
"1시간 기획 = 10시간 삽질 방지"

❌ Bad: 바로 코딩 → 수정 → 다시 수정 → 구조 변경 → 처음부터...
✅ Good: 충분히 기획 → 명확한 방향 → 효율적 구현 → 완성
```

---

## 📍 Phase 0: 아이디어 탐색

### 핵심 질문 (필수!)

```markdown
## 1. 무엇을 만드나요?
- 한 문장으로 설명하면?
- 핵심 가치/목적은?

## 2. 누가 사용하나요?
- 주요 사용자는?
- 사용자의 기술 수준은?
- 사용 환경은? (웹/모바일/데스크톱)

## 3. 왜 필요한가요?
- 해결하려는 문제는?
- 기존 대안은 없나요?
- 차별점은?

## 4. 핵심 기능 3가지는?
- 반드시 있어야 하는 것
- 있으면 좋은 것
- 나중에 추가할 것

## 5. 제약 사항은?
- 일정 (데드라인)
- 예산
- 기술 제약
- 외부 의존성
```

### 참고 사례 조사

```markdown
## 벤치마킹
- 비슷한 서비스 3개 이상 조사
- 각각의 장점/단점 분석
- 우리가 가져갈 것 / 다르게 할 것

## 예시
| 서비스 | 장점 | 단점 | 참고할 점 |
|--------|------|------|----------|
| A 서비스 | UI 깔끔 | 느림 | UI 패턴 |
| B 서비스 | 기능 많음 | 복잡함 | 핵심 기능 |
| C 서비스 | 빠름 | 디자인 별로 | 기술 스택 |
```

---

## 📍 Phase 1: 기능 정의

### 사용자 스토리

```markdown
## 사용자 스토리 작성

### 형식
"[사용자]로서, [행동]을 하고 싶다. 왜냐하면 [목적] 때문이다."

### 예시 (쇼핑몰)
- 고객으로서, 상품을 검색하고 싶다. 원하는 상품을 빨리 찾기 위해.
- 고객으로서, 장바구니에 담고 싶다. 여러 상품을 한번에 결제하기 위해.
- 관리자로서, 주문 현황을 보고 싶다. 배송 처리를 위해.
```

### 기능 목록 (Feature List)

```markdown
## 기능 분류

### 🔴 Must Have (필수)
- [ ] 회원가입/로그인
- [ ] 상품 목록/상세
- [ ] 장바구니
- [ ] 주문/결제

### 🟡 Should Have (중요)
- [ ] 상품 검색/필터
- [ ] 마이페이지
- [ ] 주문 내역

### 🟢 Could Have (있으면 좋음)
- [ ] 위시리스트
- [ ] 리뷰/평점
- [ ] 쿠폰

### ⚪ Won't Have (이번엔 안함)
- [ ] 실시간 채팅
- [ ] AI 추천
```

### 화면 흐름 (User Flow)

```
[메인] → [상품목록] → [상품상세] → [장바구니] → [주문] → [결제] → [완료]
                ↓
            [로그인] → [회원가입]
```

---

## 📍 Phase 2: 기술 설계

### 기술 스택 선정

```markdown
## 기술 스택 결정

### Frontend
| 옵션 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------------|
| React | 생태계 큼, 자료 많음 | 설정 필요 | 복잡한 SPA |
| Next.js | SSR, 풀스택 | 러닝커브 | SEO 중요 |
| Vue | 쉬움, 가벼움 | 생태계 작음 | 빠른 개발 |

### Backend
| 옵션 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------------|
| Node.js | JS 통일, 빠른 개발 | CPU 집약적 약함 | 실시간, API |
| Python | AI/ML, 읽기 쉬움 | 속도 | 데이터 처리 |
| Go | 성능, 동시성 | 생태계 | 고성능 API |

### Database
| 옵션 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------------|
| PostgreSQL | 기능 풍부, 안정적 | 설정 복잡 | 복잡한 쿼리 |
| MySQL | 쉬움, 빠름 | 기능 제한 | 일반적 용도 |
| MongoDB | 유연, 스케일 | 조인 약함 | 비정형 데이터 |

### 선정 이유 기록
"우리 프로젝트는 [이유]로 [기술]을 선택합니다."
```

### 아키텍처 설계

```markdown
## 시스템 구조도

### 단순 구조 (소규모)
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │ ──→ │  Server  │ ──→ │    DB    │
└──────────┘     └──────────┘     └──────────┘

### 확장 구조 (중규모)
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │ ──→ │   API    │ ──→ │    DB    │
└──────────┘     │  Server  │     └──────────┘
                 └──────────┘
                      │
                 ┌────┴────┐
                 ▼         ▼
            ┌────────┐ ┌────────┐
            │ Redis  │ │  S3    │
            │(캐시)  │ │(파일)  │
            └────────┘ └────────┘

### 폴더 구조
src/
├── config/       # 설정
├── controllers/  # 요청 처리
├── services/     # 비즈니스 로직
├── models/       # 데이터 모델
├── middlewares/  # 미들웨어
├── routes/       # 라우트
├── utils/        # 유틸리티
└── tests/        # 테스트
```

---

## 📍 Phase 3: 데이터 설계

### ERD (Entity Relationship Diagram)

```markdown
## ERD 예시 (쇼핑몰)

┌─────────────┐       ┌─────────────┐
│    Users    │       │  Products   │
├─────────────┤       ├─────────────┤
│ PK id       │       │ PK id       │
│    email    │       │    name     │
│    password │       │    price    │
│    name     │       │    stock    │
│    phone    │       │ FK category │
│    created  │       │    created  │
└─────────────┘       └─────────────┘
       │                     │
       │ 1:N                 │ 1:N
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   Orders    │       │ OrderItems  │
├─────────────┤       ├─────────────┤
│ PK id       │──1:N──│ PK id       │
│ FK user_id  │       │ FK order_id │
│    total    │       │ FK product  │
│    status   │       │    qty      │
│    created  │       │    price    │
└─────────────┘       └─────────────┘
```

### 테이블 스키마 상세

```markdown
## Users 테이블

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | SERIAL | PK | 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password | VARCHAR(255) | NOT NULL | 해시된 비밀번호 |
| name | VARCHAR(100) | NOT NULL | 이름 |
| phone | VARCHAR(20) | | 전화번호 |
| role | ENUM | DEFAULT 'user' | user/admin |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMP | | 수정일 |

### 인덱스
- idx_users_email (email)
- idx_users_created (created_at)

### 관계
- Orders (1:N)
- Cart (1:N)
```

---

## 📍 Phase 4: API 설계

### API 명세

```markdown
## API 엔드포인트

### 인증 API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /api/auth/register | 회원가입 | X |
| POST | /api/auth/login | 로그인 | X |
| POST | /api/auth/logout | 로그아웃 | O |
| GET | /api/auth/me | 내 정보 | O |

### 상품 API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | /api/products | 목록 | X |
| GET | /api/products/:id | 상세 | X |
| POST | /api/products | 등록 | Admin |
| PUT | /api/products/:id | 수정 | Admin |
| DELETE | /api/products/:id | 삭제 | Admin |
```

### API 상세 명세

```markdown
## POST /api/auth/register

### 설명
새로운 사용자를 등록합니다.

### 요청
Headers:
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678"
}

### 응답

성공 (201):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}

실패 (400):
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "이미 사용 중인 이메일입니다."
  }
}

### 테스트 방법
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"테스트"}'
```

---

## 📍 Phase 5: 테스트 계획

### 테스트 전략

```markdown
## 테스트 종류

### 단위 테스트 (Unit)
- 개별 함수/메서드 테스트
- 도구: Jest, Mocha
- 커버리지 목표: 80%+

### 통합 테스트 (Integration)
- API 엔드포인트 테스트
- DB 연동 테스트
- 도구: Supertest

### E2E 테스트 (End-to-End)
- 전체 시나리오 테스트
- 도구: Cypress, Playwright
```

### 테스트 시나리오

```markdown
## 테스트 케이스: 회원가입

### TC-001: 정상 회원가입
- 입력: 유효한 이메일, 비밀번호, 이름
- 예상: 201 Created, 사용자 정보 반환
- 검증: DB에 사용자 생성됨

### TC-002: 중복 이메일
- 입력: 이미 존재하는 이메일
- 예상: 400 Bad Request, DUPLICATE_EMAIL
- 검증: DB 변경 없음

### TC-003: 잘못된 이메일 형식
- 입력: "invalid-email"
- 예상: 400 Bad Request, INVALID_EMAIL
- 검증: DB 변경 없음

### TC-004: 비밀번호 너무 짧음
- 입력: password = "123"
- 예상: 400 Bad Request, PASSWORD_TOO_SHORT
- 검증: DB 변경 없음
```

---

## ✅ 기획 체크리스트

### Phase 0: 아이디어
- [ ] 핵심 질문 5가지 답변 완료
- [ ] 벤치마킹 3개 이상

### Phase 1: 기능
- [ ] 사용자 스토리 작성
- [ ] 기능 우선순위 분류 (Must/Should/Could/Won't)
- [ ] 화면 흐름 정의

### Phase 2: 기술
- [ ] 기술 스택 선정 및 이유
- [ ] 아키텍처 다이어그램
- [ ] 폴더 구조

### Phase 3: 데이터
- [ ] ERD 작성
- [ ] 테이블 스키마 상세
- [ ] 인덱스 전략

### Phase 4: API
- [ ] 엔드포인트 목록
- [ ] 요청/응답 형식
- [ ] 에러 코드

### Phase 5: 테스트
- [ ] 테스트 전략
- [ ] 주요 테스트 시나리오
- [ ] 테스트 데이터

---

## 📝 산출물

기획이 완료되면 다음 문서들이 준비됩니다:

```
docs/
├── REQUIREMENTS.md    # 요구사항 정의
├── ARCHITECTURE.md    # 아키텍처 설계
├── SCHEMA.md          # DB 스키마
├── API.md             # API 명세
├── TEST-PLAN.md       # 테스트 계획
└── PROGRESS.md        # 태스크 목록
```

이 문서들이 준비되면 구현을 시작합니다! 🚀
