-- Seed data for local/demo. Run after 01_create_tables.sql.
-- Uses explicit IDs so FKs are stable; resets sequences at the end.

-- Users (2 students, 1 counsellor)
INSERT INTO users (id, role, name) VALUES
  (1, 'STUDENT',   'Rory Gilmore'),
  (2, 'STUDENT',   'Lane Kim'),
  (3, 'COUNSELLOR', 'Emily Gilmore')
ON CONFLICT (id) DO NOTHING;

-- Threads (2 threads: Rory, Lane)
INSERT INTO support_threads (id, student_id, topic, status) VALUES
  (1, 1, 'Feeling overwhelmed with deadlines', 'REPLIED'),
  (2, 2, 'Struggling to focus on readings', 'WAITING')
ON CONFLICT (id) DO NOTHING;

-- Thread 1: 6 messages (Rory <-> Emily), last from counsellor -> REPLIED
INSERT INTO messages (id, thread_id, sender_id, content) VALUES
  (1, 1, 1, 'I have three assignments due this week and I don''t know where to start.'),
  (2, 1, 3, 'Try listing them by due date and tackle the earliest one first. Break it into small steps.'),
  (3, 1, 1, 'That helped. I finished the first one. The second is a long essay – how do I avoid burning out?'),
  (4, 1, 3, 'Set a timer: write for 25 minutes, then take a 5-minute break. Repeat and adjust as needed.'),
  (5, 1, 1, 'I''ll try that. Sometimes I feel like I''m not good enough for this programme.'),
  (6, 1, 3, 'That feeling is common and it doesn''t mean it''s true. You''re here because you can do it. Keep using small steps and reach out again if you want to talk more.')
ON CONFLICT (id) DO NOTHING;

-- Thread 2: 5 messages (Lane <-> Emily), last from student -> WAITING
INSERT INTO messages (id, thread_id, sender_id, content) VALUES
  (7, 2, 2, 'I keep zoning out when I read. I have 50 pages due tomorrow.'),
  (8, 2, 3, 'Try reading in short chunks – 10–15 minutes – and jot one sentence per section about the main idea.'),
  (9, 2, 2, 'That made it a bit easier. But I still forget what I read after a few pages.'),
  (10, 2, 3, 'Summarising out loud or writing a few bullet points after eachㄴ chapter can help. Give that a go and see how it feels.'),
  (11, 2, 2, 'I will. Can I come back if it still doesn''t stick?')
ON CONFLICT (id) DO NOTHING;

-- Counsellor rota: Emily available Mon/Wed/Fri 9:00–11:00
INSERT INTO counsellor_rotas (id, counsellor_id, day_of_week, start_time, duration_min) VALUES
  (1, 3, 'MONDAY',   '09:00', 50),
  (2, 3, 'WEDNESDAY','09:00', 50),
  (3, 3, 'FRIDAY',   '09:00', 50)
ON CONFLICT (id) DO NOTHING;

-- Activities: 2 sessions, 1 workshop (Emily as facilitator)
INSERT INTO activities (id, type, title, start_time, duration_min, capacity, facilitator_id, location) VALUES
  (1, 'SESSION',  'Stress Management Drop-in', '2026-03-09 14:00:00+00', 60, 1, 3, 'Room 101'),
  (2, 'SESSION',  'One-to-One Counselling',    '2026-03-22 10:00:00+00', 45, 1,  3, 'Room 205'),
  (3, 'WORKSHOP', 'Mindfulness for Students',  '2026-03-25 15:00:00+00', 90, 20, 3, 'Main Hall')
ON CONFLICT (id) DO NOTHING;

-- Bookings: mix of CONFIRMED and CANCELLED (SESSION capacity=1, so one student per SESSION)
INSERT INTO bookings (id, activity_id, student_id, status, cancelled_at) VALUES
  (1, 1, 1, 'CONFIRMED', NULL),
  (2, 3, 1, 'CONFIRMED', NULL),
  (3, 2, 1, 'CONFIRMED', NULL),
  (4, 3, 2, 'CANCELLED', '2026-03-20 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences for clean auto-increment
SELECT setval('counsellor_rotas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM counsellor_rotas));
SELECT setval('activities_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activities));
SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings));
