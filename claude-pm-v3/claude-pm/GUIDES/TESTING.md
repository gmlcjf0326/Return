# 🧪 테스트 & 디버깅 가이드

> 작동하는 코드 = 테스트된 코드

---

## 🎯 테스트 철학

```
"테스트 없이 완료했다" = "완료 안 했다"

✅ 각 기능마다 테스트 방법이 명확해야 함
✅ 누구나 같은 방법으로 테스트할 수 있어야 함
✅ 실패 시 원인을 빠르게 찾을 수 있어야 함
```

---

## 📋 테스트 종류

### 1. 단위 테스트 (Unit Test)

```javascript
// 개별 함수 테스트
// tests/unit/userService.test.js

const { validateEmail } = require('../../src/services/userService');

describe('validateEmail', () => {
  test('유효한 이메일 - true 반환', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('@ 없는 이메일 - false 반환', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  test('빈 문자열 - false 반환', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### 2. 통합 테스트 (Integration Test)

```javascript
// API 엔드포인트 테스트
// tests/integration/auth.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/auth/register', () => {
  test('정상 회원가입', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@test.com',
        password: 'password123',
        name: '테스트'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('newuser@test.com');
  });

  test('중복 이메일 - 400 에러', async () => {
    // 먼저 사용자 생성
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'pass123', name: 'A' });

    // 같은 이메일로 다시 시도
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'pass456', name: 'B' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });
});
```

### 3. E2E 테스트 (End-to-End)

```javascript
// 전체 시나리오 테스트
// tests/e2e/purchase.spec.js (Cypress)

describe('상품 구매 플로우', () => {
  it('로그인 → 상품선택 → 장바구니 → 결제', () => {
    // 1. 로그인
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');

    // 2. 상품 선택
    cy.get('.product-card').first().click();
    cy.get('.add-to-cart').click();
    cy.get('.cart-count').should('contain', '1');

    // 3. 장바구니 확인
    cy.visit('/cart');
    cy.get('.cart-item').should('have.length', 1);

    // 4. 결제 진행
    cy.get('.checkout-btn').click();
    cy.get('.order-summary').should('be.visible');
  });
});
```

---

## 🛠️ 테스트 환경 설정

### Jest 설정

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['./tests/setup.js']
};
```

### 테스트 DB 설정

```javascript
// tests/setup.js
const { Pool } = require('pg');

const testDb = new Pool({
  connectionString: process.env.TEST_DATABASE_URL
});

beforeAll(async () => {
  // 테스트 DB 초기화
  await testDb.query('DELETE FROM order_items');
  await testDb.query('DELETE FROM orders');
  await testDb.query('DELETE FROM cart');
  await testDb.query('DELETE FROM users');
});

afterAll(async () => {
  await testDb.end();
});

module.exports = { testDb };
```

### package.json 스크립트

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "cypress run",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📝 테스트 문서화

### 각 API별 테스트 방법

```markdown
## POST /api/products (상품 등록)

### 테스트 환경
- Admin 권한 필요
- 테스트 토큰: `test-admin-token`

### 테스트 명령어

```bash
# 정상 등록
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer test-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 상품",
    "price": 10000,
    "stock": 100,
    "category_id": 1
  }'

# 예상 응답: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "name": "테스트 상품",
    "price": 10000
  }
}
```

### 에러 케이스

| 상황 | 응답 코드 | 에러 코드 |
|------|----------|----------|
| 토큰 없음 | 401 | UNAUTHORIZED |
| 권한 없음 | 403 | FORBIDDEN |
| 필수 필드 누락 | 400 | MISSING_FIELD |
| 잘못된 가격 | 400 | INVALID_PRICE |
```

### 테스트 데이터 (Seed)

```javascript
// tests/seed.js

const seedData = {
  users: [
    {
      email: 'admin@test.com',
      password: 'hashed_password',
      name: '관리자',
      role: 'admin'
    },
    {
      email: 'user@test.com',
      password: 'hashed_password',
      name: '일반유저',
      role: 'user'
    }
  ],
  products: [
    {
      name: '테스트 상품 1',
      price: 10000,
      stock: 100,
      category_id: 1
    },
    {
      name: '테스트 상품 2',
      price: 20000,
      stock: 50,
      category_id: 2
    }
  ],
  categories: [
    { id: 1, name: '의류' },
    { id: 2, name: '전자제품' }
  ]
};

module.exports = seedData;
```

---

## 🔍 디버깅 전략

### 1. 로깅 시스템

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 2. 요청/응답 로깅

