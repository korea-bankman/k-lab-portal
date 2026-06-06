insert into public.boards (id, slug, name, board_group, description, is_notice)
values
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/free'), 'free', '자유게시판', 'general', '일상과 업무 이야기를 편하게 나누는 공간입니다.', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/qna'), 'qna', '질문답변', 'general', '검사실 업무와 커리어 질문을 주고받습니다.', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/career'), 'career', '취업상담', 'general', '이직, 면접, 연봉, 근무환경 정보를 공유합니다.', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/exam'), 'exam', '국가고시', 'general', '국가고시 준비 자료와 후기를 모읍니다.', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/notice'), 'notice', '공지사항', 'general', 'K-Lab Portal 운영 공지입니다.', true),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/hematology'), 'hematology', '진단혈액', 'laboratory-medicine', 'CBC, coagulation, morphology 토론', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/chemistry'), 'chemistry', '임상화학', 'laboratory-medicine', '화학, 면역화학, 장비 QC 정보', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/immunology'), 'immunology', '진단면역', 'laboratory-medicine', '면역검사와 혈청학 정보를 공유합니다.', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/molecular'), 'molecular', '분자진단', 'laboratory-medicine', 'PCR, NGS, 감염 분자검사 토론', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/microbiology'), 'microbiology', '진단미생물', 'laboratory-medicine', '배양, 동정, 감수성 검사', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/transfusion'), 'transfusion', '수혈', 'laboratory-medicine', '혈액은행과 수혈검사 실무', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/quality'), 'quality', '정도관리 및 인증평가', 'laboratory-medicine', 'QC, CAP, KOQAL, 인증평가 준비', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/ecg'), 'ecg', '심전도', 'physiology', '심전도 검사와 판독 보조 팁', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/pft'), 'pft', '폐기능', 'physiology', '폐기능검사 장비와 검사 흐름', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/eeg'), 'eeg', '뇌파', 'physiology', '뇌파 검사 실무 공유', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/emg'), 'emg', '근전도', 'physiology', '근전도 검사와 환자 안내', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/sleep'), 'sleep', '수면검사', 'physiology', 'PSG, CPAP, 판독 준비', false),
  (uuid_generate_v5(uuid_ns_url(), 'k-lab-portal/board/ultrasound'), 'ultrasound', '초음파 게시판', 'ultrasound', '초음파 검사 커리어와 교육 정보', false)
on conflict (slug) do update set
  name = excluded.name,
  board_group = excluded.board_group,
  description = excluded.description,
  is_notice = excluded.is_notice;
