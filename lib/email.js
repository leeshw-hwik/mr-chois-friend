import { escapeHtml, formatKst } from './format.js';

// 메일 클라이언트는 CSS 변수를 읽지 못하므로 public/index.html :root 값을 그대로 옮겨 쓴다.
const C = { navy: '#0f2a47', accent: '#e8792b', bg: '#f6f7f9', card: '#ffffff', text: '#1c2430', muted: '#5d6878', line: '#e3e7ec' };

// row: consultations 행, adminUrl: 관리자 상세 화면 주소
export function buildConsultEmail(row, adminUrl) {
  const when = formatKst(row.created_at);
  const interests = row.interests || '선택 안 함';
  const message = row.message || '(없음)';
  const subject = `[상담신청] ${row.name} · ${row.age_group} · ${interests}`;

  const rows = [
    ['신청 일시', escapeHtml(when)],
    ['성함', escapeHtml(row.name)],
    ['연락처', `<a href="tel:${escapeHtml(row.phone.replace(/-/g, ''))}" style="color:${C.navy};font-weight:700;text-decoration:none">${escapeHtml(row.phone)}</a>`],
    ['연령대', escapeHtml(row.age_group)],
    ['상담 분야', escapeHtml(interests)],
    ['문의 내용', escapeHtml(message).replace(/\n/g, '<br>')],
  ];

  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:${C.text};word-break:keep-all">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 12px">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.card};border:1px solid ${C.line};border-radius:14px;overflow:hidden">
    <tr><td style="background:${C.navy};color:#ffffff;padding:20px 24px">
      <div style="font-size:13px;color:${C.accent};font-weight:700;letter-spacing:1px">NEW CONSULTATION</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px">새 상담 신청이 접수되었습니다</div>
    </td></tr>
    <tr><td style="padding:8px 24px 4px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6">
        ${rows.map(([k, v]) => `<tr>
          <th align="left" valign="top" style="width:88px;padding:12px 8px 12px 0;color:${C.muted};font-weight:600;border-bottom:1px solid ${C.line};white-space:nowrap">${k}</th>
          <td valign="top" style="padding:12px 0;border-bottom:1px solid ${C.line}">${v}</td>
        </tr>`).join('')}
      </table>
    </td></tr>
    <tr><td style="padding:20px 24px 24px">
      <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:${C.accent};color:#ffffff;font-weight:700;font-size:15px;padding:12px 20px;border-radius:10px;text-decoration:none">관리자 페이지에서 보기</a>
      <p style="margin:16px 0 0;font-size:12px;color:${C.muted}">개인정보 보유 기간: 상담 완료 후 즉시 파기(미완료 시 최대 1년). 상담을 마치면 관리자 페이지에서 신청 내역을 삭제해 주세요.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const text = [
    '새 상담 신청이 접수되었습니다',
    '',
    `신청 일시: ${when}`,
    `성함: ${row.name}`,
    `연락처: ${row.phone}`,
    `연령대: ${row.age_group}`,
    `상담 분야: ${interests}`,
    `문의 내용: ${message}`,
    '',
    `관리자 페이지: ${adminUrl}`,
  ].join('\n');

  return { subject, html, text };
}

// Resend로 발송. 설정이 없거나 실패하면 false.
export async function sendEmail(env, { subject, html, text }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.CONSULT_TO_EMAIL) {
    console.error('메일 설정 없음: RESEND_API_KEY, MAIL_FROM, CONSULT_TO_EMAIL 확인');
    return false;
  }
  const to = env.CONSULT_TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to, subject, html, text }),
  });
  if (!res.ok) {
    // 응답 본문에 개인정보가 섞일 수 있어 상태 코드만 남긴다.
    console.error(`메일 발송 실패: HTTP ${res.status}`);
    return false;
  }
  return true;
}