```javascript
// src/middlewares/requestLogger.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // 요청 로그
  logger.info('Request', {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    ip: req.ip
  });

  // 응답 로그 (응답 완료 후)
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Response', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

module.exports = requestLogger;
```

### 3. 에러 핸들링

```javascript
// src/middlewares/errorHandler.js
const logger = require('../utils/logger');

// 에러 코드 정의
const ErrorCodes = {
  // 인증 관련
  UNAUTHORIZED: { status: 401, message: '인증이 필요합니다.' },
  INVALID_TOKEN: { status: 401, message: '유효하지 않은 토큰입니다.' },
  FORBIDDEN: { status: 403, message: '권한이 없습니다.' },

  // 입력 검증
  MISSING_FIELD: { status: 400, message: '필수 필드가 누락되었습니다.' },
  INVALID_EMAIL: { status: 400, message: '유효하지 않은 이메일입니다.' },
  DUPLICATE_EMAIL: { status: 400, message: '이미 사용 중인 이메일입니다.' },

  // 리소스
  NOT_FOUND: { status: 404, message: '리소스를 찾을 수 없습니다.' },
  OUT_OF_STOCK: { status: 400, message: '재고가 부족합니다.' },

  // 서버 에러
  INTERNAL_ERROR: { status: 500, message: '서버 오류가 발생했습니다.' },
  DB_ERROR: { status: 500, message: '데이터베이스 오류가 발생했습니다.' }
};

// 커스텀 에러 클래스
class AppError extends Error {
  constructor(code, details = null) {
    super(ErrorCodes[code]?.message || code);
    this.code = code;
    this.status = ErrorCodes[code]?.status || 500;
    this.details = details;
  }
}

// 에러 핸들러 미들웨어
const errorHandler = (err, req, res, next) => {
  // 로깅
  logger.error('Error', {
    code: err.code,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // 응답
  const status = err.status || 500;
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || '서버 오류가 발생했습니다.'
    }
  };

  // 개발 환경에서는 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = err.details;
  }

  res.status(status).json(response);
};

module.exports = { AppError, ErrorCodes, errorHandler };
```

### 4. 디버그 모드

```javascript
// src/config/debug.js

const debug = {
  // SQL 쿼리 로깅
  logQueries: process.env.DEBUG_SQL === 'true',

  // 요청 바디 로깅
  logRequestBody: process.env.DEBUG_REQUEST === 'true',

  // 성능 측정
  measurePerformance: process.env.DEBUG_PERF === 'true'
};

// 쿼리 로깅 예시
const logQuery = (query, params) => {
  if (debug.logQueries) {
    console.log('\n📊 SQL Query:');
    console.log(query);
    console.log('Params:', params);
    console.log('');
  }
};

module.exports = { debug, logQuery };
```

### 5. 헬스체크 엔드포인트

```javascript
// src/routes/health.js
const router = require('express').Router();
const db = require('../config/database');

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };

  // DB 연결 체크
  try {
    await db.query('SELECT 1');
    health.checks.database = 'ok';
  } catch (err) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // 메모리 체크
  const used = process.memoryUsage();
  health.checks.memory = {
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`
  };

  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

module.exports = router;
```

---

## 📊 테스트 체크리스트

### 기능 구현 후

```markdown
- [ ] 정상 케이스 테스트
- [ ] 에러 케이스 테스트 (최소 3개)
- [ ] 경계값 테스트
- [ ] 권한 테스트 (필요시)
- [ ] 테스트 명령어 문서화
```

### API 구현 후

```markdown
- [ ] curl 명령어로 수동 테스트
- [ ] 통합 테스트 코드 작성
- [ ] 에러 응답 형식 확인
- [ ] 인증/인가 테스트
```

### 배포 전

```markdown
- [ ] 전체 테스트 통과 (npm test)
- [ ] 커버리지 80% 이상
- [ ] E2E 테스트 통과
- [ ] 헬스체크 엔드포인트 동작
```

---

## 🔧 디버깅 도구

### 브라우저
- Chrome DevTools (Network, Console)
- React DevTools
- Redux DevTools

### 백엔드
- Postman / Insomnia (API 테스트)
- pgAdmin (PostgreSQL)
- Redis Commander

### 모니터링
- PM2 (프로세스 모니터)
- Datadog / New Relic

### 로그 분석
```bash
# 에러 로그만 보기
tail -f logs/error.log

# 특정 패턴 검색
grep "ERROR" logs/combined.log

# 실시간 로그 + 필터
tail -f logs/combined.log | grep "api/auth"
```
