// 관리자 인증: Cloudflare Access가 앞단에서 막고, 여기서 Access 토큰을 한 번 더 검증한다.
// 성공하면 { email }, 실패하면 null.

const certsCache = { url: '', keys: null, at: 0 };

export async function verifyAdmin(request, env) {
  const url = new URL(request.url);

  // 로컬 개발 전용 우회. 운영 주소에서는 값이 있어도 동작하지 않는다.
  if (env.ADMIN_DEV_BYPASS === 'true' && ['localhost', '127.0.0.1'].includes(url.hostname)) {
    return { email: 'dev@localhost' };
  }

  const team = (env.ACCESS_TEAM_DOMAIN || '').replace(/\/$/, '');
  const aud = env.ACCESS_AUD;
  if (!team || !aud) return null; // 설정이 없으면 막는다

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;

  try {
    const [h, p, s] = token.split('.');
    const header = JSON.parse(b64urlText(h));
    const payload = JSON.parse(b64urlText(p));
    if (header.alg !== 'RS256') return null;

    const jwk = (await getCerts(team)).find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;

    const now = Math.floor(Date.now() / 1000);
    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!auds.includes(aud) || payload.iss !== team || !(payload.exp > now)) return null;
    return { email: payload.email || '' };
  } catch {
    return null;
  }
}

async function getCerts(team) {
  const url = `${team}/cdn-cgi/access/certs`;
  if (certsCache.url === url && certsCache.keys && Date.now() - certsCache.at < 60 * 60 * 1000) return certsCache.keys;
  const res = await fetch(url);
  if (!res.ok) throw new Error('certs');
  const { keys } = await res.json();
  Object.assign(certsCache, { url, keys, at: Date.now() });
  return keys;
}

function b64urlBytes(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

function b64urlText(s) {
  return new TextDecoder().decode(b64urlBytes(s));
}
