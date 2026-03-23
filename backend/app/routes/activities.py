from datetime import datetime
from zoneinfo import ZoneInfo

from flask import jsonify, request
from app import app, db
from app.models import Activity, Booking, User

UK_TZ = ZoneInfo("Europe/London")
UTC_TZ = ZoneInfo("UTC")


def _format_date_time(dt):
    """Return (date YYYY-MM-DD, time HH:mm) in UK timezone."""
    if not dt:
        return None, None
    uk = dt.astimezone(UK_TZ) if dt.tzinfo else dt.replace(tzinfo=ZoneInfo("UTC")).astimezone(UK_TZ)
    return uk.strftime("%Y-%m-%d"), uk.strftime("%H:%M")


def _format_duration(minutes):
    """Return '60 min' style string."""
    return f"{minutes} min" if minutes else ""


def _parse_int_like(value, field_name):
    """Parse int or '90 min' style string."""
    if value is None:
        return None
    try:
        if isinstance(value, str):
            digits = "".join(ch for ch in value if ch.isdigit())
            if not digits:
                raise ValueError(field_name)
            return int(digits)
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be an integer")


def _parse_iso_datetime(value, field_name):
    """Parse ISO datetime and normalize to UTC."""
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be an ISO datetime string")

    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"Invalid {field_name} format") from exc

    # Treat naive values as UK-local wall clock time.
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UK_TZ)

    return dt.astimezone(UTC_TZ)


def _parse_start_time(data):
    """Accept start_time/startDateTime or date+time, normalize to UTC."""
    start_value = data.get("start_time", data.get("startDateTime"))
    if start_value is not None:
        return _parse_iso_datetime(start_value, "start_time")

    date_val = data.get("date")
    time_val = data.get("time")
    if not date_val or not time_val:
        return None

    try:
        local_dt = datetime.fromisoformat(f"{date_val}T{time_val}:00")
    except ValueError as exc:
        raise ValueError("Invalid date/time format") from exc

    return local_dt.replace(tzinfo=UK_TZ).astimezone(UTC_TZ)


