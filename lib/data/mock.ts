import type { Board, Comment, Job, JobSource, Post, Profile } from "@/lib/types/domain";

export const profiles: Profile[] = [
  {
    id: "user-admin",
    email: "admin@klab.local",
    nickname: "관리자",
    role: "admin",
    department: "진단검사의학",
    region: "서울",
    createdAt: "2026-05-01T09:00:00.000Z"
  },
  {
    id: "user-1",
    email: "member@klab.local",
    nickname: "혈액파트7년차",
    role: "member",
    department: "진단혈액",
    region: "경기",
    createdAt: "2026-05-03T10:00:00.000Z"
  }
];

export const boards: Board[] = [
  { id: "board-free", slug: "free", name: "자유게시판", group: "general", description: "일상과 업무 이야기를 편하게 나누는 공간입니다." },
  { id: "board-qna", slug: "qna", name: "질문답변", group: "general", description: "검사실 업무와 커리어 질문을 주고받습니다." },
  { id: "board-career", slug: "career", name: "취업상담", group: "general", description: "이직, 면접, 연봉, 근무환경 정보를 공유합니다." },
  { id: "board-exam", slug: "exam", name: "국가고시", group: "general", description: "국가고시 준비 자료와 후기를 모읍니다." },
  { id: "board-notice", slug: "notice", name: "공지사항", group: "general", description: "K-Lab Portal 운영 공지입니다.", isNotice: true },
  { id: "board-hematology", slug: "hematology", name: "진단혈액", group: "laboratory-medicine", description: "CBC, coagulation, morphology 토론" },
  { id: "board-chemistry", slug: "chemistry", name: "임상화학", group: "laboratory-medicine", description: "화학, 면역화학, 장비 QC 정보" },
  { id: "board-immunology", slug: "immunology", name: "진단면역", group: "laboratory-medicine", description: "면역검사와 혈청학 정보를 공유합니다." },
  { id: "board-molecular", slug: "molecular", name: "분자진단", group: "laboratory-medicine", description: "PCR, NGS, 감염 분자검사 토론" },
  { id: "board-microbiology", slug: "microbiology", name: "진단미생물", group: "laboratory-medicine", description: "배양, 동정, 감수성 검사" },
  { id: "board-transfusion", slug: "transfusion", name: "수혈", group: "laboratory-medicine", description: "혈액은행과 수혈검사 실무" },
  { id: "board-quality", slug: "quality", name: "정도관리 및 인증평가", group: "laboratory-medicine", description: "QC, CAP, KOQAL, 인증평가 준비" },
  { id: "board-ecg", slug: "ecg", name: "심전도", group: "physiology", description: "심전도 검사와 판독 보조 팁" },
  { id: "board-pft", slug: "pft", name: "폐기능", group: "physiology", description: "폐기능검사 장비와 검사 흐름" },
  { id: "board-eeg", slug: "eeg", name: "뇌파", group: "physiology", description: "뇌파 검사 실무 공유" },
  { id: "board-emg", slug: "emg", name: "근전도", group: "physiology", description: "근전도 검사와 환자 안내" },
  { id: "board-sleep", slug: "sleep", name: "수면검사", group: "physiology", description: "PSG, CPAP, 판독 준비" },
  { id: "board-ultrasound", slug: "ultrasound", name: "초음파 게시판", group: "ultrasound", description: "초음파 검사 커리어와 교육 정보" }
];

const postTitles = [
  ["board-notice", "K-Lab Portal 베타 오픈 안내", true],
  ["board-notice", "커뮤니티 이용 규칙 및 신고 기준", true],
  ["board-notice", "채용공고 등록 제휴 문의 안내", true],
  ["board-free", "야간근무 후 컨디션 관리 어떻게 하시나요?", false],
  ["board-qna", "EDTA clumping 의심 검체 재채혈 기준 질문", false],
  ["board-career", "상급종합병원 계약직에서 정규직 전환 사례 있나요?", false],
  ["board-exam", "국가고시 실기 대비 루틴 공유합니다", false],
  ["board-hematology", "말초혈액도말 판독 스터디 자료 추천", false],
  ["board-chemistry", "HbA1c 장비 교체 전 비교평가 체크리스트", false],
  ["board-immunology", "ANA 패턴 보고 방식 병원마다 차이가 큰가요?", false],
  ["board-molecular", "호흡기 PCR 성수기 TAT 관리 팁", false],
  ["board-microbiology", "혈액배양 양성 알림 프로세스 공유", false],
  ["board-transfusion", "항체동정 야간 콜 대응 기준", false],
  ["board-quality", "인증평가 문서 준비 일정표 샘플", false],
  ["board-ecg", "심전도 신규자 교육 체크포인트", false],
  ["board-pft", "폐기능 검사 전 환자 설명 문구", false],
  ["board-eeg", "뇌파 검사실 소모품 관리 팁", false],
  ["board-emg", "근전도 검사 예약 간격 어떻게 잡으시나요?", false],
  ["board-sleep", "수면검사 야간근무 인수인계 양식", false],
  ["board-ultrasound", "초음파 교육기관 선택 기준 문의", false]
] as const;

