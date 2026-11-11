// 상담 신청 목록(최근 신청 먼저). ?beforeAt=<신청 일시>&beforeId=<id>로 다음 페이지.
import { json } from '../../../../lib/http.js';
import { toAdminItem } from '../../../../lib/consultation.js';

const PAGE = 20;

export async function onRequestGet({ request, env }) {
  const q = new URL(request.url).searchParams;
  const beforeAt = q.get('beforeAt');
  const beforeId = Number(q.get('beforeId')) || 0;
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, name, phone, age_group, interests,
            status, status_updated_at, email_status
       FROM consultations
      WHERE ?1 IS NULL OR created_at < ?1 OR (created_at = ?1 AND id < ?2)
      ORDER BY created_at DESC, id DESC
      LIMIT ?3`,
  )
    .bind(beforeAt, beforeId, PAGE + 1)
    .all();

  const now = new Date();
  // 목록에는 문의 내용을 싣지 않는다(상세에서만)
  const items = results.slice(0, PAGE).map((r) => toAdminItem(r, now));
  const { total } = await env.DB.prepare('SELECT COUNT(*) AS total FROM consultations').first();
  return json({ items, total, hasMore: results.length > PAGE });
}