def _parse_duration_min(data, start_time=None):
    """Accept duration_min/duration or derive from end_time/endDateTime."""
    duration_value = data.get("duration_min", data.get("duration"))
    if duration_value is not None:
        return _parse_int_like(duration_value, "duration")

    end_value = data.get("end_time", data.get("endDateTime"))
    if end_value is None:
        return None
    if start_time is None:
        raise ValueError("start_time is required when end_time is provided")

    end_time = _parse_iso_datetime(end_value, "end_time")
    duration_min = int((end_time - start_time).total_seconds() // 60)
    if duration_min <= 0:
        raise ValueError("end_time must be after start_time")
    return duration_min


def _validate_activity_fields(type_val, duration_min, capacity, facilitator_id, activity=None):
    """Validate shared activity constraints."""
    if not type_val or type_val not in ("SESSION", "WORKSHOP"):
        raise ValueError("type must be SESSION or WORKSHOP")
    if duration_min <= 0:
        raise ValueError("duration must be positive")
    if capacity <= 0:
        raise ValueError("capacity must be positive")
    if type_val == "SESSION" and capacity != 1:
        raise ValueError("SESSION capacity must be 1")

    facilitator = User.query.get(facilitator_id)
    if not facilitator or facilitator.role != "COUNSELLOR":
        raise ValueError("facilitator_id must be a valid counsellor")

    if activity is not None:
        confirmed_bookings = activity.confirmed_booking_count()
        if capacity < confirmed_bookings:
            raise ValueError("capacity cannot be less than confirmed bookings")

    return facilitator


def _activity_to_dict(activity, include_participants=False):
    """Serialize Activity to frontend-friendly dict.
    Matches: StudentBooking (TimeSlot/WorkshopEvent), TeamRota, WellbeingDashboard.
    """
    date_str, time_str = _format_date_time(activity.start_time)
    booked = activity.confirmed_booking_count()
    status_lower = activity.status.lower() if activity.status else "upcoming"

    out = {
        "id": str(activity.id),
        "title": activity.title,
        "type": activity.type.lower(),
        "date": date_str,
        "time": time_str,
        "duration": _format_duration(activity.duration_min),
        "capacity": activity.capacity,
        "booked": booked,
        "availableSlots": max(0, activity.capacity - booked),
        "status": status_lower,
        "facilitator": activity.facilitator.name if activity.facilitator else "",
        "facilitator_id": activity.facilitator_id,
        "location": activity.location or "",
        "category": "Personal Wellbeing",
        "start_time": activity.start_time.isoformat() if activity.start_time else None,
    }

    if include_participants and activity.type == "SESSION":
        confirmed = Booking.query.filter_by(activity_id=activity.id, status="CONFIRMED").first()
        out["participants"] = (
            [{
                "id": str(confirmed.student.id),
                "name": confirmed.student.name,
                "email": getattr(confirmed.student, "email", "") or "",
            }]
            if confirmed and confirmed.student
            else []
        )

    if include_participants and activity.type == "WORKSHOP":
        participants = []
        for b in activity.bookings.filter_by(status="CONFIRMED").all():
            if b.student:
                participants.append({
                    "id": str(b.student.id),
                    "name": b.student.name,
                    "email": getattr(b.student, "email", "") or "",
                })
        out["participants"] = participants

    return out


@app.route("/api/activities", methods=["GET"])
def list_activities():
    """List activities (sessions or workshops) with optional filters.
    ---
    tags:
      - activities
    parameters:
      - in: query
        name: type
        type: string
        enum: [session, workshop]
        required: true
        description: session or workshop (case-insensitive)
      - in: query
        name: userId
        type: integer
        description: For workshop filter=mine only. Sessions always return all counsellors.
      - in: query
        name: filter
        type: string
        enum: [all, mine]
        description: For workshop + counsellor. mine = my workshops only.
    responses:
      200:
        description: List of activities
      400:
        description: Invalid type or filter
    """
    type_param = request.args.get("type")
    if not type_param:
        return jsonify({"error": "type is required (session or workshop)"}), 400

    type_val = type_param.upper()
    if type_val == "SESSION":
        type_val = "SESSION"
    elif type_val == "WORKSHOP":
        type_val = "WORKSHOP"
    else:
        return jsonify({"error": "type must be session or workshop"}), 400

    query = Activity.query.filter_by(type=type_val)

    userId = request.args.get("userId")
    filter_param = request.args.get("filter", "all")

    if type_val == "WORKSHOP" and filter_param not in ("all", "mine"):
        return jsonify({"error": "filter must be all or mine"}), 400

    if userId is not None:
        try:
            userId = int(userId)
        except (TypeError, ValueError):
            return jsonify({"error": "userId must be an integer"}), 400
        user = User.query.get(userId)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if type_val == "WORKSHOP" and filter_param == "mine":
            query = query.filter_by(facilitator_id=userId)

    activities = query.order_by(Activity.start_time.asc()).all()
    include_participants = True
    return jsonify({
        "activities": [
            _activity_to_dict(a, include_participants=include_participants)
            for a in activities
        ]
    }), 200


@app.route("/api/activities", methods=["POST"])
def create_activity():
    """Create a new activity (Wellbeing team only).
    ---
    tags:
      - activities
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - facilitator_id
            - capacity
          properties:
            type:
              type: string
              enum: [SESSION, WORKSHOP]
            title:
              type: string
            start_time:
              type: string
              format: date-time
            startDateTime:
              type: string
              format: date-time
            date:
              type: string
            time:
              type: string
            duration_min:
              type: integer
            duration:
              type: string
            end_time:
              type: string
              format: date-time
            endDateTime:
              type: string
              format: date-time
            capacity:
              type: integer
            facilitator_id:
              type: integer
            facilitatorId:
              type: integer
            location:
              type: string
    responses:
      201:
        description: Activity created
      400:
        description: Validation error
    """
    data = request.get_json(silent=True) or {}
    type_val = str(data.get("type", "WORKSHOP")).upper()

    title = data.get("title")
    capacity = data.get("capacity")
    facilitator_id = data.get("facilitator_id", data.get("facilitatorId", data.get("userId")))
    location = data.get("location")

    if not title or not str(title).strip():
        return jsonify({"error": "title is required"}), 400
    if capacity is None:
        return jsonify({"error": "capacity is required"}), 400
    if facilitator_id is None:
        return jsonify({"error": "facilitator_id is required"}), 400

    try:
        start_time = _parse_start_time(data)
        if start_time is None:
            return jsonify({"error": "start_time/startDateTime or (date and time) is required"}), 400
        duration_min = _parse_duration_min(data, start_time=start_time)
        if duration_min is None:
            return jsonify({"error": "duration_min/duration or end_time/endDateTime is required"}), 400
        capacity = _parse_int_like(capacity, "capacity")
        facilitator_id = _parse_int_like(facilitator_id, "facilitator_id")
        _validate_activity_fields(type_val, duration_min, capacity, facilitator_id)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    activity = Activity(
        type=type_val,
        title=str(title).strip(),
        start_time=start_time,
        duration_min=duration_min,
        capacity=capacity,
        facilitator_id=facilitator_id,
        location=str(location).strip() if location else None,
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify(
        _activity_to_dict(
            activity,
            include_participants=True,
        )
    ), 201


@app.route("/api/activities/<int:activity_id>", methods=["GET"])
def get_activity(activity_id):
    """Get single activity with participants (for workshop detail).
    ---
    tags:
      - activities
    parameters:
      - in: path
        name: activity_id
        type: integer
        required: true
    responses:
      200:
        description: Activity detail
      404:
        description: Activity not found
    """
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
    return jsonify(_activity_to_dict(
        activity,
        include_participants=True,
    )), 200


@app.route("/api/activities/<int:activity_id>", methods=["PUT"])
def update_activity(activity_id):
    """Update activity info (Wellbeing team only).
    ---
    tags:
      - activities
    consumes:
      - application/json
    parameters:
      - in: path
        name: activity_id
        type: integer
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            type:
              type: string
              enum: [SESSION, WORKSHOP]
            title:
              type: string
            start_time:
              type: string
              format: date-time
            startDateTime:
              type: string
              format: date-time
            date:
              type: string
            time:
              type: string
            duration_min:
              type: integer
            duration:
              type: string
            end_time:
              type: string
              format: date-time
            endDateTime:
              type: string
              format: date-time
            capacity:
              type: integer
            facilitator_id:
              type: integer
            facilitatorId:
              type: integer
            location:
              type: string
    responses:
      200:
        description: Activity updated
      400:
        description: Validation error
      404:
        description: Activity not found
    """
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    data = request.get_json(silent=True) or {}
    type_val = str(data.get("type", activity.type)).upper()

    try:
        if "title" in data:
            if not str(data["title"]).strip():
                return jsonify({"error": "title cannot be empty"}), 400
            activity.title = str(data["title"]).strip()

        if any(key in data for key in ("start_time", "startDateTime", "date", "time")):
            start_time = _parse_start_time(data)
            if start_time is None:
                return jsonify({"error": "start_time/startDateTime or (date and time) is required"}), 400
            activity.start_time = start_time

        if any(key in data for key in ("duration_min", "duration", "end_time", "endDateTime")):
            duration_min = _parse_duration_min(data, start_time=activity.start_time)
            if duration_min is None:
                return jsonify({"error": "duration_min/duration or end_time/endDateTime is required"}), 400
            activity.duration_min = duration_min

        if "capacity" in data:
            activity.capacity = _parse_int_like(data["capacity"], "capacity")

        if "facilitator_id" in data or "facilitatorId" in data or "userId" in data:
            activity.facilitator_id = _parse_int_like(
                data.get("facilitator_id", data.get("facilitatorId", data.get("userId"))),
                "facilitator_id",
            )

        if "location" in data:
            activity.location = str(data["location"]).strip() if data["location"] else None

        activity.type = type_val
        _validate_activity_fields(
            activity.type,
            activity.duration_min,
            activity.capacity,
            activity.facilitator_id,
            activity=activity,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    db.session.commit()
    return jsonify(
        _activity_to_dict(
            activity,
            include_participants=True,
        )
    ), 200


@app.route("/api/activities/<int:activity_id>", methods=["DELETE"])
def delete_activity(activity_id):
    """Delete an activity (Wellbeing team only). Cascades to bookings.
    ---
    tags:
      - activities
    parameters:
      - in: path
        name: activity_id
        type: integer
        required: true
    responses:
      200:
        description: Activity deleted
      404:
        description: Activity not found
    """
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
    db.session.delete(activity)
    db.session.commit()
    return jsonify({"message": "Activity deleted", "id": str(activity_id)}), 200
