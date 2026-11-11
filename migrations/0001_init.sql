-- 상담 신청
CREATE TABLE consultations (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at        TEXT    NOT NULL,                -- 신청 일시(UTC ISO 8601)
  name              TEXT    NOT NULL,
  phone             TEXT    NOT NULL,
  age_group         TEXT    NOT NULL,
  interests         TEXT    NOT NULL DEFAULT '',     -- 쉼표 구분
  message           TEXT    NOT NULL DEFAULT '',     -- 500자 이내
  status            TEXT    NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'planned', 'done')),
  status_updated_at TEXT,                            -- 상태 바꾼 일시(UTC)
  email_status      TEXT    NOT NULL DEFAULT 'pending'
                    CHECK (email_status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX idx_consultations_created_at ON consultations (created_at DESC);
CREATE INDEX idx_consultations_phone_created_at ON consultations (phone, created_at);
