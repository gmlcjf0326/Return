# 📁 파일 구조 규칙 (FILE-STRUCTURE)

> 파일 크기 관리 및 분할 규칙

---

## 📏 파일 크기 기준

| 파일 유형 | 권장 | 허용 | 주의 | 분할 필요 |
|----------|------|------|------|----------|
| 코드 파일 | ~200줄 | ~300줄 | ~400줄 | 500줄+ |
| 컴포넌트 | ~150줄 | ~250줄 | ~350줄 | 400줄+ |
| MD 문서 | ~200줄 | ~300줄 | ~400줄 | 500줄+ |
| 설정 파일 | ~50줄 | ~100줄 | ~150줄 | 200줄+ |

### 기준 설명
```
권장: 이상적인 크기, 한눈에 파악 가능
허용: 복잡한 로직은 이 정도 필요할 수 있음
주의: 분할을 고려하되, 연관 코드면 유지 가능
분할 필요: 거의 반드시 분할해야 함
```

> 💡 **핵심 원칙**: 줄 수보다 **"한 파일 = 한 책임"**이 더 중요

---

## 🔄 분할이 필요한 신호

### 코드 파일
```
✓ 파일이 400줄을 초과 (500줄 이상이면 필수)
✓ 한 파일에 관련 없는 기능이 섞임
✓ import가 15개 이상
✓ 스크롤이 과도하게 필요
✓ "한 파일 = 한 책임" 원칙 위반
```

### 컴포넌트
```
✓ 렌더링 로직이 200줄 초과
✓ 3개 이상의 독립적 UI 영역
✓ 재사용 가능한 부분이 보임
✓ 상태 관리가 복잡해짐
```

---

## 📂 분할 패턴

### 패턴 1: 기능별 분할
```
# Before: user.js (600줄) → 분할 필요
- 유저 생성
- 유저 조회
- 유저 수정
- 유저 삭제
- 유저 검색
- 유저 통계

# After:
users/
├── index.js          # export만 (30줄)
├── create.js         # 생성 (80줄)
├── read.js           # 조회 (70줄)
├── update.js         # 수정 (90줄)
├── delete.js         # 삭제 (50줄)
├── search.js         # 검색 (100줄)
└── stats.js          # 통계 (120줄)
```

### 패턴 2: 계층별 분할
```
# Before: auth-controller.js (500줄) → 분할 필요
- 라우트 핸들러
- 비즈니스 로직
- DB 쿼리
- 유효성 검사

# After:
auth/
├── controller.js     # 라우트 핸들러 (120줄)
├── service.js        # 비즈니스 로직 (150줄)
├── repository.js     # DB 쿼리 (100줄)
└── validator.js      # 유효성 검사 (80줄)
```

### 패턴 3: 컴포넌트 분할
```
# Before: Dashboard.jsx (450줄) → 분할 필요
- 헤더
- 사이드바
- 메인 콘텐츠
- 푸터
- 모달

# After:
Dashboard/
├── index.jsx         # 메인 컴포넌트 (80줄)
├── Header.jsx        # 헤더 (60줄)
├── Sidebar.jsx       # 사이드바 (100줄)
├── Content.jsx       # 메인 콘텐츠 (120줄)
├── Footer.jsx        # 푸터 (40줄)
└── Modal.jsx         # 모달 (70줄)
```

---

## 📋 문서 분할 패턴

### PROGRESS.md가 300줄 초과 시
```
# Before: PROGRESS.md (500줄)

# After:
docs/
├── PROGRESS.md           # 현재 Phase만 (150줄)
└── ARCHIVES/
    ├── PHASE-1.md        # 완료된 Phase 1
    └── PHASE-2.md        # 완료된 Phase 2
```

### PRD가 길어질 때
```
# Before: PRD.md (1000줄)

# After:
PRD/
├── _INDEX.md             # 목차 (30줄)
├── 01-OVERVIEW.md        # 개요 (100줄)
├── 02-FEATURES.md        # 기능 (200줄)
├── 03-TECHNICAL.md       # 기술 (200줄)
└── 04-UI.md              # UI/UX (150줄)
```

---

## ✅ 분할 체크리스트

분할 전 확인:
```markdown
- [ ] 분할 후 각 파일이 독립적으로 이해 가능한가
- [ ] 순환 참조가 발생하지 않는가
- [ ] import 경로가 복잡해지지 않는가
- [ ] 관련 코드가 너무 멀리 떨어지지 않는가
```

분할 후 확인:
```markdown
- [ ] 기존 기능이 정상 동작하는가
- [ ] index.js에서 적절히 export하는가
- [ ] 다른 파일의 import가 업데이트되었는가
```

---

## 📁 폴더 구조 예시

### 소규모 프로젝트
```
src/
├── index.js
├── config.js
├── routes.js
├── controllers/
├── services/
└── utils/
```

### 중규모 프로젝트
```
src/
├── config/
├── modules/
│   ├── auth/
│   │   ├── controller.js
│   │   ├── service.js
│   │   └── routes.js
│   ├── users/
│   └── products/
├── shared/
│   ├── middlewares/
│   └── utils/
└── index.js
```

### 대규모 프로젝트
```
src/
├── config/
├── core/              # 핵심 인프라
├── modules/           # 도메인별 모듈
│   ├── auth/
│   ├── users/
│   ├── products/
│   └── orders/
├── shared/            # 공유 코드
├── infrastructure/    # 외부 서비스 연동
└── index.js
```

---

## ⚠️ 주의사항

### 과도한 분할 피하기
```
❌ Bad: 30줄짜리 파일 20개
✅ Good: 150줄짜리 파일 4개

핵심: 연관된 코드는 함께 있는 게 나음
```

### 논리적 그룹 유지
```
❌ Bad: 관련 함수가 5개 파일에 분산
✅ Good: 관련 함수가 1-2개 파일에 모임
```

### 분할 이유 기록
```javascript
// 파일 상단에 기록
/**
 * @file user-validation.js
 * @description user.js에서 분리 - 유효성 검사 로직만 담당
 * @see user.js, user-service.js
 */
```

### 분할 판단 기준
```
Q: 이 파일을 분할해야 할까?

체크리스트:
□ 500줄 이상인가? → 분할 필요
□ 400줄 이상이고 여러 책임이 섞여 있나? → 분할 고려
□ 300줄 이하이고 한 가지 일만 하나? → 분할 불필요
□ 분할하면 파일이 너무 작아지나? → 분할 불필요
```
