# Backend API

Flask API server for the Student Mental Support App.

## Database

See **[Local DB setup guide](../docs/db/db-setup.md)** for installing PostgreSQL (macOS/Windows), creating the database, running schema and seed scripts, and verification.

## Setup

macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Windows (PowerShell):
```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

## Run

```bash
flask run
```

Server: `http://localhost:5001` (default in `.env.example`).
Use `--host=0.0.0.0` only if you need access from another device on the network.

## Key Endpoints

| Method | Path             | Description                                                                     |
| ------ | ---------------- | ------------------------------------------------------------------------------- |
| GET    | /                | Root                                                                            |
| GET    | /health          | Health check                                                                    |
| GET    | /api/health      | API health                                                                      |
| GET    | /api/users       | List users (optional role filter)                                               |
| GET    | /api/threads     | List threads (?user_id=, optional ?status=ALL\|WAITING\|REPLIED for counsellor)|
| GET    | /api/threads/:id | Thread detail with messages (chronological)                                     |
| POST   | /api/threads     | Create support thread (student_id, topic, description, urgency_level)           |
| POST   | /api/threads/:id/messages | Add a message to a thread                                              |
| GET    | /api/activities  | List activities by type (session/workshop)                                      |
| GET    | /api/bookings    | List bookings by student userId                                                 |
| GET    | /api/rotas       | List counsellor rotas                                                           |

For full request/response details, run server and open Swagger docs via `/apidocs`.

## Structure

```
backend/
├── requirements.txt
├── .env.example
├── .gitignore
├── test_all.py
└── app/
    ├── __init__.py
    ├── config.py
    ├── models/
    └── routes/
```

Database scripts are in:

```
backend/scripts/db/
├── 01_create_tables.sql
├── 02_seed_data.sql
├── _rotas_gen.sql
└── _sessions_gen.sql
```

For DB reset/seed commands, see `backend/scripts/db/README.md`.
