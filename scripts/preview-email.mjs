// 상담 신청 알림 메일을 가짜 데이터로 만들어 HTML 파일로 저장한다(메일 모양 확인용).
// 사용: npm run preview:email -- <저장할 경로>   (기본: .wrangler/email-preview.html)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildConsultEmail } from '../lib/email.js';

const out = process.argv[2] || '.wrangler/email-preview.html';
const mail = buildConsultEmail(
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: '홍길동',
    phone: '010-1234-5678',
    age_group: '40대',
    interests: '연금, 보장분석',
    interests_detail: '건강체·무사고 할인, 표적·면역 항암치료',
    message: '평일 저녁 7시 이후에 연락 주세요.\n국민연금 말고 따로 준비한 게 없어서 상담받고 싶습니다.',
  },
  'https://example.com/admin/#/1',
);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, mail.html);
console.log(`제목: ${mail.subject}\n저장: ${out}\n\n${mail.text}`);
