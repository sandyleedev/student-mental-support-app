# Automated API Tests for the Student Mental Support backend

This test suite is written in **pytest** and follows the testing ideas from the lecture slides:
- **BDD structure** with clear Given / When / Then intent in each test
- **Equivalence partitioning** for roles, urgency values, and activity types
- **Boundary value analysis** for activity capacity and invalid query parameters
- **System/API automation** for Flask endpoints rather than pure unit-only tests

## File

- `backend/test_all.py` - integrated API test suite using `pytest`

## Install and run

```bash
cd backend
# If virtualenv is not set up yet:
python3 -m venv venv
source venv/bin/activate   # Windows PowerShell: .\venv\Scripts\Activate.ps1

pip install -r requirements.txt
pip install pytest
pytest -v test_all.py
```

Run with coverage:

```bash
pytest --cov=app --cov-report=term-missing test_all.py
```

## Notes

- The tests use `sqlite:///:memory:` so they run fast and do not require PostgreSQL.
- Seed data mirrors your real entities: users, threads, messages, rotas, activities, and bookings.
- If you later add authentication, convert the fixtures to create/login a test user and attach tokens to requests.
