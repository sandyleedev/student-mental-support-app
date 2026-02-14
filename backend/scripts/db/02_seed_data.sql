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
  (10, 2, 3, 'Summarising out loud or writing a few bullet points after each chapter can help. Give that a go and see how it feels.'),
  (11, 2, 2, 'I will. Can I come back if it still doesn''t stick?')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences so next inserts get correct auto IDs
SELECT setval('users_id_seq',
              COALESCE((SELECT MAX(id) FROM users), 0) + 1,
              false);
SELECT setval('support_threads_id_seq',
              COALESCE((SELECT MAX(id) FROM support_threads), 0) + 1,
              false);
SELECT setval('messages_id_seq',
              COALESCE((SELECT MAX(id) FROM messages), 0) + 1,
              false);
