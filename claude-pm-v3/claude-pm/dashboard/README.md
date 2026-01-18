# 🖥️ Claude PM Dashboard

> 프로젝트 진행 상황을 실시간으로 모니터링하는 대시보드

---

## 📋 기능

1. **칸반보드**: 태스크를 Backlog → 진행중 → 리뷰 → 완료로 시각화
2. **진행률 표시**: 전체 진행률 바
3. **현재 작업**: 🚀 표시된 태스크 강조
4. **파일 변경 감지**: 최근 변경된 파일 목록 (서버 모드)

---

## 🚀 사용법

### 방법 1: 단순 모드 (HTML만)

서버 없이 바로 사용:

```bash
# 브라우저에서 열기
open index.html

# 또는 더블클릭으로 열기
```

1. `index.html`을 브라우저에서 열기
2. `PROGRESS.md` 파일을 드래그앤드롭
3. 칸반보드로 확인

> ⚠️ 이 모드에서는 자동 새로고침 안 됨. 수동으로 파일 다시 드롭 필요.

---

### 방법 2: 서버 모드 (실시간 감시)

파일 변경을 자동 감지:

```bash
# Node.js 필요
node watch-server.js /path/to/your/project

# 예시
node watch-server.js ~/my-project

# 현재 폴더
node watch-server.js .
```

브라우저에서 `http://localhost:3456` 접속

**기능:**
- PROGRESS.md 변경 → 자동 업데이트
- src/ 폴더 파일 변경 → 파일 목록 업데이트
- 실시간 SSE 연결

---

## 📁 파일 구조

```
dashboard/
├── index.html        # 대시보드 UI
├── watch-server.js   # 파일 감시 서버
└── README.md         # 이 문서
```

---

## 📊 PROGRESS.md 파싱 규칙

대시보드는 다음 패턴을 인식합니다:

```markdown
## Phase 1: 기반 구축

- [x] **TASK-001**: 프로젝트 설정 ✅
- [ ] **TASK-002**: DB 설계 🚀
- [ ] **TASK-003**: 인증 시스템 ⏳
- [ ] **TASK-004**: 결제 연동 🔥
```

### 상태 인식
| 아이콘 | 칸반 위치 |
|--------|----------|
| ⏳ (또는 없음) | Backlog |
| 🚀 | 진행 중 |
| 🔍 | 리뷰 |
| ✅ (또는 [x]) | 완료 |
| 🔥 | Backlog (블로커 표시) |

### 카테고리 자동 감지
태스크 이름에 따라 색상 구분:
- **Backend** (파랑): 기본
- **Frontend** (초록): UI, 프론트, 화면 포함
- **Database** (주황): DB, 데이터, 스키마 포함
- **Infra** (보라): 배포, 인프라, 설정 포함
- **Test** (빨강): 테스트, test 포함

---

## ⚙️ 설정

### 포트 변경
`watch-server.js` 상단의 `PORT` 변경:
```javascript
const PORT = 3456; // 원하는 포트로 변경
```

### 감시 폴더 변경
기본: `docs/PROGRESS.md`, `src/`

변경하려면 `watch-server.js` 수정:
```javascript
const progressPath = path.join(projectPath, 'docs', 'PROGRESS.md');
const srcPath = path.join(projectPath, 'src');
```

---

## 🔧 문제 해결

### Q: 파일 변경이 감지 안 됨
- 프로젝트 경로가 올바른지 확인
- `docs/PROGRESS.md` 파일이 존재하는지 확인

### Q: 브라우저에서 안 열림
- `http://localhost:3456` 확인
- 다른 프로세스가 포트 사용 중인지 확인

### Q: 카테고리가 잘못 감지됨
- 태스크 이름에 키워드 추가 (예: "[Backend]")
