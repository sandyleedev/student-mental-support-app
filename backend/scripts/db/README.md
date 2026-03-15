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

- **01_create_tables.sql**: creates tables (users, support_threads, messages, counsellor_rotas, activities, bookings) and indexes (safe to re-run).
- **02_seed_data.sql**: inserts demo users, threads, messages, counsellor rotas, activities, bookings; resets sequences (safe to re-run).

## Reset DB (delete all data and apply fresh seed)

From the `backend/` directory:

```bash
cd backend
psql -d student_mental_support -c "
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS support_threads CASCADE;
DROP TABLE IF EXISTS counsellor_rotas CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
"
psql -d student_mental_support -f scripts/db/01_create_tables.sql
psql -d student_mental_support -f scripts/db/02_seed_data.sql
```

## Migrating from old schema (events / name column)

Same as reset above – drop all tables, then run 01 and 02.
