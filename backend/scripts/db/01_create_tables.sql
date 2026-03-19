-- Table creation only. Run against an existing database (e.g. student_mental_support).
-- Order: users, faqs -> support_threads, counsellor_rotas, activities -> messages, faq_tags, bookings (FK dependencies).

CREATE TABLE IF NOT EXISTS users (
  id         BIGSERIAL    PRIMARY KEY,
  role       VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT', 'COUNSELLOR')),
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faqs (
  id         BIGSERIAL    PRIMARY KEY,
  question   VARCHAR(255) NOT NULL,
  preview    TEXT         NOT NULL,
  answer     TEXT         NOT NULL,
  category   VARCHAR(50)  NOT NULL CHECK (category IN ('ACADEMIC_STRESS', 'MENTAL_HEALTH', 'CAMPUS_RESOURCES')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category
  ON faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_updated
  ON faqs (updated_at DESC);

CREATE TABLE IF NOT EXISTS support_threads (
  id         BIGSERIAL    PRIMARY KEY,
  student_id BIGINT       NOT NULL REFERENCES users(id),
  topic      VARCHAR(255) NOT NULL,
  urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('URGENT', 'MEDIUM', 'LOW')),
  status     VARCHAR(20)  NOT NULL CHECK (status IN ('WAITING', 'REPLIED')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_threads_student_created
  ON support_threads (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_threads_status_created
  ON support_threads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_threads_urgency_created
  ON support_threads (urgency_level, created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id         BIGSERIAL    PRIMARY KEY,
  thread_id  BIGINT       NOT NULL REFERENCES support_threads(id),
  sender_id  BIGINT       NOT NULL REFERENCES users(id),
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_created
  ON messages (thread_id, created_at);

CREATE TABLE IF NOT EXISTS faq_tags (
  id         BIGSERIAL    PRIMARY KEY,
  faq_id     BIGINT       NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  UNIQUE (faq_id, name)
);

CREATE INDEX IF NOT EXISTS idx_faq_tags_faq
  ON faq_tags (faq_id);
CREATE INDEX IF NOT EXISTS idx_faq_tags_name
  ON faq_tags (name);

-- CounsellorRota: counsellor availability by day and time
CREATE TABLE IF NOT EXISTS counsellor_rotas (
  id            BIGSERIAL    PRIMARY KEY,
  counsellor_id BIGINT       NOT NULL REFERENCES users(id),
  day_of_week   VARCHAR(20)  NOT NULL,
  start_time    TIME         NOT NULL,
  duration_min  INT          NOT NULL CHECK (duration_min > 0),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_counsellor_rotas_counsellor
  ON counsellor_rotas (counsellor_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_rotas_day
  ON counsellor_rotas (day_of_week);

-- Activity: sessions and workshops (ActivityType: SESSION, WORKSHOP)
-- status (UPCOMING/ONGOING/COMPLETED) is derived at API time from start_time + duration_min
CREATE TABLE IF NOT EXISTS activities (
  id             BIGSERIAL    PRIMARY KEY,
  type           VARCHAR(20)  NOT NULL CHECK (type IN ('SESSION', 'WORKSHOP')),
  title          VARCHAR(255) NOT NULL,
  start_time     TIMESTAMPTZ  NOT NULL,
  duration_min   INT          NOT NULL CHECK (duration_min > 0),
  capacity       INT          NOT NULL CHECK (capacity > 0),
  CONSTRAINT activities_session_capacity CHECK (type != 'SESSION' OR capacity = 1),
  facilitator_id BIGINT       NOT NULL REFERENCES users(id),
  location       VARCHAR(255),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_facilitator
  ON activities (facilitator_id);
CREATE INDEX IF NOT EXISTS idx_activities_start
  ON activities (start_time);
CREATE INDEX IF NOT EXISTS idx_activities_type
  ON activities (type);

-- Booking: student bookings for activities (BookingStatus: CONFIRMED, CANCELLED)
CREATE TABLE IF NOT EXISTS bookings (
  id          BIGSERIAL    PRIMARY KEY,
  activity_id BIGINT       NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id  BIGINT       NOT NULL REFERENCES users(id),
  status      VARCHAR(20)  NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE (activity_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_activity
  ON bookings (activity_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student
  ON bookings (student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings (status);