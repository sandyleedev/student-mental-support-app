-- Seed data for local/demo. Run after 01_create_tables.sql.
-- Uses explicit IDs so FKs are stable; resets sequences at the end.

-- Users (12 students, 4 counsellors)
INSERT INTO users (id, role, name, email, password) VALUES
  (1, 'STUDENT',   'Rory Gilmore',       'rory@test.com',       '123456'),
  (2, 'STUDENT',   'Lane Kim',           'lane@test.com',       '123456'),
  (3, 'COUNSELLOR', 'Emily Gilmore',     'emily@test.com',      '123456'),
  (4, 'COUNSELLOR', 'James Chen',        'james@test.com',      '123456'),
  (5, 'COUNSELLOR', 'Sarah Mitchell',    'sarah@test.com',      '123456'),
  (6, 'COUNSELLOR', 'David Park',        'david@test.com',      '123456'),
  (7, 'STUDENT',   'Jess Mariano',       'jess@test.com',       '123456'),
  (8, 'STUDENT',   'Paris Geller',       'paris@test.com',      '123456'),
  (9, 'STUDENT',   'Dean Forester',      'dean@test.com',       '123456'),
  (10, 'STUDENT',  'Madeline Lynn',      'madeline@test.com',   '123456'),
  (11, 'STUDENT',  'Tristan Dugray',     'tristan@test.com',    '123456'),
  (12, 'STUDENT',  'Logan Huntzberger',  'logan@test.com',      '123456'),
  (13, 'STUDENT',  'Colin McCrae',       'colin@test.com',      '123456'),
  (14, 'STUDENT',  'Finn Cole',          'finn@test.com',       '123456'),
  (15, 'STUDENT',  'Henry Cho',          'henry@test.com',      '123456'),
  (16, 'STUDENT',  'Brad Langford',      'brad@test.com',       '123456')
ON CONFLICT (id) DO NOTHING;

-- Threads (6 threads with mixed urgency levels)
INSERT INTO support_threads (id, student_id, topic, urgency_level, status) VALUES
  (1, 1, 'Feeling overwhelmed with deadlines', 'MEDIUM', 'REPLIED'),
  (2, 2, 'Struggling to focus on readings', 'LOW', 'WAITING'),
  (3, 7, 'Panic attacks before exams', 'URGENT', 'WAITING'),
  (4, 8, 'I have not slept properly for days', 'URGENT', 'REPLIED'),
  (5, 11, 'Falling behind on coursework', 'MEDIUM', 'WAITING'),
  (6, 12, 'Feeling isolated in group projects', 'LOW', 'REPLIED')
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

-- Thread 3: Jess, urgent, last from student -> WAITING
INSERT INTO messages (id, thread_id, sender_id, content) VALUES
  (12, 3, 7, 'I have been having panic attacks before exams and today it got bad enough that I had to leave the room.')
ON CONFLICT (id) DO NOTHING;

-- Thread 4: Paris, urgent, last from counsellor -> REPLIED
INSERT INTO messages (id, thread_id, sender_id, content) VALUES
  (13, 4, 8, 'I have barely slept this week and I feel exhausted and on edge all the time.'),
  (14, 4, 3, 'Thank you for telling us. Please prioritise rest today and come to the wellbeing office if you feel unsafe or unable to cope alone.'),
  (15, 4, 8, 'I can come in later today. I just do not think I can keep going like this.'),
  (16, 4, 3, 'That sounds like the right next step. We can help you make a plan and decide what support you need today.')
ON CONFLICT (id) DO NOTHING;

-- Thread 5: Tristan, medium, last from student -> WAITING
INSERT INTO messages (id, thread_id, sender_id, content) VALUES
  (17, 5, 11, 'I am falling behind on coursework and starting to feel stuck, but it is not a crisis right now.')
ON CONFLICT (id) DO NOTHING;

