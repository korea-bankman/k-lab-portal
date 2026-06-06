# Supabase 설정 가이드

1. Supabase 프로젝트를 생성합니다.
2. `docs/supabase-schema.sql` 내용을 SQL Editor에서 실행합니다.
3. `docs/supabase-seed.sql` 내용을 SQL Editor에서 실행해 게시판 초기 데이터를 넣습니다.
4. Authentication > Providers에서 Email provider를 활성화합니다.
5. `.env.example`을 참고해 `.env.local`을 만듭니다.
6. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 입력합니다.
7. 운영 배포 시 Netlify 환경변수에도 동일하게 등록합니다.
8. Authentication > URL Configuration에서 Site URL을 Netlify 주소로 설정합니다.
9. Email confirmation을 켜면 가입 후 이메일 확인이 필요하고, 끄면 가입 직후 로그인이 가능합니다.

현재 앱은 Supabase 환경변수가 없으면 Mock 데이터로 렌더링됩니다. 실제 DB 연결 시 `lib/data/repository.ts`를 Supabase query adapter로 교체하거나, 같은 함수 이름을 유지한 채 서버 액션/API 라우트를 추가하면 됩니다.

권한 모델:

- 비회원: 게시글, 댓글, 채용공고 읽기
- 회원: 게시글 작성, 댓글 작성, 좋아요
- 관리자: 모든 게시글/댓글/채용공고 관리

관리자 계정 지정:

```sql
update public.profiles
set role = 'admin'
where email = '관리자로_쓸_이메일@example.com';
```

위 SQL을 실행한 뒤 해당 계정으로 다시 로그인하면 `/admin` 접근이 가능합니다.

향후 확장:

- `job_sources`별 수집기 추가
- Edge Function 또는 scheduled job으로 채용 API 동기화
- 인기글 집계용 materialized view 또는 cron 집계 테이블 추가
- AI 요약, 직무 매칭, 게시글 자동 태그 추천 기능 추가
