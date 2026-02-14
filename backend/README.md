# Backend API

Flask API server for the Student Mental Support App.

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

| Method | Path        | Description   |
|--------|-------------|---------------|
| GET    | /           | Root          |
| GET    | /health     | Health check  |
| GET    | /api/health | API health    |
| POST   | /api/test   | POST test (echo body) |

## Structure

```
backend/
├── requirements.txt
├── .env.example
├── .gitignore
└── app/
    ├── __init__.py
    ├── config.py
    └── routes.py
```
