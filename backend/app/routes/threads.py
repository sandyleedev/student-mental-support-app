from flask import jsonify, request
from app import app, db
from app.models import SupportThread
from app.models.user import User


@app.route("/api/threads", methods=["POST"])
def create_thread():
    """Create a new support thread
    ---
    tags:
      - threads
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - student_id
            - topic
          properties:
            student_id:
              type: integer
              description: ID of the student creating the thread
            topic:
              type: string
              description: Subject of the support request
    responses:
      201:
        description: Thread created
      400:
        description: Validation error (missing or invalid student_id/topic)
      404:
        description: Student not found
    """
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    topic = data.get("topic")

    if student_id is None:
        return jsonify({"error": "student_id is required"}), 400
    if not topic or not str(topic).strip():
        return jsonify({"error": "topic is required and must be non-empty"}), 400

    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "student_id must be an integer"}), 400

    student = User.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    if student.role != "STUDENT":
        return jsonify({"error": "User is not a student"}), 400

    thread = SupportThread(student_id=student_id, topic=str(topic).strip(), status="WAITING")
    db.session.add(thread)
    db.session.commit()

    return (
        jsonify(
            {
                "id": thread.id,
                "student_id": thread.student_id,
                "topic": thread.topic,
                "status": thread.status,
                "created_at": thread.created_at.isoformat() if thread.created_at else None,
            }
        ),
        201,
    )
