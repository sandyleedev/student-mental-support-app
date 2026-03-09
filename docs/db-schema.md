# DB Schema (Support Request Threads & Booking)

Based on: student support requests, conversation threads, student/counsellor roles, thread states, and booking (activities, bookings). 

---

## Thread status (ThreadStatus)

Store on the thread or derive from the last message:

| status   | Meaning                    | When to set                          |
|----------|----------------------------|--------------------------------------|
| WAITING  | Student is waiting         | Last message in thread from student  |
| REPLIED  | Counsellor has replied     | Last message in thread from counsellor |

So: **WAITING** = student sent last message (waiting for counsellor). **REPLIED** = counsellor sent last message.

---

## Entities

| Table             | Purpose |
|-------------------|---------|
| `users`           | Students and counsellors (role-based) |
| `support_threads` | One thread = one student's support request |
| `messages`        | Messages in a thread (sender_id = who sent it) |
| `activities`      | Counselling sessions and workshops |
| `bookings`        | Student bookings for activities |

---

## Schema (PostgreSQL-style)

### 1. users

| Column        | Type         | Constraints        | Notes                    |
|---------------|--------------|--------------------|--------------------------|
| id            | BIGSERIAL    | PK                 |                          |
| role          | VARCHAR(20)  | NOT NULL, CHECK    | `STUDENT` \| `COUNSELLOR` (uppercase) |
| name          | VARCHAR(255) | NOT NULL           | Display name             |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | |

- `CHECK (role IN ('STUDENT', 'COUNSELLOR'))`

---

### 2. support_threads

| Column      | Type         | Constraints        | Notes        |
|-------------|--------------|--------------------|--------------|
| id          | BIGSERIAL    | PK                 |              |
| student_id  | BIGINT       | NOT NULL, FK(users)| Request creator |
| topic       | VARCHAR(255) | NOT NULL           | Subject of the request |
| status      | VARCHAR(20)  | NOT NULL, CHECK    | `WAITING` \| `REPLIED` (see Thread status above) |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |     |
| updated_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT now() |     |

- FK: `student_id` → `users(id)`.
- `CHECK (status IN ('WAITING', 'REPLIED'))`
- Index: `(student_id, created_at DESC)` for "my threads" listing.
- Index: `(status, created_at DESC)` for counsellor listing by status.

---

### 3. messages

| Column     | Type        | Constraints     | Notes              |
|------------|-------------|-----------------|--------------------|
| id         | BIGSERIAL   | PK              |                    |
| thread_id  | BIGINT      | NOT NULL, FK(support_threads) |        |
| sender_id  | BIGINT      | NOT NULL, FK(users) | Student or counsellor |
| content       | TEXT        | NOT NULL        | Message content    |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |        |

- FK: `thread_id` → `support_threads(id)`, `sender_id` → `users(id)`.
- Index: `(thread_id, created_at)` for "messages in thread" queries.

When a new message is added, update the thread’s `status`: if sender is student → `WAITING`, if sender is counsellor → `REPLIED`.

---

### 4. activities

| Column         | Type         | Constraints        | Notes |
|----------------|--------------|--------------------|-------|
| id             | BIGSERIAL    | PK                 |       |
| title          | VARCHAR(255) | NOT NULL           | Activity title |
| type         | VARCHAR(30)  | NOT NULL, CHECK    | `SESSION` \| `WORKSHOP` (ActivityType) |
| category     | VARCHAR(100) |                    | Optional grouping |
| start_time   | TIMESTAMPTZ  | NOT NULL           |       |
| end_time     | TIMESTAMPTZ  | NOT NULL           |       |
| capacity     | INT          |                    | Max attendees (optional) |
| facilitator  | VARCHAR(255) |                    | Name of facilitator |
| status       | VARCHAR(20)  | NOT NULL, CHECK    | `UPCOMING` \| `ONGOING` \| `COMPLETED` (ActivityStatus) |
| created_at     | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | |
| updated_at     | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | |

- `CHECK (type IN ('SESSION', 'WORKSHOP'))`
- `CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED'))`
- Booked count is **not stored**; derive from confirmed (BOOKED) bookings.

---

### 5. bookings

| Column      | Type        | Constraints     | Notes |
|-------------|-------------|-----------------|-------|
| id          | BIGSERIAL   | PK              |       |
| student_id  | BIGINT      | NOT NULL, FK(users) | Student who made the booking |
| activity_id | BIGINT      | NOT NULL, FK(activities) | Activity being booked |
| status      | VARCHAR(20) | NOT NULL, CHECK | `CONFIRMED` \| `CANCELLED` (BookingStatus) |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at  | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

- FK: `student_id` → `users(id)`, `activity_id` → `activities(id)`.
- `CHECK (status IN ('CONFIRMED', 'CANCELLED'))`

---

## ER (conceptual)

```
users
  ├── 1:N support_threads (as student_id)
  ├── 1:N messages (as sender_id)
  └── 1:N bookings (as student_id)

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


## Summary

- **users**: students and counsellors.
- **support_threads**: one per support request; `student_id`, `topic`, `status` (WAITING | REPLIED), timestamps.
- **messages**: all messages with `sender_id`. Update thread `status` on insert: student → WAITING, counsellor → REPLIED.
- **activities**: counselling sessions and workshops; `type` (SESSION | WORKSHOP), `category`, `start_time`, `end_time`, `capacity`, `facilitator` (string), `status` (UPCOMING | ONGOING | COMPLETED). Booked count derived from confirmed bookings.
- **bookings**: student bookings for activities; `student_id`, `activity_id`, `status` (CONFIRMED | CANCELLED).
