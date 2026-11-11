import { AGE_GROUPS, INTERESTS, MESSAGE_MAX, NAME_MAX } from './constants.js';
import { formatPhone } from './format.js';

// 상담 신청 입력 검증. 브라우저 검증과 별개로 서버에서 다시 확인한다.
// 성공: { ok: true, value }, 실패: { ok: false, message }
export function validateConsult(body) {
  if (!body || typeof body !== 'object') return bad('신청 내용을 읽을 수 없습니다.');

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return bad('성함을 입력해 주세요.');
  if (name.length > NAME_MAX) return bad(`성함은 ${NAME_MAX}자 이내로 입력해 주세요.`);

  const digits = typeof body.phone === 'string' ? body.phone.replace(/[\s-]/g, '') : '';
  if (!/^0\d{8,10}$/.test(digits)) return bad('연락처를 정확히 입력해 주세요.');

  const ageGroup = body.ageGroup;
  if (!AGE_GROUPS.includes(ageGroup)) return bad('연령대를 선택해 주세요.');

  const interests = Array.isArray(body.interests) ? [...new Set(body.interests)] : [];
  if (!interests.every((v) => INTERESTS.includes(v))) return bad('상담 분야를 다시 선택해 주세요.');

  const message = typeof body.message === 'string' ? body.message.replace(/\r\n/g, '\n').trim() : '';
  if (message.length > MESSAGE_MAX) return bad(`문의 내용은 ${MESSAGE_MAX}자 이내로 입력해 주세요.`);

  if (body.agree !== true) return bad('개인정보 수집·이용에 동의해 주세요.');

  return {
    ok: true,
    value: { name, phone: formatPhone(digits), ageGroup, interests: interests.join(', '), message },
  };
}

function bad(message) {
  return { ok: false, message };
}
