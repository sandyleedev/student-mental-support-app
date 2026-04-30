# Backend API

Flask API server for the Student Mental Support App.

## Database

See **[Local DB setup guide](../docs/db/db-setup.md)** for installing PostgreSQL (macOS/Windows), creating the database, running schema and seed scripts, and verification.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
flask run
```

Server: `http://localhost:5000` (default). Use `--host=0.0.0.0` only if you need access from another device on the network.

## Endpoints

| Method | Path             | Description                                                                     |
| ------ | ---------------- | ------------------------------------------------------------------------------- |
| GET    | /                | Root                                                                            |
| GET    | /health          | Health check                                                                    |
| GET    | /api/health      | API health                                                                      |
| GET    | /api/threads     | List threads (?user_id=, optional ?status=ALL\|WAITING\|REPLIED for counsellor) |
| GET    | /api/threads/:id | Thread detail with messages (chronological)                                     |
| POST   | /api/threads     | Create support thread (student_id, topic)                                       |
| POST   | /api/test        | POST test (echo body)                                                           |

## Structure

```
backend/
├── requirements.txt
├── .env.example
├── .gitignore
└── app/
    ├── __init__.py
    ├── config.py
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── support_thread.py
    │   └── message.py
    └── routes/
        ├── __init__.py
        ├── general.py
        └── threads.py
```
