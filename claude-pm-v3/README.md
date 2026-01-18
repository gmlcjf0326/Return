# 🚀 Claude PM Optimal v3

> Claude Code와 협업하여 최고 품질의 소프트웨어를 만드는 가이드

---

## 📦 패키지 구조

```
claude-pm-v3/
├── README.md
├── USER-MANUAL.md
│
└── .claude-pm/              ← 프로젝트에 복사할 폴더
    ├── INIT-PROMPT.md       # 시작점
    ├── GUIDES/              # 상세 가이드
    ├── RULES/               # 작업 규칙
    ├── TEMPLATES/           # 문서 템플릿
    └── dashboard/           # GUI 대시보드
```

---

## 🚀 시작하기

```bash
# 1. 프로젝트 폴더 생성
mkdir my-project
cd my-project

# 2. .claude-pm 폴더 복사
cp -r /다운받은경로/claude-pm-v3/.claude-pm .

# 3. Claude Code 실행
claude

# 4. 시작!
> .claude-pm/INIT-PROMPT.md 읽고 시작해줘
```

---

## 📁 프로젝트 구조 변화

### 복사 직후
```
my-project/
└── .claude-pm/
    ├── INIT-PROMPT.md
    ├── GUIDES/
    ├── RULES/
    └── TEMPLATES/
```

### 기획 완료 후 (Claude Code가 생성)
```
my-project/
├── .claude-pm/           ← 규칙/가이드 (참조용)
├── CLAUDE.md             ← 프로젝트 개요
├── docs/
│   ├── PROGRESS.md       ← 진행 현황
│   ├── ARCHITECTURE.md   ← 기술 구조
│   └── ...
└── src/                  ← 소스 코드
```

---

## 📋 Claude Code가 참조하는 파일

| 시점 | 참조 파일 |
|------|----------|
| 프로젝트 시작 | `INIT-PROMPT.md` → `GUIDES/PLANNING.md` |
| 기획/설계 | `GUIDES/PLANNING.md` |
| 문서 생성 | `TEMPLATES/` |
| 코드 작성 | `RULES/CODE-QUALITY.md` |
| 테스트/검증 | `GUIDES/TESTING.md`, `GUIDES/FEEDBACK-LOOP.md` |
| 세션 복구 | `RULES/CONTEXT-RECOVERY.md` |

---

## ⚡ 핵심 명령어

```bash
# 프로젝트 시작
> .claude-pm/INIT-PROMPT.md 읽고 시작해줘

# 세션 복구
> CLAUDE.md 읽어줘

# 진행 현황
> PROGRESS.md 보여줘
```

---

## 🔄 협업 프로세스

```
Phase 0: 아이디어 → 질문 & 대화
Phase 1: 기술 설계 → 스택, DB, API
Phase 2: 상세 계획 → 태스크 분해
Phase 3: 구현 → 피드백 루프 (작성→검증→수정)
```

---

**함께 최고의 결과물을 만들어봅시다! 🚀**
