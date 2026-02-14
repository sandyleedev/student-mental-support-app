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
- **02_seed_data.sql**: inserts demo users, threads, and messages; resets sequences (safe to re-run).