-- Thread 6: Logan, low, last from counsellor -> REPLIED
INSERT INTO messages (id, thread_id, sender_id, content) VALUES
  (18, 6, 12, 'I feel isolated in group projects and it is making me less motivated to attend seminars.'),
  (19, 6, 3, 'That sounds really difficult. We can talk through some small steps to reconnect with your group and reduce the stress around seminars.')
ON CONFLICT (id) DO NOTHING;

-- Counsellor rotas: Mon-Fri 9am-5pm only (8 slots per day: 9:00–16:00)
\ir _rotas_gen.sql

-- SESSION activities: Mar/Apr/May/Jun 2026 weekdays, 3 slots/day UK 9am-5pm, 1 counsellor per day (Mon=Sarah, Tue=James, Wed=Emily, Thu=David, Fri=Emily)
\ir _sessions_gen.sql

-- SESSION activities (explicit seed rows for app flows expecting type='SESSION')
INSERT INTO activities (id, type, title, start_time, duration_min, capacity, facilitator_id, location) VALUES
  (901, 'SESSION', '1-on-1 Counselling', '2026-05-20 10:00:00+00', 50, 1, 3, 'Room 101'),
  (902, 'SESSION', '1-on-1 Counselling', '2026-05-21 11:00:00+00', 50, 1, 4, 'Room 101'),
  (903, 'SESSION', '1-on-1 Counselling', '2026-05-22 14:00:00+00', 50, 1, 5, 'Room 101'),
  (904, 'SESSION', '1-on-1 Counselling', '2026-05-27 10:00:00+00', 50, 1, 6, 'Room 101'),
  (905, 'SESSION', '1-on-1 Counselling', '2026-06-03 10:00:00+00', 50, 1, 3, 'Room 101'),
  (906, 'SESSION', '1-on-1 Counselling', '2026-06-04 11:00:00+00', 50, 1, 4, 'Room 101'),
  (907, 'SESSION', '1-on-1 Counselling', '2026-06-10 14:00:00+00', 50, 1, 5, 'Room 101'),
  (908, 'SESSION', '1-on-1 Counselling', '2026-06-11 10:00:00+00', 50, 1, 6, 'Room 101'),
  (909, 'SESSION', '1-on-1 Counselling', '2026-06-17 10:00:00+00', 50, 1, 3, 'Room 101'),
  (910, 'SESSION', '1-on-1 Counselling', '2026-06-18 11:00:00+00', 50, 1, 4, 'Room 101')
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  start_time = EXCLUDED.start_time,
  duration_min = EXCLUDED.duration_min,
  capacity = EXCLUDED.capacity,
  facilitator_id = EXCLUDED.facilitator_id,
  location = EXCLUDED.location;