export const posts: Post[] = postTitles.map(([boardId, title, isNotice], index) => ({
  id: `post-${index + 1}`,
  boardId,
  title,
  content:
    isNotice
      ? "K-Lab Portal은 임상병리사와 검사실 종사자가 현장 정보를 빠르게 나눌 수 있도록 만든 MVP입니다. 베타 기간 동안 게시판과 채용 기능을 우선 운영합니다."
      : "현장에서 바로 적용할 수 있는 경험을 나누고 싶어 글을 남깁니다. 병원 규모와 파트마다 기준이 다를 수 있으니 각 기관 지침과 함께 참고해 주세요.",
  authorId: index < 3 ? "user-admin" : index % 2 === 0 ? "user-1" : "user-admin",
  authorName: index < 3 ? "관리자" : index % 2 === 0 ? "혈액파트7년차" : "검사실리더",
  viewCount: 62 + index * 19,
  likeCount: 4 + (index % 7),
  commentCount: index % 4,
  tags: isNotice ? ["공지", "운영"] : ["실무", boards.find((board) => board.id === boardId)?.name ?? "커뮤니티"],
  isNotice,
  createdAt: new Date(Date.UTC(2026, 5, 1, 8 + index, 0, 0)).toISOString(),
  updatedAt: new Date(Date.UTC(2026, 5, 1, 8 + index, 30, 0)).toISOString()
}));

export const comments: Comment[] = [
  { id: "comment-1", postId: "post-5", authorId: "user-1", authorName: "혈액파트7년차", content: "저희는 citrate tube 재검 후 결과 코멘트를 남기는 방식으로 운영합니다.", createdAt: "2026-06-02T03:10:00.000Z" },
  { id: "comment-2", postId: "post-8", authorId: "user-admin", authorName: "검사실리더", content: "신규자 교육에는 정상/비정상 슬라이드를 섞어 보는 방식이 좋았습니다.", createdAt: "2026-06-02T04:20:00.000Z" },
  { id: "comment-3", postId: "post-14", authorId: "user-1", authorName: "혈액파트7년차", content: "문서 목록을 월별로 쪼개면 인증평가 직전에 덜 밀립니다.", createdAt: "2026-06-03T01:25:00.000Z" },
  { id: "comment-4", postId: "post-20", authorId: "user-admin", authorName: "검사실리더", content: "교육기관은 실습 장비와 케이스 수를 꼭 확인해 보세요.", createdAt: "2026-06-03T05:30:00.000Z" }
];

export const jobSources: JobSource[] = [
  { id: "source-kha", name: "대한병원협회", baseUrl: "https://www.kha.or.kr", apiReady: false },
  { id: "source-hospital", name: "병원 채용페이지", baseUrl: "https://example.com/jobs", apiReady: false },
  { id: "source-klab", name: "K-Lab 제휴", baseUrl: "https://klab.local/jobs", apiReady: true }
];

export const jobs: Job[] = [
  ["서울성모검사센터", "진단혈액", "서울", "경력 2년 이상", "정규직", "2026-06-30", "source-klab"],
  ["분당메디컬랩", "임상화학", "경기", "신입 가능", "계약직", "2026-06-21", "source-hospital"],
  ["부산해운대병원", "수혈", "부산", "경력 3년 이상", "정규직", "2026-07-05", "source-kha"],
  ["대전중앙의료원", "진단미생물", "대전", "무관", "정규직", "2026-06-25", "source-hospital"],
  ["광주첨단병원", "분자진단", "광주", "경력 1년 이상", "계약직", "2026-06-28", "source-klab"],
  ["인천국제검진센터", "심전도", "인천", "신입 가능", "정규직", "2026-07-10", "source-hospital"],
  ["대구미래병원", "폐기능", "대구", "무관", "시간제", "2026-06-18", "source-kha"],
  ["울산산업보건센터", "임상화학", "울산", "경력 5년 이상", "정규직", "2026-07-15", "source-klab"],
  ["강원권역의료원", "진단면역", "강원", "신입 가능", "계약직", "2026-06-23", "source-hospital"],
  ["제주헬스랩", "초음파", "제주", "경력 2년 이상", "정규직", "2026-07-01", "source-klab"]
].map(([hospitalName, department, region, experience, employmentType, deadline, sourceId], index) => {
  const source = jobSources.find((item) => item.id === sourceId) ?? jobSources[0];
  return {
    id: `job-${index + 1}`,
    hospitalName,
    department,
    region,
    experience,
    employmentType,
    deadline,
    originalUrl: `${source.baseUrl}/mock-${index + 1}`,
    sourceId,
    sourceName: source.name,
    description: `${hospitalName}에서 ${department} 분야 임상병리사를 모집합니다. 담당 업무, 근무 조건, 전형 절차는 원문 공고를 확인해 주세요.`,
    createdAt: new Date(Date.UTC(2026, 5, 1 + index, 2, 0, 0)).toISOString()
  };
});
