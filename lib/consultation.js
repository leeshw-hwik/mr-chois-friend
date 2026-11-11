import { STATUS_LABELS } from './constants.js';
import { retentionOf } from './retention.js';

// DB 행 → 관리자 API 응답
export function toAdminItem(row, now = new Date()) {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    ageGroup: row.age_group,
    interests: row.interests,
    interestsDetail: row.interests_detail,
    message: row.message,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    statusUpdatedAt: row.status_updated_at,
    emailStatus: row.email_status,
    retention: retentionOf(row, now),
  };
}
