import os
from datetime import datetime, time, timezone

import pytest

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app import app, db
from app.models import User, SupportThread, Message, Activity, Booking, CounsellorRota


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.app_context():
        db.drop_all()
        db.create_all()

        # Users
        student1 = User(
            id=1,
            role="STUDENT",
            name="Alice Student",
            email="alice@test.com",
            password="123456",
        )
        student2 = User(
            id=2,
            role="STUDENT",
            name="Bob Student",
            email="bob@test.com",
            password="123456",
        )
        counsellor1 = User(
            id=3,
            role="COUNSELLOR",
            name="Carol Counsellor",
            email="carol@test.com",
            password="123456",
        )

        db.session.add_all([student1, student2, counsellor1])

        # Threads
        thread1 = SupportThread(
            id=1,
            student_id=1,
            topic="Exam stress",
            urgency_level="LOW",
            status="WAITING",
        )
        thread2 = SupportThread(
            id=2,
            student_id=1,
            topic="Sleep problem",
            urgency_level="URGENT",
            status="REPLIED",
        )
        db.session.add_all([thread1, thread2])

        # Messages
        msg1 = Message(
            id=1,
            thread_id=1,
            sender_id=1,
            content="I feel stressed.",
        )
        msg2 = Message(
            id=2,
            thread_id=1,
            sender_id=3,
            content="Let's make a plan.",
        )
        db.session.add_all([msg1, msg2])

        # Activities
        session1 = Activity(
            id=1,
            type="SESSION",
            title="1-on-1 Counselling",
            start_time=datetime(2026, 3, 20, 9, 0, tzinfo=timezone.utc),
            duration_min=50,
            capacity=1,
            facilitator_id=3,
            location="Room 101",
        )
        workshop1 = Activity(
            id=2,
            type="WORKSHOP",
            title="Stress Relief Workshop",
            start_time=datetime(2026, 3, 21, 14, 0, tzinfo=timezone.utc),
            duration_min=90,
            capacity=10,
            facilitator_id=3,
            location="Main Hall",
        )
        db.session.add_all([session1, workshop1])

        # Bookings
        booking1 = Booking(
            id=1,
            activity_id=1,
            student_id=1,
            status="CONFIRMED",
        )
        booking2 = Booking(
            id=2,
            activity_id=2,
            student_id=1,
            status="CANCELLED",
        )
        db.session.add_all([booking1, booking2])

        # Rotas
        rota1 = CounsellorRota(
            id=1,
            counsellor_id=3,
            day_of_week="MONDAY",
            start_time=time(9, 0),
            duration_min=50,
        )
        rota2 = CounsellorRota(
            id=2,
            counsellor_id=3,
            day_of_week="TUESDAY",
            start_time=time(10, 0),
            duration_min=50,
        )
        db.session.add_all([rota1, rota2])

        db.session.commit()

    with app.test_client() as client:
        yield client

    with app.app_context():
        db.session.remove()
        db.drop_all()


# -------------------------
# General
# -------------------------

def test_root(client):
    res = client.get("/")
    assert res.status_code == 200


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json["status"] == "ok"


def test_users(client):
    res = client.get("/api/users")
    assert res.status_code == 200
    assert "users" in res.json
    assert len(res.json["users"]) == 3


def test_users_filter_students(client):
    res = client.get("/api/users?role=STUDENT")
    assert res.status_code == 200
    assert all(u["role"] == "STUDENT" for u in res.json["users"])


# -------------------------
# Threads
# -------------------------

def test_threads_missing_user(client):
    res = client.get("/api/threads")
    assert res.status_code == 400


def test_threads_student_view(client):
    res = client.get("/api/threads?user_id=1")
    assert res.status_code == 200
    assert len(res.json["threads"]) == 2


def test_threads_invalid_user_type(client):
    res = client.get("/api/threads?user_id=abc")
    assert res.status_code == 400


