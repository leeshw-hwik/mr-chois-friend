// 상담 신청 폼의 선택지. public/index.html의 <select id="fAge">, input[name=it]와 같아야 한다.
export const AGE_GROUPS = ['20대', '30대', '40대', '50대', '60대 이상'];
export const INTERESTS = ['연금', '보장분석', '보험금 청구', '신규 보장설계'];
// 보장분석(#coverage) 체크 항목. public/index.html의 .chk <b> 글자와 같아야 한다.
export const COVERAGE_ITEMS = [
  '건강체·무사고 할인', '실손보험 비급여 할인·할증', '다자녀·임산부·장애인 할인',
  '자동차보험 할인 특약', '중복 가입 정리', '갱신형 보험료 점검',
  '표적·면역 항암치료', '양성자·중입자 방사선', '로봇수술·다빈치',
  '뇌·심장 진단 범위', '간병인·간호간병 통합서비스', '통원·검사·주사 치료',
];

export const MESSAGE_MAX = 500;
export const NAME_MAX = 30;

export const STATUS_LABELS = { new: '신규', planned: '상담 예정', done: '상담 완료' };

// 같은 연락처로 이 시간 안에 다시 신청하면 막는다(중복·반복 신청 방지).
export const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
