from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from flask import jsonify, request
from app import app, db
from app.models import Activity, Booking, User

UK_TZ = ZoneInfo("Europe/London")


def _format_date_time(dt):
    """Return (date YYYY-MM-DD, time HH:mm) in UK timezone."""
    if not dt:
        return None, None
    uk = dt.astimezone(UK_TZ) if dt.tzinfo else dt.replace(tzinfo=ZoneInfo("UTC")).astimezone(UK_TZ)
    return uk.strftime("%Y-%m-%d"), uk.strftime("%H:%M")


def _format_duration(minutes):
    return f"{minutes} min" if minutes else ""


def _booking_to_dict(booking):
    """Serialize Booking to API response dict. Matches MyBookings.tsx type."""
    activity = booking.activity
    date_str, time_str = _format_date_time(activity.start_time) if activity else (None, None)

    if booking.status == "CANCELLED":
        status = "cancelled"
    elif activity and activity.status == "COMPLETED":
        status = "completed"
    else:
        status = "upcoming"

    return {
        "id": str(booking.id),
        "title": activity.title if activity else "",
        "type": activity.type.lower() if activity else "session",
        "date": date_str or "",
        "time": time_str or "",
        "duration": _format_duration(activity.duration_min) if activity else "",
        "location": activity.location or "" if activity else "",
        "facilitator": activity.facilitator.name if activity and activity.facilitator else "",
        "status": status,
        "activity_id": booking.activity_id,
        "student_id": booking.student_id,
        "student_name": booking.student.name if booking.student else None,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
        "cancelled_at": booking.cancelled_at.isoformat() if booking.cancelled_at else None,
    }


def _booking_sort_key(booking):
    """Sort upcoming first by soonest date, then history by most recent date."""
    activity = booking.activity
    start_time = activity.start_time if activity and activity.start_time else datetime.min.replace(tzinfo=timezone.utc)

    if booking.status == "CANCELLED" or (activity and activity.status == "COMPLETED"):
        return (1, -start_time.timestamp())

    return (0, start_time.timestamp())


@app.route("/api/bookings", methods=["GET"])
def list_bookings():
    """Retrieve my bookings (student). Includes CONFIRMED and CANCELLED.
    ---
    tags:
      - bookings
    parameters:
      - in: query
        name: userId
        type: integer
        required: true
        description: Student user ID
    responses:
      200:
        description: List of bookings
      400:
        description: userId required or invalid
      404:
        description: User not found
    """
    userId = request.args.get("userId")
    if userId is None:
        return jsonify({"error": "userId is required"}), 400
    try:
        userId = int(userId)
    except (TypeError, ValueError):
        return jsonify({"error": "userId must be an integer"}), 400

    user = User.query.get(userId)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role != "STUDENT":
        return jsonify({"error": "Only students have bookings"}), 400

    bookings = Booking.query.filter_by(student_id=userId).all()
    bookings.sort(key=_booking_sort_key)
    return jsonify({"bookings": [_booking_to_dict(b) for b in bookings]}), 200


@app.route("/api/bookings", methods=["POST"])
def create_booking():
    """Book a session or workshop (Student).
    ---
    tags:
      - bookings
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - activity_id
            - student_id
          properties:
            activity_id:
              type: integer
            student_id:
              type: integer
    responses:
      201:
        description: Booking created
      400:
        description: Validation error / already booked / full
      404:
        description: Activity or student not found
    """
    data = request.get_json(silent=True) or {}
    activity_id = data.get("activity_id")
    student_id = data.get("student_id")

    if activity_id is None:
        return jsonify({"error": "activity_id is required"}), 400
    if student_id is None:
        return jsonify({"error": "student_id is required"}), 400

    try:
        activity_id = int(activity_id)
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "activity_id and student_id must be integers"}), 400

    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
    student = User.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    if student.role != "STUDENT":
        return jsonify({"error": "Only students can book"}), 400

    existing = Booking.query.filter_by(activity_id=activity_id, student_id=student_id).first()
    if existing:
        if existing.status == "CONFIRMED":
            return jsonify({"error": "Already booked"}), 400
        existing.status = "CONFIRMED"
        existing.cancelled_at = None
        db.session.commit()
        return jsonify(_booking_to_dict(existing)), 200

    confirmed_count = activity.confirmed_booking_count()
    if confirmed_count >= activity.capacity:
        return jsonify({"error": "Activity is full"}), 400

    booking = Booking(activity_id=activity_id, student_id=student_id, status="CONFIRMED")
    db.session.add(booking)
    db.session.commit()
    return jsonify(_booking_to_dict(booking)), 201


@app.route("/api/bookings/<int:booking_id>/cancel", methods=["PUT"])
def cancel_booking(booking_id):
    """Cancel a booking (Student or Wellbeing team).
    ---
    tags:
      - bookings
    parameters:
      - in: path
        name: booking_id
        type: integer
        required: true
    responses:
      200:
        description: Booking cancelled
      400:
        description: Already cancelled
      404:
        description: Booking not found
    """
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking.status == "CANCELLED":
        return jsonify({"error": "Booking already cancelled"}), 400

    booking.status = "CANCELLED"
    booking.cancelled_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(_booking_to_dict(booking)), 200


@app.route("/api/activities/<int:activity_id>/bookings/<int:student_id>/cancel", methods=["PUT"])
def cancel_activity_booking(activity_id, student_id):
    """Cancel a specific student's booking (Wellbeing team). Remove from participant list.
    ---
    tags:
      - bookings
    parameters:
      - in: path
        name: activity_id
        type: integer
        required: true
      - in: path
        name: student_id
        type: integer
        required: true
    responses:
      200:
        description: Booking cancelled
      404:
        description: Booking not found
    """
    booking = Booking.query.filter_by(
        activity_id=activity_id, student_id=student_id
    ).first()
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking.status == "CANCELLED":
        return jsonify({"error": "Booking already cancelled"}), 400

    booking.status = "CANCELLED"
    booking.cancelled_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(_booking_to_dict(booking)), 200


@app.route("/api/activities/<int:activity_id>/bookings", methods=["POST"])
def add_booking_to_activity(activity_id):
    """Add student to workshop participant list (Wellbeing team). Creates a booking.
    ---
    tags:
      - bookings
    consumes:
      - application/json
    parameters:
      - in: path
        name: activity_id
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - student_id
          properties:
            student_id:
              type: integer
    responses:
      201:
        description: Booking created
      400:
        description: Validation error / already booked / full
      404:
        description: Activity or student not found
    """
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    if student_id is None:
        return jsonify({"error": "student_id is required"}), 400
    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "student_id must be an integer"}), 400

    student = User.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    if student.role != "STUDENT":
        return jsonify({"error": "Only students can be added"}), 400

    existing = Booking.query.filter_by(activity_id=activity_id, student_id=student_id).first()
    if existing:
        if existing.status == "CONFIRMED":
            return jsonify({"error": "Student already booked"}), 400
        existing.status = "CONFIRMED"
        existing.cancelled_at = None
        db.session.commit()
        return jsonify(_booking_to_dict(existing)), 200

    if activity.confirmed_booking_count() >= activity.capacity:
        return jsonify({"error": "Activity is full"}), 400

    booking = Booking(activity_id=activity_id, student_id=student_id, status="CONFIRMED")
    db.session.add(booking)
    db.session.commit()
    return jsonify(_booking_to_dict(booking)), 201