def test_thread_detail_success(client):
    res = client.get("/api/threads/1")
    assert res.status_code == 200
    assert res.json["thread"]["id"] == 1
    assert len(res.json["messages"]) == 2


def test_thread_detail_not_found(client):
    res = client.get("/api/threads/999")
    assert res.status_code == 404


def test_create_thread_missing_fields(client):
    res = client.post("/api/threads", json={})
    assert res.status_code == 400


def test_create_message_missing_sender(client):
    res = client.post("/api/threads/1/messages", json={"content": "hello"})
    assert res.status_code == 400


def test_create_message_forbidden_other_student_thread(client):
    # thread 1 belongs to student 1, not student 2
    res = client.post("/api/threads/1/messages", json={
        "sender_id": 2,
        "content": "This is not my thread",
    })
    assert res.status_code == 403


# -------------------------
# Activities
# -------------------------

def test_list_activities_session(client):
    res = client.get("/api/activities?type=session")
    assert res.status_code == 200
    assert all(a["type"] == "session" for a in res.json["activities"])


def test_list_activities_workshop(client):
    res = client.get("/api/activities?type=workshop")
    assert res.status_code == 200
    assert all(a["type"] == "workshop" for a in res.json["activities"])


def test_list_activities_missing_type(client):
    res = client.get("/api/activities")
    assert res.status_code == 400


def test_get_activity_success(client):
    res = client.get("/api/activities/2")
    assert res.status_code == 200
    assert res.json["title"] == "Stress Relief Workshop"


def test_get_activity_not_found(client):
    res = client.get("/api/activities/999")
    assert res.status_code == 404


def test_create_activity_invalid_empty(client):
    res = client.post("/api/activities", json={})
    assert res.status_code == 400


def test_update_activity_success(client):
    res = client.put("/api/activities/2", json={"title": "Updated Workshop"})
    assert res.status_code == 200
    assert res.json["title"] == "Updated Workshop"


def test_delete_activity_not_found(client):
    res = client.delete("/api/activities/999")
    assert res.status_code == 404


# -------------------------
# Bookings
# -------------------------

def test_get_bookings_missing_user(client):
    res = client.get("/api/bookings")
    assert res.status_code == 400


def test_get_bookings_success(client):
    res = client.get("/api/bookings?userId=1")
    assert res.status_code == 200
    assert "bookings" in res.json


def test_get_bookings_non_student_user(client):
    res = client.get("/api/bookings?userId=3")
    assert res.status_code == 400


def test_create_booking_invalid_empty(client):
    res = client.post("/api/bookings", json={})
    assert res.status_code == 400


def test_cancel_booking_success(client):
    res = client.put("/api/bookings/1/cancel")
    assert res.status_code == 200
    assert res.json["status"] == "cancelled"


def test_cancel_booking_not_found(client):
    res = client.put("/api/bookings/999/cancel")
    assert res.status_code == 404


# -------------------------
# Rotas
# -------------------------

def test_list_rotas(client):
    res = client.get("/api/rotas")
    assert res.status_code == 200
    assert len(res.json["rotas"]) == 2


def test_list_rotas_filter_by_user(client):
    res = client.get("/api/rotas?userId=3")
    assert res.status_code == 200
    assert all(r["counsellor_id"] == 3 for r in res.json["rotas"])


def test_list_rotas_invalid_user(client):
    res = client.get("/api/rotas?userId=abc")
    assert res.status_code == 400


def test_list_rotas_user_not_found(client):
    res = client.get("/api/rotas?userId=999")
    assert res.status_code == 404

# =========================================================
# BOUNDARY CASE TESTS
# =========================================================

def test_create_thread_empty_topic(client):
    """
    Boundary: topic is empty string
    Expected: 400
    """
    res = client.post("/api/threads", json={
        "student_id": 1,
        "topic": "",
        "description": "Need help",
        "urgency_level": "low",
    })
    assert res.status_code == 400


