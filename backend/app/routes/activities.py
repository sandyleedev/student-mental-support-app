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
    """Return '60 min' style string."""
    return f"{minutes} min" if minutes else ""


def _activity_to_dict(activity, include_participants=False, include_student_name=False):
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

    if include_student_name and activity.type == "SESSION":
        confirmed = Booking.query.filter_by(activity_id=activity.id, status="CONFIRMED").first()
        out["studentName"] = confirmed.student.name if confirmed and confirmed.student else None

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
    include_student = type_val == "SESSION"
    include_participants = type_val == "WORKSHOP"
    return jsonify({
        "activities": [
            _activity_to_dict(a, include_participants=include_participants, include_student_name=include_student)
            for a in activities
        ]
    }), 200


@app.route("/api/activities", methods=["POST"])
def create_activity():
    """Create a new workshop (Wellbeing team only).
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
            - type
            - title
            - start_time
            - duration_min
            - capacity
            - facilitator_id
          properties:
            type:
              type: string
              enum: [WORKSHOP]
            title:
              type: string
            start_time:
              type: string
              format: date-time
            duration_min:
              type: integer
            capacity:
              type: integer
            facilitator_id:
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
    type_val = data.get("type", "WORKSHOP")
    if type_val != "WORKSHOP":
        return jsonify({"error": "Only WORKSHOP can be created via this endpoint"}), 400

    title = data.get("title")
    start_time = data.get("start_time")
    date_val = data.get("date")
    time_val = data.get("time")
    duration_min = data.get("duration_min") or data.get("duration")
    capacity = data.get("capacity")
    facilitator_id = data.get("facilitator_id")
    location = data.get("location")

    if not title or not str(title).strip():
        return jsonify({"error": "title is required"}), 400
    if start_time is None and (not date_val or not time_val):
        return jsonify({"error": "start_time or (date and time) is required"}), 400
    if duration_min is None:
        return jsonify({"error": "duration_min or duration is required"}), 400
    if capacity is None:
        return jsonify({"error": "capacity is required"}), 400
    if facilitator_id is None:
        return jsonify({"error": "facilitator_id is required"}), 400

    try:
        from datetime import datetime
        if start_time is not None:
            if isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        else:
            start_time = datetime.fromisoformat(f"{date_val}T{time_val}:00+00:00")
        if isinstance(duration_min, str):
            duration_min = int("".join(c for c in duration_min if c.isdigit()) or 60)
        else:
            duration_min = int(duration_min)
        capacity = int(capacity)
        facilitator_id = int(facilitator_id)
    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid format: {e}"}), 400

    if duration_min <= 0 or capacity <= 0:
        return jsonify({"error": "duration_min and capacity must be positive"}), 400

    facilitator = User.query.get(facilitator_id)
    if not facilitator or facilitator.role != "COUNSELLOR":
        return jsonify({"error": "facilitator_id must be a valid counsellor"}), 400

    activity = Activity(
        type="WORKSHOP",
        title=str(title).strip(),
        start_time=start_time,
        duration_min=duration_min,
        capacity=capacity,
        facilitator_id=facilitator_id,
        location=str(location).strip() if location else None,
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify(_activity_to_dict(activity, include_participants=True)), 201


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
    include_participants = activity.type == "WORKSHOP"
    include_student = activity.type == "SESSION"
    return jsonify(_activity_to_dict(
        activity,
        include_participants=include_participants,
        include_student_name=include_student,
    )), 200


@app.route("/api/activities/<int:activity_id>", methods=["PUT"])
def update_activity(activity_id):
    """Update workshop info (Wellbeing team only).
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
            title:
              type: string
            start_time:
              type: string
              format: date-time
            duration_min:
              type: integer
            capacity:
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
    if activity.type != "WORKSHOP":
        return jsonify({"error": "Only workshops can be updated via this endpoint"}), 400

    data = request.get_json(silent=True) or {}

    if "title" in data and data["title"]:
        activity.title = str(data["title"]).strip()
    if "start_time" in data:
        try:
            from datetime import datetime
            st = data["start_time"]
            activity.start_time = datetime.fromisoformat(st.replace("Z", "+00:00")) if isinstance(st, str) else st
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid start_time format"}), 400
    elif "date" in data and "time" in data and data["date"] and data["time"]:
        try:
            from datetime import datetime
            activity.start_time = datetime.fromisoformat(
                f"{data['date']}T{data['time']}:00+00:00"
            )
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid date/time format"}), 400
    if "duration_min" in data or "duration" in data:
        d = data.get("duration_min") or data.get("duration")
        try:
            if isinstance(d, str):
                d = int("".join(c for c in d if c.isdigit()) or 60)
            else:
                d = int(d)
            if d <= 0:
                return jsonify({"error": "duration must be positive"}), 400
            activity.duration_min = d
        except (TypeError, ValueError):
            return jsonify({"error": "duration must be a number"}), 400
    if "capacity" in data:
        try:
            c = int(data["capacity"])
            if c <= 0:
                return jsonify({"error": "capacity must be positive"}), 400
            activity.capacity = c
        except (TypeError, ValueError):
            return jsonify({"error": "capacity must be an integer"}), 400
    if "location" in data:
        activity.location = str(data["location"]).strip() if data["location"] else None

    db.session.commit()
    return jsonify(_activity_to_dict(activity, include_participants=True)), 200


@app.route("/api/activities/<int:activity_id>", methods=["DELETE"])
def delete_activity(activity_id):
    """Delete a workshop (Wellbeing team only). Cascades to bookings.
    ---
    tags:
      - activities
    parameters:
      - in: path
        name: activity_id
        type: integer
        required: true
    responses:
      204:
        description: Activity deleted
      400:
        description: Only workshops can be deleted
      404:
        description: Activity not found
    """
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
    if activity.type != "WORKSHOP":
        return jsonify({"error": "Only workshops can be deleted"}), 400
    db.session.delete(activity)
    db.session.commit()
    return "", 204
