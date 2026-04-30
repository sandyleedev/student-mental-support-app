# DB Schema

Canonical DDL: `backend/scripts/db/01_create_tables.sql` (with matching constraints in `backend/app/models/`).

Coverage: users and auth; FAQs and tags; support threads and messages; counsellor rotas; activities and bookings.

---

## Thread status (ThreadStatus)

Stored on the thread or aligned when inserting messages:

| status   | Meaning                    | When to set                          |
|----------|----------------------------|--------------------------------------|
| WAITING  | Student is waiting         | Last message in thread from student  |
| REPLIED  | Counsellor has replied     | Last message in thread from counsellor |

**WAITING** = student sent last message. **REPLIED** = counsellor sent last message.

---

## Urgency (support_threads.urgency_level)

| level    | Meaning   |
|----------|-----------|
| URGENT   | Highest   |
| MEDIUM   | Medium    |
| LOW      | Lowest    |

`CHECK (urgency_level IN ('URGENT', 'MEDIUM', 'LOW'))`

---

## Entities

| Table               | Purpose |
|---------------------|---------|
| `users`             | Students and counsellors (role-based); auth fields |
| `faqs`              | FAQ entries with category |
| `faq_tags`          | Search/filter tags per FAQ (many per FAQ, unique per FAQ+name) |
| `support_threads`   | One thread per student support request |
| `messages`          | Messages in a thread (`sender_id` = author) |
| `counsellor_rotas`  | Counsellor availability by weekday and time |
| `activities`        | Counselling sessions (`SESSION`) and workshops (`WORKSHOP`) |
| `bookings`          | Student bookings for activities |

---

## Schema (PostgreSQL-style)

### 1. users

| Column     | Type         | Constraints              | Notes                    |
|------------|--------------|--------------------------|--------------------------|
| id         | BIGSERIAL    | PK                       |                          |
| role       | VARCHAR(20)  | NOT NULL, CHECK          | `STUDENT` \| `COUNSELLOR` |
| name       | VARCHAR(255) | NOT NULL                 | Display name             |
| email      | VARCHAR(255) | NOT NULL, UNIQUE         | Login identifier         |
| password   | VARCHAR(255) | NOT NULL                 | Stored credential hash   |
| created_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |                          |
| updated_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |                          |

- `CHECK (role IN ('STUDENT', 'COUNSELLOR'))`

---

### 2. faqs

| Column     | Type         | Constraints              | Notes |
|------------|--------------|--------------------------|-------|
| id         | BIGSERIAL    | PK                       |       |
| question   | VARCHAR(255) | NOT NULL                 |       |
| preview    | TEXT         | NOT NULL                 | Short excerpt            |
| answer     | TEXT         | NOT NULL                 | Full text               |
| category   | VARCHAR(50)  | NOT NULL, CHECK          | See FAQ categories below |
| created_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |       |
| updated_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |       |

- `CHECK (category IN ('ACADEMIC_STRESS', 'MENTAL_HEALTH', 'CAMPUS_RESOURCES'))`
- Index: `(category)`
- Index: `(updated_at DESC)`

---

### 3. faq_tags

| Column | Type         | Constraints                         | Notes        |
|--------|--------------|-------------------------------------|--------------|
| id     | BIGSERIAL    | PK                                  |              |
| faq_id | BIGINT       | NOT NULL, FK(`faqs`), ON DELETE CASCADE |           |
| name   | VARCHAR(100) | NOT NULL                            | Tag label    |

- `UNIQUE (faq_id, name)`
- Index: `(faq_id)`
- Index: `(name)`

---

### 4. support_threads

| Column        | Type         | Constraints              | Notes        |
|---------------|--------------|--------------------------|--------------|
| id            | BIGSERIAL    | PK                       |              |
| student_id    | BIGINT       | NOT NULL, FK(`users`)    | Thread owner |
| topic         | VARCHAR(255) | NOT NULL                 | Subject      |
| urgency_level | VARCHAR(20)  | NOT NULL, CHECK          | URGENT, MEDIUM, LOW |
| status        | VARCHAR(20)  | NOT NULL, CHECK          | WAITING, REPLIED |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |              |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |              |

- FK: `student_id` → `users(id)`.
- `CHECK (status IN ('WAITING', 'REPLIED'))`
- Index: `(student_id, created_at DESC)`
- Index: `(status, created_at DESC)`
- Index: `(urgency_level, created_at DESC)`

---

### 5. messages

| Column     | Type        | Constraints     | Notes              |
|------------|-------------|-----------------|--------------------|
| id         | BIGSERIAL   | PK              |                    |
| thread_id  | BIGINT      | NOT NULL, FK(`support_threads`) |     |
| sender_id  | BIGINT      | NOT NULL, FK(`users`) | Student or counsellor |
| content    | TEXT        | NOT NULL        | Body               |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |        |

