// 개인정보 보유 기간: 상담 완료 후 즉시 파기, 미완료 시 신청일로부터 최대 1년.
// 기한이 1개월(30일) 이내로 다가오거나 지나면 관리자 화면에 삭제 권장을 표시한다.
const SOON_MS = 30 * 24 * 60 * 60 * 1000;

// 반환: { deadline: ISO 문자열, state: 'ok' | 'soon' | 'over', reason: 'done' | 'expired' | 'soon' | null }
export function retentionOf(row, now = new Date()) {
  if (row.status === 'done') {
    return { deadline: row.status_updated_at || row.created_at, state: 'over', reason: 'done' };
  }
  const deadline = new Date(row.created_at);
  deadline.setUTCFullYear(deadline.getUTCFullYear() + 1);
  const left = deadline.getTime() - now.getTime();
  if (left <= 0) return { deadline: deadline.toISOString(), state: 'over', reason: 'expired' };
  if (left <= SOON_MS) return { deadline: deadline.toISOString(), state: 'soon', reason: 'soon' };
  return { deadline: deadline.toISOString(), state: 'ok', reason: null };
}
