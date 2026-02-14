-- Table creation only. Run against an existing database (e.g. student_mental_support).
-- Order: users -> support_threads -> messages (FK dependencies).

CREATE TABLE IF NOT EXISTS users (
  id         BIGSERIAL    PRIMARY KEY,
  role       VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT', 'COUNSELLOR')),
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_threads (
  id         BIGSERIAL    PRIMARY KEY,
  student_id BIGINT       NOT NULL REFERENCES users(id),
  topic      VARCHAR(255) NOT NULL,
  status     VARCHAR(20)  NOT NULL CHECK (status IN ('WAITING', 'REPLIED')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_threads_student_created
  ON support_threads (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_threads_status_created
  ON support_threads (status, created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id         BIGSERIAL    PRIMARY KEY,
  thread_id  BIGINT       NOT NULL REFERENCES support_threads(id),
  sender_id  BIGINT       NOT NULL REFERENCES users(id),
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_created
  ON messages (thread_id, created_at);
