// /admin/* 화면: Cloudflare Access가 앞에서 막지만, 설정이 빠졌을 때를 대비해 한 번 더 확인한다.
import { verifyAdmin } from '../../lib/access.js';

export async function onRequest({ request, env, next }) {
  if (!(await verifyAdmin(request, env))) {
    return new Response('관리자 로그인이 필요합니다.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store');
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return out;
}
