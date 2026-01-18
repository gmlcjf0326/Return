# 🔌 확장 기능 활용 가이드

> Claude Code의 MCP, 스킬, 플러그인을 프로젝트에 활용하는 방법

---

## 📋 확장 기능 개요

| 기능 | 설명 | 활용 |
|------|------|------|
| **MCP** | Model Context Protocol - 외부 도구 연동 | DB, 파일시스템, API 연동 |
| **스킬** | Claude의 특화 기능 | 문서 생성, 코드 분석 |
| **플러그인** | 프로젝트별 커스텀 확장 | 자동화, 워크플로우 |

---

## 🔧 MCP (Model Context Protocol) 활용

### 주요 MCP 서버

| MCP 서버 | 용도 | 예시 |
|----------|------|------|
| `filesystem` | 파일 읽기/쓰기 | 프로젝트 파일 관리 |
| `github` | GitHub 연동 | PR, 이슈 관리 |
| `postgres` | PostgreSQL 연동 | DB 쿼리, 스키마 관리 |
| `sqlite` | SQLite 연동 | 로컬 DB 작업 |
| `puppeteer` | 브라우저 자동화 | 테스트, 스크래핑 |
| `slack` | Slack 연동 | 알림, 메시지 |

### MCP 설정 예시

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem", "/path/to/project"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

### 프로젝트에서 MCP 활용

```markdown
# CLAUDE.md에 MCP 정보 추가

## 🔌 활성화된 MCP

| MCP | 용도 | 사용 예시 |
|-----|------|----------|
| filesystem | 프로젝트 파일 | 파일 생성/수정 |
| github | 버전 관리 | PR 생성, 이슈 관리 |
| postgres | DB 연동 | 쿼리 실행, 마이그레이션 |

## MCP 사용 규칙
- DB 변경 전 백업 확인
- GitHub PR은 리뷰 후 머지
- 파일 삭제는 확인 후 진행
```

---

## 🎯 스킬 활용

### Claude Code 기본 스킬

| 스킬 | 설명 | 활용 |
|------|------|------|
| 코드 생성 | 다양한 언어 코드 작성 | 기능 구현 |
| 코드 분석 | 버그 찾기, 리팩토링 | 코드 리뷰 |
| 문서 생성 | MD, 문서 작성 | README, API 문서 |
| 테스트 작성 | 단위/통합 테스트 | 테스트 코드 |
| 디버깅 | 에러 분석, 해결 | 버그 수정 |

### 스킬 요청 예시

```
[코드 생성]
"사용자 인증 API를 만들어줘. JWT 사용하고, 
회원가입/로그인/토큰갱신 기능 포함해줘"

[코드 분석]
"이 파일에서 성능 문제나 버그가 있는지 분석해줘"

[문서 생성]
"이 API들의 Swagger 문서를 만들어줘"

[테스트 작성]
"이 서비스의 단위 테스트를 Jest로 작성해줘"

[디버깅]
"이 에러가 왜 발생하는지 분석하고 해결해줘:
[에러 메시지]"
```

---

## 🧩 플러그인 시스템

### 플러그인 종류

| 유형 | 설명 | 예시 |
|------|------|------|
| **자동화** | 반복 작업 자동화 | 배포, 테스트 실행 |
| **통합** | 외부 서비스 연동 | Jira, Notion, Figma |
| **생성기** | 코드/문서 생성 | 컴포넌트, API 생성 |
| **분석기** | 코드/성능 분석 | 린트, 번들 분석 |

### 커스텀 명령어 정의

```markdown
# CLAUDE.md에 커스텀 명령어 추가

## 🎮 커스텀 명령어

### /deploy
배포 프로세스 실행
1. 테스트 실행
2. 빌드
3. Vercel 배포
4. Slack 알림

### /test
테스트 실행
1. Jest 단위 테스트
2. Cypress E2E 테스트
3. 결과 리포트 생성

### /review
코드 리뷰
1. ESLint 검사
2. 타입 체크
3. 보안 취약점 검사
4. 리뷰 리포트 생성

### /docs
문서 자동 생성
1. API 문서 (Swagger)
2. 컴포넌트 문서 (Storybook)
3. README 업데이트
```

### 플러그인 설정 파일

```json
// .claude-pm/plugins.json
{
  "plugins": [
    {
      "name": "auto-deploy",
      "trigger": "TASK 완료 시",
      "actions": ["test", "build", "deploy"]
    },
    {
      "name": "github-sync",
      "trigger": "매 태스크 완료",
      "actions": ["commit", "push"]
    },
    {
      "name": "slack-notify",
      "trigger": "Phase 완료 시",
      "actions": ["send-summary"]
    }
  ]
}
```

---

## 🔄 워크플로우 자동화

### Git 자동화

```markdown
## Git 규칙 (CLAUDE.md에 추가)

### 커밋 컨벤션
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 변경
- refactor: 리팩토링
- test: 테스트 추가

### 브랜치 전략
- main: 배포용
- develop: 개발용
- feature/TASK-XXX: 기능별

### 자동 커밋 규칙
- 서브태스크 완료 시 자동 커밋
- 커밋 메시지: "feat(TASK-XXX): 서브태스크 설명"
```

### CI/CD 연동

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install
        run: npm ci
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
```

---

## 📊 프로젝트 유형별 확장 설정

### 웹 프론트엔드 (React/Next.js)

```markdown
## 확장 설정

### MCP
- filesystem: 파일 관리
- puppeteer: E2E 테스트

### 스킬 활용
- 컴포넌트 생성
- 스타일링 (Tailwind)
- 상태 관리 (Zustand/Redux)

### 커스텀 명령어
- /component [name]: 컴포넌트 생성
- /page [name]: 페이지 생성
- /hook [name]: 커스텀 훅 생성
```

### 백엔드 API (Node.js/Express)

```markdown
## 확장 설정

### MCP
- postgres: DB 연동
- filesystem: 파일 관리

### 스킬 활용
- API 엔드포인트 생성
- DB 모델/마이그레이션
- 인증/인가

### 커스텀 명령어
- /api [resource]: CRUD API 생성
- /model [name]: 모델 생성
- /migrate: 마이그레이션 실행
```

### 풀스택 (쇼핑몰 등)

```markdown
## 확장 설정

### MCP
- postgres: DB
- github: 버전 관리
- slack: 알림

### 스킬 활용
- 프론트/백엔드 모두
- 결제 연동
- 배포

### 커스텀 명령어
- /feature [name]: 기능 전체 생성 (API + UI)
- /deploy: 배포
- /backup: DB 백업
```

---

## ⚠️ 주의사항

### MCP 사용 시
```
✅ 민감한 정보는 환경 변수로
✅ DB 작업 전 백업 확인
✅ 프로덕션 환경 분리
❌ API 키 하드코딩 금지
❌ 프로덕션 DB 직접 수정 금지
```

### 자동화 시
```
✅ 테스트 통과 후 배포
✅ 롤백 계획 수립
✅ 로그 모니터링
❌ 테스트 없이 자동 배포 금지
❌ main 브랜치 직접 푸시 금지
```
