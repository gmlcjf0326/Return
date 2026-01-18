# 🎯 코드 품질 규칙 (CODE-QUALITY)

> Claude Code가 항상 고품질 코드를 작성하기 위한 규칙

---

## 📏 코드 작성 원칙

### 1. 함수/메서드 규칙
```
✅ 단일 책임: 하나의 함수는 하나의 일만
✅ 적정 길이: 20-30줄 권장, 50줄 이하 유지
✅ 명확한 이름: 동사 + 목적어 (getUserById, validateEmail)
✅ 파라미터: 3개 이하 권장 (초과 시 객체로)
✅ 복잡한 로직: 100줄까지 허용 (단, 주석으로 섹션 구분)
```

### 2. 파일 구조 규칙
```
✅ 파일당 200줄 권장, 300줄 허용, 500줄 이상 분할
✅ 한 파일 = 한 모듈/컴포넌트 (단일 책임)
✅ index.js는 export만 담당
✅ 연관된 코드는 함께 유지 (과도한 분할 피하기)
```

### 3. 네이밍 규칙
```javascript
// 변수: 명사, camelCase
const userData = {};
const isLoggedIn = true;

// 함수: 동사, camelCase
function fetchUserData() {}
function handleSubmit() {}

// 클래스/컴포넌트: 명사, PascalCase
class UserService {}
function LoginForm() {}

// 상수: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '...';

// 파일명
user-service.js    // kebab-case (일반)
UserService.js     // PascalCase (클래스/컴포넌트)
```

---

## 🔧 필수 코드 패턴

### 에러 핸들링
```javascript
// ✅ Good: 명확한 에러 처리
async function fetchUser(id) {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ❌ Bad: 에러 무시
async function fetchUser(id) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

### 설정 분리
```javascript
// ✅ Good: 설정 파일 분리
// config/database.js
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
};

// ❌ Bad: 하드코딩
const connection = mysql.connect({
  host: 'localhost',
  port: 5432,
});
```

### 조건문 단순화
```javascript
// ✅ Good: Early return
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  
  return user.name;
}

// ❌ Bad: 중첩 조건문
function processUser(user) {
  if (user) {
    if (user.isActive) {
      return user.name;
    }
  }
  return null;
}
```

---

## ✅ 태스크 완료 전 체크리스트

### 필수 확인
```markdown
- [ ] 코드가 의도대로 동작하는가
- [ ] 에러 핸들링이 적절한가
- [ ] 하드코딩된 값이 없는가
- [ ] 콘솔 로그가 정리되었는가 (디버그용 제거)
```

### 권장 확인
```markdown
- [ ] 함수가 너무 길지 않은가 (50줄 이하)
- [ ] 중복 코드가 없는가
- [ ] 네이밍이 명확한가
- [ ] 주석이 필요한 곳에 있는가
```

### 테스트 (해당되는 경우)
```markdown
- [ ] 주요 함수에 테스트가 있는가
- [ ] 엣지 케이스를 고려했는가
- [ ] 테스트가 통과하는가
```

---

## 📁 프로젝트 구조 표준

### Backend (Node.js)
```
src/
├── config/           # 설정 파일
├── controllers/      # 요청 처리 (라우터 핸들러)
├── services/         # 비즈니스 로직
├── models/           # 데이터 모델
├── middlewares/      # 미들웨어
├── utils/            # 유틸리티 함수
├── routes/           # 라우트 정의
└── index.js          # 진입점
```

### Frontend (React)
```
src/
├── components/       # 재사용 컴포넌트
│   └── common/       # 공통 컴포넌트
├── pages/            # 페이지 컴포넌트
├── hooks/            # 커스텀 훅
├── services/         # API 호출
├── utils/            # 유틸리티
├── styles/           # 스타일
└── App.jsx           # 루트 컴포넌트
```

---

## 🚫 피해야 할 패턴

### 1. God Object
```javascript
// ❌ 하나의 클래스/파일이 모든 것을 담당
class AppManager {
  handleAuth() {}
  handleDatabase() {}
  handleUI() {}
  handleNetwork() {}
  // ... 500줄
}
```

### 2. Magic Numbers
```javascript
// ❌ Bad
if (status === 1) { ... }
setTimeout(fn, 86400000);

// ✅ Good
const STATUS_ACTIVE = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
if (status === STATUS_ACTIVE) { ... }
setTimeout(fn, ONE_DAY_MS);
```

### 3. 과도한 주석
```javascript
// ❌ Bad: 코드가 하는 일을 그대로 설명
// i를 1 증가시킨다
i++;

// ✅ Good: 왜 이렇게 하는지 설명
// 재시도 카운터 증가 (최대 3회까지 허용)
retryCount++;
```

---

## 📝 코드 리뷰 자체 점검

작업 완료 전, 스스로 확인:

```
1. 이 코드를 처음 보는 사람이 이해할 수 있는가?
2. 6개월 후 내가 이 코드를 보면 이해할 수 있는가?
3. 비슷한 기능을 추가할 때 쉽게 확장할 수 있는가?
4. 버그가 발생하면 원인을 찾기 쉬운가?
```
