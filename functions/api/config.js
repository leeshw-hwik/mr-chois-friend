// 상담 신청 폼이 쓰는 공개 설정(Turnstile 사이트 키).
import { json } from '../../lib/http.js';

export function onRequestGet({ env }) {
  return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || '' });
}