def test_create_thread_blank_description(client):
    """
    Boundary: description is whitespace only
    Expected: 400
    """
    res = client.post("/api/threads", json={
        "student_id": 1,
        "topic": "Stress",
        "description": "   ",
        "urgency_level": "low",
    })
    assert res.status_code == 400


def test_create_thread_invalid_urgency_boundary(client):
    """
    Boundary: urgency outside allowed set
    Expected: 400
    """
    res = client.post("/api/threads", json={
        "student_id": 1,
        "topic": "Stress",
        "description": "Need help",
        "urgency_level": "highest",
    })
    assert res.status_code == 400


def test_create_activity_capacity_zero(client):
    """
    Boundary: capacity = 0
    Expected: 400
    """
    res = client.post("/api/activities", json={
        "type": "WORKSHOP",
        "title": "Boundary Workshop",
        "date": "2026-03-30",
        "time": "10:00",
        "duration_min": 60,
        "capacity": 0,
        "facilitator_id": 3,
        "location": "Room 1",
    })
    assert res.status_code == 400


def test_create_activity_duration_zero(client):
    """
    Boundary: duration = 0
    Expected: 400
    """
    res = client.post("/api/activities", json={
        "type": "WORKSHOP",
        "title": "Boundary Workshop",
        "date": "2026-03-30",
        "time": "10:00",
        "duration_min": 0,
        "capacity": 5,
        "facilitator_id": 3,
        "location": "Room 1",
    })
    assert res.status_code == 400


def test_create_session_capacity_not_one(client):
    """
    Boundary: SESSION must have capacity = 1
    Expected: 400
    """
    res = client.post("/api/activities", json={
        "type": "SESSION",
        "title": "1-on-1 Session",
        "date": "2026-03-30",
        "time": "10:00",
        "duration_min": 50,
        "capacity": 2,
        "facilitator_id": 3,
        "location": "Room 101",
    })
    assert res.status_code == 400


def test_update_activity_capacity_zero(client):
    """
    Boundary: updating existing activity to capacity 0
    Expected: 400
    """
    res = client.put("/api/activities/2", json={
        "capacity": 0
    })
    assert res.status_code == 400


def test_update_activity_empty_title(client):
    """
    Boundary: empty title on update
    Expected: 400
    """
    res = client.put("/api/activities/2", json={
        "title": ""
    })
    assert res.status_code == 400


def test_get_bookings_userid_zero(client):
    """
    Boundary: userId = 0 (non-existent)
    Expected: 404
    """
    res = client.get("/api/bookings?userId=0")
    assert res.status_code == 404


def test_cancel_booking_twice_boundary(client):
    """
    Boundary: cancel same booking twice
    Expected: first 200, second 400
    """
    first = client.put("/api/bookings/1/cancel")
    second = client.put("/api/bookings/1/cancel")

    assert first.status_code == 200
    assert second.status_code == 400


def test_rotas_userid_zero(client):
    """
    Boundary: rota query with userId = 0
    Expected: 404
    """
    res = client.get("/api/rotas?userId=0")
    assert res.status_code == 404


def test_users_invalid_role_boundary(client):
    """
    Boundary: unsupported role filter
    Current route should still return 200 and ignore bad role
    """
    res = client.get("/api/users?role=ADMIN")
    assert res.status_code == 200
    assert "users" in res.json


def test_add_booking_missing_student_id_boundary(client):
    """
    Boundary: missing student_id in add booking to activity
    Expected: 400
    """
    res = client.post("/api/activities/2/bookings", json={})
    assert res.status_code == 400


def test_add_booking_invalid_student_id_boundary(client):
    """
    Boundary: non-integer student_id
    Expected: 400
    """
    res = client.post("/api/activities/2/bookings", json={
        "student_id": "abc"
    })
    assert res.status_code == 400


def test_create_booking_non_integer_ids_boundary(client):
    """
    Boundary: non-integer booking ids
    Expected: 400
    """
    res = client.post("/api/bookings", json={
        "activity_id": "x",
        "student_id": "y",
    })
    assert res.status_code == 400