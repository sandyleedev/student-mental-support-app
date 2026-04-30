# Campus Compass 🧭

## Student Mental Support App (Coursework / Team Project)

Campus Compass is a student mental support app designed to help students find the right support channel quickly and comfortably (FAQs, support threads, and guided resources).

## Project Structure

- `frontend/` - React (Vite) client
- `backend/` - Flask API server
- `backend/scripts/db/` - PostgreSQL schema and seed scripts
- `docs/` - DB docs and sequence diagrams

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (3.13 also works)
- PostgreSQL (local)

## Quick Start (Copy/Paste)

If PostgreSQL is not installed or not running yet, complete setup first:

- [PostgreSQL local setup (macOS / Windows)](docs/db/db-setup.md)

### 1) Set up database

Create DB once:

```bash
createdb student_mental_support
```

Apply schema + seed (run from `backend/`):

```bash
cd backend
psql -d student_mental_support -f scripts/db/01_create_tables.sql
psql -d student_mental_support -f scripts/db/02_seed_data.sql
```

### 2) Run backend (Flask, port 5001)

macOS / Linux:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask run
```

Windows (PowerShell):

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
flask run
```

Backend URL: `http://127.0.0.1:5001`

### 3) Run frontend (Vite, port 5173)

Open a new terminal:

macOS / Linux / Windows:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## Common Reset (Local DB)

From `backend/` (macOS / Linux):

```bash
psql -d student_mental_support -c "
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS faq_tags CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS support_threads CASCADE;
DROP TABLE IF EXISTS counsellor_rotas CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
"
psql -d student_mental_support -f scripts/db/01_create_tables.sql
psql -d student_mental_support -f scripts/db/02_seed_data.sql
```

From `backend/` (Windows PowerShell):

```powershell
psql -d student_mental_support -c "DROP TABLE IF EXISTS bookings CASCADE; DROP TABLE IF EXISTS faq_tags CASCADE; DROP TABLE IF EXISTS messages CASCADE; DROP TABLE IF EXISTS support_threads CASCADE; DROP TABLE IF EXISTS counsellor_rotas CASCADE; DROP TABLE IF EXISTS activities CASCADE; DROP TABLE IF EXISTS faqs CASCADE; DROP TABLE IF EXISTS users CASCADE;"
psql -d student_mental_support -f scripts/db/01_create_tables.sql
psql -d student_mental_support -f scripts/db/02_seed_data.sql
```

## Core Docs

- [Database setup guide](docs/db/db-setup.md)
- [Database schema](docs/db/db-schema.md)
- [DB scripts guide](backend/scripts/db/README.md)
- [Backend guide](backend/README.md)
- [Frontend guide](frontend/README.md)
- [Test guide](backend/READMETEST.md)

