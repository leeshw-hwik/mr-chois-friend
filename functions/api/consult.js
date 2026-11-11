// 상담 신청 접수: 검증 → Turnstile 확인 → D1 저장 → (응답 후) 메일 발송
import { DUPLICATE_WINDOW_MS } from '../../lib/constants.js';
import { buildConsultEmail, sendEmail } from '../../lib/email.js';
import { fail, json } from '../../lib/http.js';
import { validateConsult } from '../../lib/validate.js';

const BODY_MAX_BYTES = 8 * 1024;

export async function onRequestPost({ request, env, waitUntil }) {
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) {
    return fail(415, '잘못된 요청입니다.');
  }
  const raw = await request.text();
  if (raw.length > BODY_MAX_BYTES) return fail(413, '신청 내용이 너무 깁니다.');

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, '신청 내용을 읽을 수 없습니다.');
  }

  const checked = validateConsult(body);
  if (!checked.ok) return fail(400, checked.message);
  const v = checked.value;

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('설정 없음: TURNSTILE_SECRET_KEY');
    return fail(500, '일시적인 오류로 신청을 받을 수 없습니다.');
  }
  const human = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, request.headers.get('CF-Connecting-IP'));
  if (!human) return fail(400, '자동 입력 방지 확인에 실패했습니다. 다시 시도해 주세요.');

  const now = new Date();
  const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS).toISOString();
  const dup = await env.DB.prepare('SELECT 1 FROM consultations WHERE phone = ? AND created_at > ? LIMIT 1')
    .bind(v.phone, since)
    .first();
  if (dup) return fail(429, '이미 접수된 신청이 있습니다. 잠시 후 다시 시도해 주세요.');

  const row = await env.DB.prepare(
    `INSERT INTO consultations (created_at, name, phone, age_group, interests, interests_detail, message)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
  )
    .bind(now.toISOString(), v.name, v.phone, v.ageGroup, v.interests, v.interestsDetail, v.message)
    .first();

  // 메일은 응답을 보낸 뒤 처리한다. 실패해도 신청은 저장되어 있고 관리자 화면에 발송 실패로 보인다.
  const adminUrl = `${new URL(request.url).origin}/admin/#/${row.id}`;
  waitUntil(
    sendEmail(env, buildConsultEmail(row, adminUrl))
      .catch(() => false)
      .then((sent) =>
        env.DB.prepare('UPDATE consultations SET email_status = ? WHERE id = ?').bind(sent ? 'sent' : 'failed', row.id).run(),
      )
      .catch(() => console.error(`메일 결과 저장 실패: 신청 ${row.id}`)),
  );

  return json({ ok: true }, 201);
}

async function verifyTurnstile(secret, token, ip) {
  if (typeof token !== 'string' || !token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
