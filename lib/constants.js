// 상담 신청 폼의 선택지. public/index.html의 <select id="fAge">, input[name=it]와 같아야 한다.
export const AGE_GROUPS = ['20대', '30대', '40대', '50대', '60대 이상'];
export const INTERESTS = ['연금', '보장분석', '보험금 청구', '신규 보장설계'];

export const MESSAGE_MAX = 500;
export const NAME_MAX = 30;

export const STATUS_LABELS = { new: '신규', planned: '상담 예정', done: '상담 완료' };

// 같은 연락처로 이 시간 안에 다시 신청하면 막는다(중복·반복 신청 방지).
export const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
