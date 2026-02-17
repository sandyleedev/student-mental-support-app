# Local PostgreSQL Setup Guide

This guide helps you install PostgreSQL, create the project database, run schema and seed scripts, and verify that everything works. Follow the steps for your OS.

---

## 1. Install PostgreSQL

### macOS (Homebrew)

1. Install PostgreSQL (e.g. version 14 or 15):

   ```bash
   brew install postgresql@15
   ```

   Or use the default version:

   ```bash
   brew install postgresql
   ```

2. Start the service and enable it on login (optional):

   ```bash
   brew services start postgresql@15
   ```

   If you installed the default `postgresql`, use:

   ```bash
   brew services start postgresql
   ```

3. Ensure the `psql` and `createdb` commands are on your PATH. With `postgresql@15` you may need:

   ```bash
   echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

   (Use `/usr/local/opt/postgresql@15/bin` on Intel Macs if needed.)

### Windows

**Option A: Official installer (recommended)**

1. Download the installer from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/).
2. Run the installer. During setup:
   - Remember the password you set for the `postgres` superuser.
   - Keep the default port **5432** unless you have a conflict.
   - Optionally add the PostgreSQL **bin** directory to your system PATH (the installer can do this for you).
3. After installation, open a **new** Command Prompt or PowerShell so that `psql` and `createdb` are available if PATH was updated.

**Option B: Chocolatey**

```powershell
choco install postgresql
```

Then open a new terminal. The installer typically adds PostgreSQL to PATH.

---

## 2. Create the project database

The app expects a database named **`student_mental_support`**.

### macOS / Linux / Windows (command line)

From any directory:

```bash
createdb student_mental_support
```

If you need to specify a user (e.g. on Windows the default user is often `postgres`):

```bash
createdb -U postgres student_mental_support
```

If you see “database already exists”, the database is ready; you can skip to the next section.

---

## 3. Run schema and seed scripts

Scripts live in **`backend/scripts/db/`**. Run them **in order** from the **project root** (where the `backend` folder is).

```bash
# From project root (student-mental-support-app/)
psql -d student_mental_support -f backend/scripts/db/01_create_tables.sql
psql -d student_mental_support -f backend/scripts/db/02_seed_data.sql
```

On Windows, if `psql` needs a user:

```powershell
psql -U postgres -d student_mental_support -f backend/scripts/db/01_create_tables.sql
psql -U postgres -d student_mental_support -f backend/scripts/db/02_seed_data.sql
```

- **01_create_tables.sql** – Creates `users`, `support_threads`, and `messages` tables and indexes. Safe to run multiple times.
- **02_seed_data.sql** – Inserts demo users, threads, and messages and resets sequences. Safe to run multiple times.

---

## 4. Verify the database

Connect with `psql` and check tables and data.

```bash
psql -d student_mental_support
```

(On Windows: `psql -U postgres -d student_mental_support`.)

In the `psql` prompt:

```sql
-- List tables
\dt

-- Expected: users, support_threads, messages

-- Row counts
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'support_threads', COUNT(*) FROM support_threads
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
```

You should see 3 users, 2 support_threads, and 11 messages. Exit with `\q`.

---

## 5. Run the backend and test

1. Copy env and set the database URL (default is local DB):

   ```bash
   cd backend
   cp .env.example .env
   ```

   In `.env`, ensure:

   ```env
   DATABASE_URL=postgresql+psycopg://localhost/student_mental_support
   ```

   On Windows, if your PostgreSQL user is `postgres` and has a password:

   ```env
   DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost/student_mental_support
   ```

2. Create a virtualenv, install dependencies, and run the app:

   ```bash
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   flask run
   ```

3. In another terminal, hit the API to confirm the DB is used:

   ```bash
   curl "http://localhost:5000/api/threads?user_id=1"
   ```

   You should get JSON with threads for user 1 (Rory). That confirms the local DB is set up and the app can read from it.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `createdb: command not found` | Add PostgreSQL `bin` to PATH (see macOS step 3 or Windows installer PATH option). |
| `connection refused` / `could not connect` | Start the PostgreSQL service (`brew services start postgresql@15` on macOS; on Windows check Services for “postgresql”). |
| `role "your_username" does not exist` (Windows) | Use `-U postgres` in `createdb` and `psql`, and set `DATABASE_URL` with user `postgres` and password in `.env`. |
| `database "student_mental_support" does not exist` | Run `createdb student_mental_support` (or with `-U postgres` on Windows). |
| Permission denied on `.sql` file | Run the commands from the project root so the path `backend/scripts/db/01_create_tables.sql` is valid. |

---

## Quick reference

| Step | Command (from project root) |
|------|-----------------------------|
| Create DB | `createdb student_mental_support` |
| Schema | `psql -d student_mental_support -f backend/scripts/db/01_create_tables.sql` |
| Seed | `psql -d student_mental_support -f backend/scripts/db/02_seed_data.sql` |
| Connect | `psql -d student_mental_support` |