-- WORKSHOP activities: Mar/Apr/May/Jun 2026
INSERT INTO activities (id, type, title, start_time, duration_min, capacity, facilitator_id, location) VALUES
  -- March
  (781, 'WORKSHOP', 'Mindfulness & Meditation',      '2026-03-12 10:00:00+00', 90, 20, 3, 'Main Hall'),
  (782, 'WORKSHOP', 'Exam Stress Relief',           '2026-03-15 15:30:00+00', 120, 25, 4, 'Room 302'),
  (783, 'WORKSHOP', 'Career Prep Group',            '2026-03-18 13:00:00+00', 90, 15, 5, 'Room 101'),
  (784, 'WORKSHOP', 'Sleep Hygiene Workshop',       '2026-03-22 14:00:00+00', 60, 12, 6, 'Room 205'),
  (785, 'WORKSHOP', 'Anxiety Management',           '2026-03-25 11:00:00+00', 90, 18, 3, 'Main Hall'),

  -- April
  (786, 'WORKSHOP', 'Mindfulness & Meditation',      '2026-04-09 10:00:00+00', 90, 20, 3, 'Main Hall'),
  (787, 'WORKSHOP', 'Exam Stress Relief',           '2026-04-14 15:30:00+00', 120, 25, 4, 'Room 302'),
  (788, 'WORKSHOP', 'Career Prep Group',            '2026-04-17 13:00:00+00', 90, 15, 5, 'Room 101'),
  (789, 'WORKSHOP', 'Sleep Hygiene Workshop',       '2026-04-23 14:00:00+00', 60, 12, 6, 'Room 205'),
  (790, 'WORKSHOP', 'Anxiety Management',           '2026-04-28 11:00:00+00', 90, 18, 3, 'Main Hall'),

  -- May
  (791, 'WORKSHOP', 'Mindfulness & Meditation',      '2026-05-12 10:00:00+00', 90, 20, 3, 'Main Hall'),
  (792, 'WORKSHOP', 'Exam Stress Relief',           '2026-05-15 15:30:00+00', 120, 25, 4, 'Room 302'),
  (793, 'WORKSHOP', 'Career Prep Group',            '2026-05-18 13:00:00+00', 90, 15, 5, 'Room 101'),
  (794, 'WORKSHOP', 'Sleep Hygiene Workshop',       '2026-05-22 14:00:00+00', 60, 12, 6, 'Room 205'),
  (795, 'WORKSHOP', 'Anxiety Management',           '2026-05-25 11:00:00+00', 90, 18, 3, 'Main Hall'),

  -- June
  (796, 'WORKSHOP', 'Mindfulness & Meditation',      '2026-06-09 10:00:00+00', 90, 20, 3, 'Main Hall'),
  (797, 'WORKSHOP', 'Exam Stress Relief',           '2026-06-12 15:30:00+00', 120, 25, 4, 'Room 302'),
  (798, 'WORKSHOP', 'Career Prep Group',            '2026-06-16 13:00:00+00', 90, 15, 5, 'Room 101'),
  (799, 'WORKSHOP', 'Sleep Hygiene Workshop',       '2026-06-19 14:00:00+00', 60, 12, 6, 'Room 205'),
  (800, 'WORKSHOP', 'Anxiety Management',           '2026-06-24 11:00:00+00', 90, 18, 3, 'Main Hall')
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  start_time = EXCLUDED.start_time,
  duration_min = EXCLUDED.duration_min,
  capacity = EXCLUDED.capacity,
  facilitator_id = EXCLUDED.facilitator_id,
  location = EXCLUDED.location;

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
  (58, 783, 13, 'CANCELLED', '2026-03-15 10:00:00+00'),
  (59, 142, 11, 'CONFIRMED', NULL),
  (60, 146, 12, 'CONFIRMED', NULL),
  (61, 157, 13, 'CONFIRMED', NULL),
  (62, 172, 14, 'CONFIRMED', NULL),
  (63, 181, 15, 'CONFIRMED', NULL),
  (64, 196, 16, 'CONFIRMED', NULL),
  (65, 199, 1, 'CONFIRMED', NULL),
  (66, 208, 2, 'CONFIRMED', NULL),
  (67, 214, 7, 'CONFIRMED', NULL),
  (68, 223, 8, 'CONFIRMED', NULL),
  (69, 791, 11, 'CONFIRMED', NULL),
  (70, 792, 12, 'CONFIRMED', NULL),
  (71, 793, 13, 'CONFIRMED', NULL),
  (72, 795, 14, 'CONFIRMED', NULL),
  (73, 796, 15, 'CONFIRMED', NULL),
  (74, 797, 16, 'CONFIRMED', NULL),
  (75, 798, 11, 'CONFIRMED', NULL),
  (76, 799, 12, 'CONFIRMED', NULL),
  (77, 800, 13, 'CONFIRMED', NULL),
  (78, 799, 14, 'CANCELLED', '2026-06-10 09:00:00+00'),
  (79, 232, 9, 'CONFIRMED', NULL),
  (80, 235, 10, 'CONFIRMED', NULL),
  (81, 241, 11, 'CONFIRMED', NULL),
  (82, 247, 12, 'CONFIRMED', NULL),
  (83, 253, 15, 'CONFIRMED', NULL),
  (84, 259, 16, 'CONFIRMED', NULL),
  (85, 796, 1, 'CONFIRMED', NULL),
  (86, 796, 2, 'CONFIRMED', NULL),
  (87, 797, 7, 'CONFIRMED', NULL),
  (88, 798, 8, 'CONFIRMED', NULL),
  (89, 800, 9, 'CONFIRMED', NULL),
  (90, 800, 10, 'CONFIRMED', NULL),
  (91, 901, 1, 'CONFIRMED', NULL),
  (92, 902, 2, 'CONFIRMED', NULL),
  (93, 903, 7, 'CONFIRMED', NULL),
  (94, 904, 8, 'CONFIRMED', NULL),
  (95, 905, 9, 'CONFIRMED', NULL),
  (96, 906, 10, 'CONFIRMED', NULL),
  (97, 907, 11, 'CONFIRMED', NULL),
  (98, 908, 12, 'CONFIRMED', NULL),
  (99, 909, 13, 'CONFIRMED', NULL),
  (100, 910, 14, 'CONFIRMED', NULL),
  (101, 786, 1, 'CONFIRMED', NULL),
  (102, 786, 2, 'CONFIRMED', NULL),
  (103, 786, 7, 'CONFIRMED', NULL),
  (104, 786, 8, 'CONFIRMED', NULL),
  (105, 786, 9, 'CONFIRMED', NULL),
  (106, 786, 10, 'CONFIRMED', NULL),
  (107, 787, 1, 'CONFIRMED', NULL),
  (108, 787, 2, 'CONFIRMED', NULL),
  (109, 787, 7, 'CONFIRMED', NULL),
  (110, 787, 8, 'CONFIRMED', NULL),
  (111, 787, 9, 'CONFIRMED', NULL),
  (112, 787, 10, 'CONFIRMED', NULL),
  (113, 787, 11, 'CONFIRMED', NULL),
  (114, 787, 12, 'CONFIRMED', NULL),
  (115, 788, 11, 'CONFIRMED', NULL),
  (116, 788, 12, 'CONFIRMED', NULL),
  (117, 788, 13, 'CONFIRMED', NULL),
  (118, 788, 14, 'CONFIRMED', NULL),
  (119, 789, 15, 'CONFIRMED', NULL),
  (120, 789, 16, 'CONFIRMED', NULL),
  (121, 789, 1, 'CONFIRMED', NULL),
  (122, 789, 2, 'CONFIRMED', NULL),
  (123, 790, 11, 'CONFIRMED', NULL),
  (124, 790, 12, 'CONFIRMED', NULL),
  (125, 790, 13, 'CONFIRMED', NULL),
  (126, 791, 1, 'CONFIRMED', NULL),
  (127, 791, 2, 'CONFIRMED', NULL),
  (128, 791, 7, 'CONFIRMED', NULL),
  (129, 792, 8, 'CONFIRMED', NULL),
  (130, 792, 9, 'CONFIRMED', NULL),
  (131, 793, 10, 'CONFIRMED', NULL),
  (132, 793, 11, 'CANCELLED', '2026-05-16 08:00:00+00'),
  (133, 794, 12, 'CONFIRMED', NULL),
  (134, 794, 13, 'CONFIRMED', NULL),
  (135, 795, 15, 'CONFIRMED', NULL),
  (136, 795, 16, 'CANCELLED', '2026-05-23 17:30:00+00'),
  (137, 796, 7, 'CONFIRMED', NULL),
  (138, 796, 8, 'CONFIRMED', NULL),
  (139, 797, 9, 'CONFIRMED', NULL),
  (140, 797, 10, 'CONFIRMED', NULL),
  (141, 798, 14, 'CONFIRMED', NULL),
  (142, 798, 15, 'CONFIRMED', NULL),
  (143, 799, 16, 'CONFIRMED', NULL),
  (144, 800, 1, 'CONFIRMED', NULL),
  (145, 800, 2, 'CONFIRMED', NULL),
  (146, 800, 7, 'CONFIRMED', NULL)
