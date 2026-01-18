# 📚 사용자 매뉴얼

---

## 🚀 빠른 시작

```bash
# 1. 프로젝트 폴더에 .claude-pm 복사
mkdir my-project && cd my-project
cp -r /다운받은경로/.claude-pm .

# 2. Claude Code 실행 & 시작
claude
> .claude-pm/INIT-PROMPT.md 읽고 시작해줘
```

---

## 📁 .claude-pm/ 폴더 구조

```
.claude-pm/
├── INIT-PROMPT.md        ← 시작점
│
├── GUIDES/               ← 상세 가이드
│   ├── PLANNING.md       # 기획 방법
│   ├── TESTING.md        # 테스트/디버깅
│   ├── FEEDBACK-LOOP.md  # 피드백 루프 (중요!)
│   ├── CLAUDE-CODE-COMMANDS.md
│   └── EXTENSIONS.md     # MCP/플러그인
│
├── RULES/                ← 작업 규칙
│   ├── WORKFLOW.md
│   ├── CODE-QUALITY.md
│   ├── FILE-STRUCTURE.md
│   └── CONTEXT-RECOVERY.md
│
├── TEMPLATES/            ← 문서 템플릿
│
└── dashboard/            ← GUI 대시보드
```

---

## 🔄 협업 프로세스

### Phase 0: 아이디어
```
[사용자] 쇼핑몰 만들고 싶어

[Claude Code] GUIDES/PLANNING.md 참조 후:
- "어떤 상품 판매하나요?"
- "핵심 기능 3가지는?"
- "참고할 사이트 있나요?"
```

### Phase 1~2: 설계 & 계획
```
Claude Code가:
- 기술 스택 제안
- DB 스키마 설계
- API 설계
- 태스크 분해
- 문서 생성 (TEMPLATES/ 참조)
```

### Phase 3: 구현
```
Claude Code가:
- 코드 작성 (RULES/ 참조)
- 피드백 루프 (작성→검증→수정)
- 문서 업데이트
```

---

## 🔄 피드백 루프

```
작성 → 검증 → 수정 → 다음

📍 함수 작성 → 즉시 테스트
📍 API 작성 → curl 테스트
📍 서브태스크 → 품질 게이트
📍 태스크 → /review + 통합 테스트
```

---

## ⚡ 핵심 명령어

| 용도 | 명령어 |
|------|--------|
| 프로젝트 시작 | `.claude-pm/INIT-PROMPT.md 읽고 시작해줘` |
| 세션 복구 | `CLAUDE.md 읽어줘` |
| 진행 현황 | `PROGRESS.md 보여줘` |
| 코드 리뷰 | `/review src/` |
| 대화 압축 | `/compact` |

---

## 📊 상태 아이콘

| 아이콘 | 의미 |
|--------|------|
| ⏳ | 대기 |
| 🚀 | 진행 중 |
| 🔍 | 리뷰 |
| 🔥 | 블로커 |
| ✅ | 완료 |

---

## ❓ FAQ

**Q: 기존 프로젝트에도 적용 가능?**
> 네. .claude-pm/ 폴더만 복사하면 됩니다.

**Q: 규칙 수정해도 되나요?**
> 네. 프로젝트에 맞게 수정하세요.

**Q: 세션 끊기면?**
> `CLAUDE.md 읽어줘` 한 마디로 복구됩니다.

---

**Happy Building! 🚀**
