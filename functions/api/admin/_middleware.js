// /api/admin/* : 관리자 인증 + 다른 사이트에서 보낸 변경 요청 차단
import { verifyAdmin } from '../../../lib/access.js';
import { fail } from '../../../lib/http.js';

export async function onRequest({ request, env, next, data }) {
  const admin = await verifyAdmin(request, env);
  if (!admin) return fail(403, '관리자 로그인이 필요합니다.');

  if (request.method !== 'GET') {
    const origin = request.headers.get('Origin');
    if (origin !== new URL(request.url).origin) return fail(403, '잘못된 요청입니다.');
  }
  data.admin = admin;
  return next();
}