ON CONFLICT (id) DO UPDATE SET
  activity_id = EXCLUDED.activity_id,
  student_id = EXCLUDED.student_id,
  status = EXCLUDED.status,
  cancelled_at = EXCLUDED.cancelled_at;

-- FAQs
INSERT INTO faqs (id, question, preview, answer, category) VALUES
  (1, 'How to apply for an extension?', 'Learn about the eligibility criteria and the process for requesting a coursework extension...', 'To apply for an extension, you need to: 1) Log into the student portal, 2) Navigate to the Extensions section, 3) Fill out the extension request form with your reason and supporting documentation, 4) Submit the form at least 3 days before the deadline. Extensions are typically granted for medical reasons, family emergencies, or exceptional circumstances.', 'ACADEMIC_STRESS'),
  (2, 'Managing test anxiety tips', 'Explore effective strategies to stay calm and focused before and during your exams...', 'Test anxiety is common and manageable. Try these strategies: 1) Practice deep breathing exercises before the exam, 2) Arrive early to settle in, 3) Read through all questions first, 4) Start with questions you know, 5) Take short breaks if allowed, 6) Maintain a positive mindset. Our counseling center also offers test anxiety workshops.', 'MENTAL_HEALTH'),
  (3, 'Where is the student counseling center?', 'Find location details, opening hours, and contact information for the campus center...', 'The Student Counseling Center is located in Building A, Room 203. We are open Monday-Friday, 9:00 AM - 5:00 PM. For urgent matters after hours, please call our 24/7 crisis hotline at 0800-123-4567. You can also book appointments online through the CampusCompass platform.', 'CAMPUS_RESOURCES'),
  (4, 'Understanding academic probation', 'A quick guide to what probation means for your studies and how you can get support...', 'Academic probation occurs when your GPA falls below the required threshold (typically 2.0). During probation: 1) You will receive academic advising support, 2) You may have course load restrictions, 3) You must improve your GPA within one semester, 4) Additional resources are available including tutoring and study skills workshops. Contact Academic Support Services for personalized guidance.', 'ACADEMIC_STRESS'),
  (5, 'What if I miss a major deadline?', '...If you are struggling to meet a deadline due to mental health issues, you may be eligible for...', 'If you miss a major deadline due to circumstances beyond your control (illness, emergency, mental health crisis), you should: 1) Contact your professor immediately, 2) Provide documentation if possible, 3) Request a meeting to discuss options, 4) Contact the Student Support Office for advocacy. For mental health-related issues, our counseling center can provide documentation and support.', 'ACADEMIC_STRESS'),
  (6, 'Applying for an assignment extension', '...Request an extension before the final deadline. Forms are available online...', 'Assignment extension requests should be submitted at least 48 hours before the due date when possible. Log into the student portal, go to My Courses, select the relevant assignment, and click "Request Extension." You will need to provide a reason and any supporting documentation. Typical reasons include illness, family emergency, or technical difficulties. Extensions are reviewed within 24 hours.', 'ACADEMIC_STRESS'),
  (7, 'How to filter a student?', 'Learn how to use search and filter options to find relevant information...', 'You can filter information in several ways: 1) Use the search bar at the top to search by keywords, 2) Click on category tags to filter by topic, 3) Use the "All" button to reset filters. The search is smart and will find relevant results based on question content, not just titles.', 'CAMPUS_RESOURCES'),
  (8, 'Dealing with homesickness', 'Strategies and resources to help you cope with being away from home...', 'Homesickness is a normal part of the college experience. Try these strategies: 1) Stay connected with family through regular video calls, 2) Create a comfortable space in your dorm, 3) Join clubs and activities to build new connections, 4) Maintain healthy routines, 5) Give yourself time to adjust. Our counseling center offers support groups for students dealing with homesickness.', 'MENTAL_HEALTH'),
  (9, 'How to access mental health resources?', 'Information about available mental health services and how to book appointments...', 'CampusCompass offers several mental health resources: 1) One-on-one counseling sessions (book through the platform), 2) Group therapy and workshops, 3) Crisis support available 24/7, 4) Self-help resources and apps, 5) Peer support programs. All services are free and confidential for enrolled students. Book your first appointment through the Booking section.', 'MENTAL_HEALTH'),
  (10, 'Study skills and time management workshops', 'Join our workshops to improve your academic performance and manage your time better...', 'We offer regular workshops on: 1) Effective study techniques, 2) Time management strategies, 3) Note-taking skills, 4) Exam preparation, 5) Research and writing skills. Check the Activities section for upcoming workshop schedules. Workshops are free, interactive, and led by experienced academic advisors. You can also book one-on-one academic coaching sessions.', 'ACADEMIC_STRESS'),
  (11, 'Crisis support - when to seek immediate help', 'Understand when to reach out for emergency support and available crisis resources...', 'Seek immediate help if you are: 1) Having thoughts of self-harm, 2) Experiencing a mental health crisis, 3) In immediate danger. Available resources: Campus Security (24/7): 123-456-7890, Emergency Services: 999, Crisis Hotline: 0800-123-4567. The counseling center also has walk-in crisis appointments during business hours. You are never alone - help is always available.', 'MENTAL_HEALTH'),
  (12, 'Campus wellness activities and events', 'Explore upcoming wellness events, meditation sessions, and stress-relief activities...', 'Join our regular wellness activities: 1) Mindfulness meditation sessions (Tuesdays, 5 PM), 2) Yoga classes (Mondays and Thursdays, 6 PM), 3) Art therapy workshops (Fridays, 4 PM), 4) Nature walks (Weekends, 10 AM), 5) Stress-relief events during exam periods. All activities are free and open to all students. Check the Activities Dashboard for the full schedule and to register.', 'CAMPUS_RESOURCES')