- Index: `(thread_id, created_at)`

When a new message is added, align thread `status`: student sender → `WAITING`; counsellor → `REPLIED`.

---

### 6. counsellor_rotas

| Column        | Type         | Constraints              | Notes |
|---------------|--------------|--------------------------|-------|
| id            | BIGSERIAL    | PK                       |       |
| counsellor_id | BIGINT       | NOT NULL, FK(`users`)    |       |
| day_of_week   | VARCHAR(20)  | NOT NULL                 | e.g. `MONDAY` (app convention) |
| start_time    | TIME         | NOT NULL                 | Slot start |
| duration_min  | INT          | NOT NULL, CHECK (> 0)   | Length in minutes |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |       |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |       |

- Index: `(counsellor_id)`
- Index: `(day_of_week)`

---

### 7. activities

| Column         | Type         | Constraints              | Notes |
|----------------|--------------|--------------------------|-------|
| id             | BIGSERIAL    | PK                       |       |
| type           | VARCHAR(20)  | NOT NULL, CHECK          | `SESSION` \| `WORKSHOP` |
| title          | VARCHAR(255) | NOT NULL                 |       |
| start_time     | TIMESTAMPTZ  | NOT NULL                 |       |
| duration_min   | INT          | NOT NULL, CHECK (> 0)    | Session length; end time is derived in the API |
| capacity       | INT          | NOT NULL, CHECK (> 0)    | Max confirmed bookings |
| facilitator_id | BIGINT       | NOT NULL, FK(`users`)    | Facilitating counsellor user |
| location       | VARCHAR(255) |                          | Optional |
| created_at     | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |       |
| updated_at     | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |       |

- `CHECK (type IN ('SESSION', 'WORKSHOP'))`
- `CHECK (type != 'SESSION' OR capacity = 1)` — one-to-one sessions
- **Activity status** (`UPCOMING` \| `ONGOING` \| `COMPLETED`) is **not** a DB column; the API derives it from `start_time` + `duration_min`.
- Confirmed occupancy is **not** stored as a counter; use count of bookings with `status = 'CONFIRMED'`.

---

### 8. bookings

| Column       | Type        | Constraints     | Notes |
|--------------|-------------|-----------------|-------|
| id           | BIGSERIAL   | PK              |       |
| activity_id  | BIGINT      | NOT NULL, FK(`activities`), ON DELETE CASCADE |       |
| student_id   | BIGINT      | NOT NULL, FK(`users`) |       |
| status       | VARCHAR(20) | NOT NULL, CHECK | `CONFIRMED` \| `CANCELLED` |
| created_at   | TIMESTAMPTZ | NOT NULL, DEFAULT now() |   |
| cancelled_at | TIMESTAMPTZ |                 | Set when status becomes `CANCELLED` |

- `CHECK (status IN ('CONFIRMED', 'CANCELLED'))`
- `UNIQUE (activity_id, student_id)` — one row per student per activity
- Index: `(activity_id)`, `(student_id)`, `(status)`

---

## FAQ categories

| category           | Meaning (conceptual)   |
|--------------------|------------------------|
| ACADEMIC_STRESS    | Academic workload etc. |
| MENTAL_HEALTH      | Mental wellbeing       |
| CAMPUS_RESOURCES   | Campus services        |

---

## ER (conceptual)

```
users
  ├── 1:N support_threads (student_id)
  ├── 1:N messages (sender_id)
  ├── 1:N bookings (student_id)
  ├── 1:N counsellor_rotas (counsellor_id)
  └── 1:N activities (facilitator_id)

faqs
  └── 1:N faq_tags

support_threads
  ├── N:1 users (student)
  └── 1:N messages

messages
  ├── N:1 support_threads
  └── N:1 users (sender)

activities
  └── 1:N bookings

bookings
  ├── N:1 users (student)
  └── N:1 activities
```

---

## Summary

- **users**: roles; **email** (unique), **password**, timestamps.
- **faqs** / **faq_tags**: categorized FAQs with optional tag strings per FAQ.
- **support_threads**: **topic**, **urgency_level**, **status** (WAITING | REPLIED).
- **messages**: drive thread status updates by sender role.
- **counsellor_rotas**: weekly availability slots per counsellor.
- **activities**: **duration_min** and **facilitator_id** (FK to users); **location** optional; SESSION implies capacity 1; API-derived status.
- **bookings**: **CONFIRMED** | **CANCELLED**, **cancelled_at**, unique per activity + student; activity delete cascades to bookings.
