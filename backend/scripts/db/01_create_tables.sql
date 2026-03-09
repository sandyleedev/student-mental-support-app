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

-- Activities (counselling sessions and workshops)
CREATE TABLE IF NOT EXISTS activities (
  id           BIGSERIAL    PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  type         VARCHAR(30)  NOT NULL CHECK (type IN ('SESSION', 'WORKSHOP')),
  category     VARCHAR(100),
  start_time   TIMESTAMPTZ  NOT NULL,
  end_time     TIMESTAMPTZ  NOT NULL,
  capacity     INT,
  facilitator  VARCHAR(255),
  status       VARCHAR(20)  NOT NULL CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities (start_time);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities (type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities (status);

-- Bookings (student bookings for activities)
CREATE TABLE IF NOT EXISTS bookings (
  id          BIGSERIAL    PRIMARY KEY,
  student_id  BIGINT       NOT NULL REFERENCES users(id),
  activity_id BIGINT       NOT NULL REFERENCES activities(id),
  status      VARCHAR(20)  NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings (student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_activity ON bookings (activity_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
