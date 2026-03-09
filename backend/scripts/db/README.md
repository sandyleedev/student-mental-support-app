# DB scripts

## Local setup (first time)

1. **Start PostgreSQL** (if it’s not running):

   ```bash
   brew services start postgresql@14
   ```
   (Or `postgresql@15` / `postgresql` depending on what you have.)

2. **Create the database** (once):

   ```bash
   createdb student_mental_support
   ```

3. **From the `backend/` directory**, run the scripts in order:

   ```bash
   cd backend
   psql -d student_mental_support -f scripts/db/01_create_tables.sql
   psql -d student_mental_support -f scripts/db/02_seed_data.sql
   ```

- **01_create_tables.sql**: creates tables and indexes (safe to re-run).
- **02_seed_data.sql**: inserts demo users, threads, messages, activities, and bookings; resets sequences (safe to re-run).

## Migrating from old schema (events / name column)

If you have an existing database with the old `events` table or `users.name` column, drop all tables and recreate:

```bash
psql -d student_mental_support -c "
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS support_threads CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
"
psql -d student_mental_support -f scripts/db/01_create_tables.sql
psql -d student_mental_support -f scripts/db/02_seed_data.sql
```
