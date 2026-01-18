# Re:turn 배포 가이드

## 🚀 Vercel 배포 (권장)

### 1. 사전 준비

#### 필수 서비스 가입
1. **Vercel** - https://vercel.com (GitHub 연동)
2. **Supabase** - https://supabase.com (무료 PostgreSQL)
3. **OpenAI** - https://platform.openai.com (API 키 필요)

### 2. Supabase 설정

1. Supabase에서 새 프로젝트 생성
2. **Project Settings > Database**에서 연결 정보 확인:
   - `DATABASE_URL`: Connection String (Pooler)
   - `DIRECT_URL`: Connection String (Direct)

```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

3. **Storage** 버킷 생성 (사진 업로드용):
   - 버킷 이름: `photos`
   - Public 버킷으로 설정

### 3. Vercel 배포

#### 방법 1: Vercel Dashboard
1. https://vercel.com/new 접속
2. GitHub 저장소 import
3. 환경 변수 설정:
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Deploy 클릭

#### 방법 2: Vercel CLI
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포 (처음)
vercel

# 프로덕션 배포
vercel --prod
```

### 4. 데이터베이스 마이그레이션

배포 후 Prisma 마이그레이션 실행:

```bash
# 로컬에서 Supabase DB에 연결하여 마이그레이션
DATABASE_URL="postgresql://..." npx prisma db push
```

또는 Vercel에서 자동 실행 (vercel.json의 buildCommand에 포함됨)

### 5. 환경 변수 상세

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 연결 문자열 (Pooler) |
| `DIRECT_URL` | ✅ | PostgreSQL 직접 연결 문자열 |
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⚠️ | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Supabase 서비스 역할 키 |

⚠️ = 사진 업로드 기능 사용 시 필수

---

## 🛠️ 로컬 개발 환경

### SQLite 사용 (간단)

1. `prisma/schema.prisma` 수정:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. DB 초기화:
```bash
npx prisma db push
npx prisma generate
```

3. 개발 서버 실행:
```bash
npm run dev
```

### PostgreSQL 사용 (Docker)

1. Docker Compose로 PostgreSQL 실행:
```bash
docker run --name return-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

2. `.env.local` 설정:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/return"
DIRECT_URL="postgresql://postgres:password@localhost:5432/return"
```

3. DB 초기화:
```bash
npx prisma db push
```

---

## 📋 배포 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] Supabase Storage 버킷 생성 (`photos`)
- [ ] OpenAI API 키 발급
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정 완료
- [ ] 첫 배포 성공
- [ ] DB 마이그레이션 완료
- [ ] 사진 업로드 테스트
- [ ] 진단 기능 테스트
- [ ] 훈련 게임 테스트

---

## 🔧 문제 해결

### "relation does not exist" 오류
```bash
npx prisma db push
```

### OpenAI API 오류
- API 키 확인
- 사용량 한도 확인
- 결제 정보 확인

### 이미지 업로드 실패
- Supabase Storage 버킷 공개 설정 확인
- CORS 설정 확인

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build
```

---

## 📊 배포 후 모니터링

- **Vercel**: 빌드 로그, 함수 로그
- **Supabase**: 데이터베이스 사용량, 쿼리 성능
- **OpenAI**: API 사용량, 비용

---

## 🔒 보안 권장사항

1. 환경 변수는 Vercel Dashboard에서만 설정
2. `.env` 파일은 절대 커밋하지 않기
3. Supabase RLS(Row Level Security) 활성화 권장
4. OpenAI API 키 정기적 갱신
