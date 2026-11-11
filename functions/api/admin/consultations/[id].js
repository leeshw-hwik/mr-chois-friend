// 상담 신청 상세 조회 · 상태 변경 · 삭제
import { fail, json } from '../../../../lib/http.js';
import { toAdminItem } from '../../../../lib/consultation.js';

const SETTABLE = ['planned', 'done'];

function idOf(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function onRequestGet({ env, params }) {
  const id = idOf(params);
  const row = id && (await env.DB.prepare('SELECT * FROM consultations WHERE id = ?').bind(id).first());
  if (!row) return fail(404, '신청 내역이 없습니다. 이미 삭제되었을 수 있습니다.');
  return json({ item: toAdminItem(row) });
}

export async function onRequestPatch({ request, env, params }) {
  const id = idOf(params);
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, '잘못된 요청입니다.');
  }
  if (!SETTABLE.includes(body?.status)) return fail(400, '바꿀 수 없는 상태입니다.');

  const row =
    id &&
    (await env.DB.prepare('UPDATE consultations SET status = ?, status_updated_at = ? WHERE id = ? RETURNING *')
      .bind(body.status, new Date().toISOString(), id)
      .first());
  if (!row) return fail(404, '신청 내역이 없습니다. 이미 삭제되었을 수 있습니다.');
  return json({ item: toAdminItem(row) });
}

export async function onRequestDelete({ env, params }) {
  const id = idOf(params);
  const res = id && (await env.DB.prepare('DELETE FROM consultations WHERE id = ?').bind(id).run());
  if (!res || res.meta.changes === 0) return fail(404, '신청 내역이 없습니다. 이미 삭제되었을 수 있습니다.');
  return json({ ok: true });
}
