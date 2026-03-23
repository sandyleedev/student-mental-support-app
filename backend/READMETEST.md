# Automated API Tests for the Student Mental Support backend

This test suite is written in **pytest** and follows the testing ideas from the lecture slides:
- **BDD structure** with clear Given / When / Then intent in each test
- **Equivalence partitioning** for roles, urgency values, and activity types
- **Boundary value analysis** for activity capacity and invalid query parameters
- **System/API automation** for Flask endpoints rather than pure unit-only tests

## Files

- `backend/tests/conftest.py` — isolated Flask client and in-memory test database seed
- `backend/tests/test_general.py` — health and users tests
- `backend/tests/test_threads.py` — support thread lifecycle tests
- `backend/tests/test_activities.py` — activities CRUD and validation tests
- `backend/tests/test_bookings.py` — booking creation/cancellation tests
- `backend/tests/test_rotas.py` — rota retrieval tests
- `backend/requirements-test.txt` — test-only Python dependencies

## How to use inside your backend project

Put the files into this structure:

```text
backend/
  requirements-test.txt
  tests/
    conftest.py
    test_general.py
    test_threads.py
    test_activities.py
    test_bookings.py
    test_rotas.py
```

## Install and run

```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt
pytest -v
```

Run with coverage:

```bash
pytest --cov=app --cov-report=term-missing
```

## Notes

- The tests use `sqlite:///:memory:` so they run fast and do not require PostgreSQL.
- Seed data mirrors your real entities: users, threads, messages, rotas, activities, and bookings.
- If you later add authentication, convert the fixtures to create/login a test user and attach tokens to requests.
