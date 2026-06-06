# K-Lab Portal

대한민국 임상병리사 및 검사실 종사자를 위한 전문 커뮤니티 및 채용 포털 MVP입니다. 네이버 카페와 유사한 게시판 사용성과 채용공고 탐색을 한 앱에 통합했습니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / PostgreSQL 연결 준비
- Netlify 배포 설정

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 페이지

- `/` 홈
- `/login` 로그인
- `/signup` 회원가입
- `/mypage` 마이페이지
- `/boards/free` 게시판 목록
- `/posts/post-1` 게시글 상세
- `/posts/new` 게시글 작성
- `/posts/post-1/edit` 게시글 수정
- `/jobs` 채용공고 목록
- `/jobs/job-1` 채용공고 상세
- `/admin` 관리자 페이지

## 데이터 구조

초기 MVP는 `lib/data/mock.ts`의 Mock 데이터로 동작합니다.

- 게시글 20개
- 댓글 예시
- 공지사항 3개
- 채용공고 10개
- 게시판 전체 구조
- 채용 데이터 소스 예시

Supabase 스키마와 설정 가이드는 `docs/supabase-schema.sql`, `docs/supabase-guide.md`를 확인하세요.

## 배포

Netlify에서 GitHub 저장소를 연결한 뒤 build command를 `npm run build`, publish directory를 `.next`로 설정합니다. `netlify.toml`과 `@netlify/plugin-nextjs` 설정이 포함되어 있습니다.

## 확장 포인트

- `lib/data/repository.ts`를 Supabase query adapter로 교체
- 서버 액션 기반 글쓰기/댓글/좋아요 구현
- `job_sources` 기반 채용 API 동기화
- AI 게시글 요약, 자동 태그, 채용 매칭 기능 추가
