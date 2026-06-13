# Supabase 설정 가이드

1. Supabase 프로젝트를 생성합니다.
2. `docs/supabase-schema.sql` 내용을 SQL Editor에서 실행합니다.
3. `docs/supabase-seed.sql` 내용을 SQL Editor에서 실행해 게시판 초기 데이터를 넣습니다.
4. 기존 프로젝트에 매니저/운영 권한을 추가할 때는 `docs/supabase-role-migration.sql`을 SQL Editor에서 실행합니다.
5. Authentication > Providers에서 Email provider를 활성화합니다.
6. `.env.example`을 참고해 `.env.local`을 만듭니다.
7. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 입력합니다.
8. 자동 채용 수집을 쓰려면 `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `WORKNET_API_KEY`, `SARAMIN_ACCESS_KEY`도 입력합니다.
9. 운영 배포 시 Netlify/Vercel 환경변수에도 동일하게 등록합니다.
10. Authentication > URL Configuration에서 Site URL을 배포 주소로 설정합니다.
11. Email confirmation을 켜면 가입 후 이메일 확인이 필요하고, 끄면 가입 직후 로그인이 가능합니다.

현재 앱은 Supabase 환경변수가 없으면 Mock 데이터로 렌더링됩니다. 실제 DB 연결 시 `lib/data/repository.ts`를 Supabase query adapter로 교체하거나, 같은 함수 이름을 유지한 채 서버 액션/API 라우트를 추가하면 됩니다.

권한 모델:

- 비회원: 게시글, 댓글, 채용공고 읽기
- 회원: 게시글 작성, 댓글 작성, 좋아요
- 매니저: 담당 게시판 신고/게시글/댓글 관리
- 관리자: 모든 게시글/댓글/채용공고/회원 권한 관리

관리자 계정 지정:

```sql
update public.profiles
set role = 'admin'
where email = '관리자로_쓸_이메일@example.com';
```

위 SQL을 실행한 뒤 해당 계정으로 다시 로그인하면 `/admin` 접근이 가능합니다.

향후 확장:

- `job_sources`별 수집기 추가
- Vercel Cron 또는 Supabase Edge Function으로 채용 API 동기화
- 인기글 집계용 materialized view 또는 cron 집계 테이블 추가
- AI 요약, 직무 매칭, 게시글 자동 태그 추천 기능 추가

채용공고 자동 수집:

- 실행 주소: `/api/cron/import-jobs`
- Vercel Cron 시간: 매일 08:00, 18:00 KST
- 현재 지원 출처: 워크넷, 사람인
- 키가 없는 출처는 건너뜁니다.
- 같은 `original_url`이 이미 저장되어 있으면 중복 저장하지 않습니다.

로컬에서 테스트할 때:

```bash
curl "http://localhost:3000/api/cron/import-jobs?secret=로컬_CRON_SECRET"
```

Vercel 환경변수에는 아래를 넣습니다.

```text
CRON_SECRET=아무도_모르는_긴_문자
WORKNET_API_KEY=워크넷에서_받은_API키
SARAMIN_ACCESS_KEY=사람인에서_받은_access-key
JOB_IMPORT_KEYWORD=임상병리사
SUPABASE_SERVICE_ROLE_KEY=Supabase_Service_Role_Key
```