ON CONFLICT (id) DO NOTHING;

-- FAQ tags
INSERT INTO faq_tags (id, faq_id, name) VALUES
  (1, 1, 'extension'),
  (2, 1, 'deadline'),
  (3, 1, 'coursework'),
  (4, 1, 'academic'),
  (5, 2, 'anxiety'),
  (6, 2, 'test'),
  (7, 2, 'exam'),
  (8, 2, 'stress'),
  (9, 2, 'mental health'),
  (10, 3, 'counseling'),
  (11, 3, 'location'),
  (12, 3, 'center'),
  (13, 3, 'campus'),
  (14, 4, 'probation'),
  (15, 4, 'academic'),
  (16, 4, 'gpa'),
  (17, 4, 'support'),
  (18, 5, 'deadline'),
  (19, 5, 'late'),
  (20, 5, 'extension'),
  (21, 5, 'mental health'),
  (22, 6, 'assignment'),
  (23, 6, 'extension'),
  (24, 6, 'deadline'),
  (25, 6, 'request'),
  (26, 7, 'search'),
  (27, 7, 'filter'),
  (28, 7, 'help'),
  (29, 7, 'navigation'),
  (30, 8, 'homesickness'),
  (31, 8, 'mental health'),
  (32, 8, 'coping'),
  (33, 8, 'support'),
  (34, 9, 'mental health'),
  (35, 9, 'counseling'),
  (36, 9, 'resources'),
  (37, 9, 'therapy'),
  (38, 10, 'study skills'),
  (39, 10, 'workshop'),
  (40, 10, 'time management'),
  (41, 10, 'academic'),
  (42, 11, 'crisis'),
  (43, 11, 'emergency'),
  (44, 11, 'mental health'),
  (45, 11, 'support'),
  (46, 11, 'urgent'),
  (47, 12, 'wellness'),
  (48, 12, 'activities'),
  (49, 12, 'events'),
  (50, 12, 'meditation'),
  (51, 12, 'yoga')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences for clean auto-increment
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('faqs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM faqs));
SELECT setval('faq_tags_id_seq', (SELECT COALESCE(MAX(id), 1) FROM faq_tags));
SELECT setval('support_threads_id_seq', (SELECT COALESCE(MAX(id), 1) FROM support_threads));
SELECT setval('messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM messages));
SELECT setval('counsellor_rotas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM counsellor_rotas));
SELECT setval('activities_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activities));
SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings));
