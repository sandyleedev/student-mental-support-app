-- Seed data for local/demo. Run after 01_create_tables.sql.
-- Uses explicit IDs so FKs are stable; resets sequences at the end.

-- Users (12 students, 4 counsellors)
INSERT INTO users (id, role, name) VALUES
  (1, 'STUDENT',   'Rory Gilmore'),
  (2, 'STUDENT',   'Lane Kim'),
  (3, 'COUNSELLOR', 'Emily Gilmore'),
  (4, 'COUNSELLOR', 'James Chen'),
  (5, 'COUNSELLOR', 'Sarah Mitchell'),
  (6, 'COUNSELLOR', 'David Park'),
  (7, 'STUDENT',   'Jess Mariano'),
  (8, 'STUDENT',   'Paris Geller'),
  (9, 'STUDENT',   'Dean Forester'),
  (10, 'STUDENT',  'Madeline Lynn'),
  (11, 'STUDENT',  'Tristan Dugray'),
  (12, 'STUDENT',  'Logan Huntzberger'),
  (13, 'STUDENT',  'Colin McCrae'),
  (14, 'STUDENT',  'Finn Cole'),
  (15, 'STUDENT',  'Henry Cho'),
  (16, 'STUDENT',  'Brad Langford')
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
  (10, 2, 3, 'Summarising out loud or writing a few bullet points after each chapter can help. Give that a go and see how it feels.'),
  (11, 2, 2, 'I will. Can I come back if it still doesn''t stick?')
ON CONFLICT (id) DO NOTHING;

-- Counsellor rotas: Mon-Fri 9am-5pm only (8 slots per day: 9:00–16:00)
\i scripts/db/_rotas_gen.sql

-- SESSION activities: Mar/Apr/May 2026 weekdays, 3 slots/day UK 9am-5pm, 1 counsellor per day (Mon=Sarah, Tue=James, Wed=Emily, Thu=David, Fri=Emily)
\i scripts/db/_sessions_gen.sql

-- WORKSHOP activities: 4 counsellors (3, 4, 5, 6) – ids 781+ to avoid conflict with SESSION ids 1-780
INSERT INTO activities (id, type, title, start_time, duration_min, capacity, facilitator_id, location) VALUES
  (781, 'WORKSHOP', 'Mindfulness & Meditation',      '2026-03-12 10:00:00+00', 90, 20, 3, 'Main Hall'),
  (782, 'WORKSHOP', 'Exam Stress Relief',           '2026-03-15 15:30:00+00', 120, 25, 4, 'Room 302'),
  (783, 'WORKSHOP', 'Career Prep Group',            '2026-03-18 13:00:00+00', 90, 15, 5, 'Room 101'),
  (784, 'WORKSHOP', 'Sleep Hygiene Workshop',       '2026-03-22 14:00:00+00', 60, 12, 6, 'Room 205'),
  (785, 'WORKSHOP', 'Anxiety Management',           '2026-03-25 11:00:00+00', 90, 18, 3, 'Main Hall')
ON CONFLICT (id) DO NOTHING;

-- Bookings: CONFIRMED + CANCELLED (balanced: mixed times, 1–2 full days, rest sparse)
INSERT INTO bookings (id, activity_id, student_id, status, cancelled_at) VALUES
  (1, 1, 1, 'CONFIRMED', NULL),
  (2, 2, 7, 'CONFIRMED', NULL),
  (3, 5, 2, 'CONFIRMED', NULL),
  (4, 9, 8, 'CONFIRMED', NULL),
  (5, 13, 9, 'CONFIRMED', NULL),
  (6, 14, 10, 'CONFIRMED', NULL),
  (7, 15, 1, 'CONFIRMED', NULL),
  (8, 19, 7, 'CONFIRMED', NULL),
  (9, 21, 2, 'CONFIRMED', NULL),
  (10, 26, 8, 'CONFIRMED', NULL),
  (11, 28, 9, 'CONFIRMED', NULL),
  (12, 30, 10, 'CONFIRMED', NULL),
  (13, 37, 1, 'CONFIRMED', NULL),
  (14, 38, 7, 'CONFIRMED', NULL),
  (15, 39, 2, 'CONFIRMED', NULL),
  (16, 44, 8, 'CONFIRMED', NULL),
  (17, 52, 9, 'CONFIRMED', NULL),
  (18, 53, 10, 'CONFIRMED', NULL),
  (19, 54, 1, 'CONFIRMED', NULL),
  (20, 781, 1, 'CONFIRMED', NULL),
  (21, 781, 2, 'CONFIRMED', NULL),
  (22, 781, 7, 'CONFIRMED', NULL),
  (23, 781, 8, 'CONFIRMED', NULL),
  (24, 782, 1, 'CONFIRMED', NULL),
  (25, 782, 2, 'CONFIRMED', NULL),
  (26, 782, 7, 'CONFIRMED', NULL),
  (27, 782, 8, 'CONFIRMED', NULL),
  (28, 782, 9, 'CONFIRMED', NULL),
  (29, 782, 10, 'CONFIRMED', NULL),
  (30, 782, 11, 'CONFIRMED', NULL),
  (31, 782, 12, 'CONFIRMED', NULL),
  (32, 783, 1, 'CONFIRMED', NULL),
  (33, 783, 2, 'CONFIRMED', NULL),
  (34, 783, 7, 'CONFIRMED', NULL),
  (35, 783, 8, 'CONFIRMED', NULL),
  (36, 783, 9, 'CONFIRMED', NULL),
  (37, 783, 10, 'CONFIRMED', NULL),
  (38, 783, 11, 'CONFIRMED', NULL),
  (39, 783, 12, 'CONFIRMED', NULL),
  (40, 784, 1, 'CONFIRMED', NULL),
  (41, 784, 2, 'CONFIRMED', NULL),
  (42, 784, 7, 'CONFIRMED', NULL),
  (43, 784, 8, 'CONFIRMED', NULL),
  (44, 784, 9, 'CONFIRMED', NULL),
  (45, 784, 10, 'CONFIRMED', NULL),
  (46, 784, 11, 'CONFIRMED', NULL),
  (47, 784, 12, 'CONFIRMED', NULL),
  (48, 784, 13, 'CONFIRMED', NULL),
  (49, 784, 14, 'CONFIRMED', NULL),
  (50, 784, 15, 'CONFIRMED', NULL),
  (51, 784, 16, 'CONFIRMED', NULL),
  (52, 785, 1, 'CONFIRMED', NULL),
  (53, 785, 2, 'CONFIRMED', NULL),
  (54, 785, 7, 'CONFIRMED', NULL),
  (55, 785, 9, 'CONFIRMED', NULL),
  (56, 5, 1, 'CANCELLED', '2026-03-01 12:00:00+00'),
  (57, 781, 9, 'CANCELLED', '2026-03-10 14:00:00+00'),
  (58, 783, 13, 'CANCELLED', '2026-03-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences for clean auto-increment
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('support_threads_id_seq', (SELECT COALESCE(MAX(id), 1) FROM support_threads));
SELECT setval('messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM messages));
SELECT setval('counsellor_rotas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM counsellor_rotas));
SELECT setval('activities_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activities));
SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings));
