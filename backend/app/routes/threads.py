from flask import jsonify, request
from app import app, db
from app.models import SupportThread, Message
from app.models.user import User


def _thread_to_dict(thread):
    """Serialize SupportThread to API response dict."""
    return {
        "id": thread.id,
        "student_id": thread.student_id,
        "topic": thread.topic,
        "status": thread.status,
        "created_at": thread.created_at.isoformat() if thread.created_at else None,
        "updated_at": thread.updated_at.isoformat() if thread.updated_at else None,
    }


def _message_to_dict(msg):
    """Serialize Message to API response dict."""
    return {
        "id": msg.id,
        "thread_id": msg.thread_id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@app.route("/api/threads/<int:thread_id>", methods=["GET"])
def get_thread(thread_id):
    """Get thread detail with messages (chronological order).
    ---
    tags:
      - threads
    parameters:
      - in: path
        name: thread_id
        type: integer
        required: true
        description: Thread ID
    responses:
      200:
        description: Thread and messages
      404:
        description: Thread not found
    """
    thread = SupportThread.query.get(thread_id)
    if not thread:
        return jsonify({"error": "Thread not found"}), 404
    messages = Message.query.filter_by(thread_id=thread_id).order_by(Message.created_at.asc()).all()
    return (
        jsonify(
            {
                "thread": _thread_to_dict(thread),
                "messages": [_message_to_dict(m) for m in messages],
            }
        ),
        200,
    )


@app.route("/api/threads/<int:thread_id>/messages", methods=["POST"])
def create_message(thread_id):
    """Add a message to a thread. Updates thread status (STUDENT → WAITING, COUNSELLOR → REPLIED).
    ---
    tags:
      - threads
    consumes:
      - application/json
    parameters:
      - in: path
        name: thread_id
        type: integer
        required: true
        description: Thread ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - sender_id
            - content
          properties:
            sender_id:
              type: integer
              description: ID of the user sending the message (STUDENT or COUNSELLOR)
            content:
              type: string
              description: Message content
          example:
            sender_id: 1
            content: I'm still stuck on the second assignment. Can we talk more?
    responses:
      201:
        description: Message created
      400:
        description: Validation error (missing or invalid sender_id/content)
      403:
        description: Forbidden (student can only send messages to their own threads)
      404:
        description: Thread or sender not found
    """
    data = request.get_json(silent=True) or {}
    sender_id = data.get("sender_id")
    content = data.get("content")

    if sender_id is None:
        return jsonify({"error": "sender_id is required"}), 400
    if content is None or not str(content).strip():
        return jsonify({"error": "content is required and must be non-empty"}), 400

    try:
        sender_id = int(sender_id)
    except (TypeError, ValueError):
        return jsonify({"error": "sender_id must be an integer"}), 400

    thread = SupportThread.query.get(thread_id)
    if not thread:
        return jsonify({"error": "Thread not found"}), 404
    sender = User.query.get(sender_id)
    if not sender:
        return jsonify({"error": "Sender not found"}), 404
    if sender.role not in ("STUDENT", "COUNSELLOR"):
        return jsonify({"error": "Sender must be a STUDENT or COUNSELLOR"}), 400
    if sender.role == "STUDENT" and thread.student_id != sender_id:
        return jsonify({"error": "Students can only send messages to their own threads"}), 403

    message = Message(thread_id=thread_id, sender_id=sender_id, content=str(content).strip())
    db.session.add(message)
    thread.status = "WAITING" if sender.role == "STUDENT" else "REPLIED"
    db.session.commit()

    return jsonify(_message_to_dict(message)), 201


@app.route("/api/threads", methods=["GET"])
def list_threads():
    """List threads (filtered by user role)
    ---
    tags:
      - threads
    parameters:
      - in: query
        name: user_id
        type: integer
        required: true
        description: ID of the user (student sees own threads, counsellor sees all)
      - in: query
        name: status
        type: string
        enum: [ALL, WAITING, REPLIED]
        description: For counsellor only. ALL or omit = no filter, WAITING/REPLIED = filter by status (tab view).
    responses:
      200:
        description: List of threads
      400:
        description: Missing or invalid user_id / invalid status
      404:
        description: User not found
    """
    user_id = request.args.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "user_id must be an integer"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == "STUDENT":
        query = SupportThread.query.filter_by(student_id=user_id)
    else:
        query = SupportThread.query
        status = request.args.get("status")
        if status is not None and status != "ALL":
            if status not in ("WAITING", "REPLIED"):
                return jsonify({"error": "status must be ALL, WAITING, or REPLIED"}), 400
            query = query.filter_by(status=status)
    threads = query.order_by(SupportThread.created_at.desc()).all()

    return jsonify({"threads": [_thread_to_dict(t) for t in threads]}), 200


@app.route("/api/threads", methods=["POST"])
def create_thread():
    """Create a new support thread with initial message
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
            - description
          properties:
            student_id:
              type: integer
              description: ID of the student creating the thread
            topic:
              type: string
              description: Subject of the support request
            description:
              type: string
              description: First message content (saved as the thread's first message)
    responses:
      201:
        description: Thread created with first message
      400:
        description: Validation error (missing or invalid student_id/topic/description)
      404:
        description: Student not found
    """
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    topic = data.get("topic")
    description = data.get("description")

    if student_id is None:
        return jsonify({"error": "student_id is required"}), 400
    if not topic or not str(topic).strip():
        return jsonify({"error": "topic is required and must be non-empty"}), 400
    if description is None or not str(description).strip():
        return jsonify({"error": "description is required and must be non-empty"}), 400

    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "student_id must be an integer"}), 400

    student = User.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    if student.role != "STUDENT":
        return jsonify({"error": "User is not a student"}), 400

    topic_str = str(topic).strip()
    description_str = str(description).strip()

    thread = SupportThread(student_id=student_id, topic=topic_str, status="WAITING")
    db.session.add(thread)
    db.session.flush()

    message = Message(
        thread_id=thread.id,
        sender_id=student_id,
        content=description_str,
    )
    db.session.add(message)
    db.session.commit()

    return jsonify(_thread_to_dict(thread)), 201
