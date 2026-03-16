from flask import jsonify, request
from app import app
from app.models import User


@app.route("/api/users", methods=["GET"])
def list_users():
    """List users, optionally filtered by role. For WellbeingDashboard 'Add Student' list.
    ---
    tags:
      - users
    parameters:
      - in: query
        name: role
        type: string
        enum: [STUDENT, COUNSELLOR]
        description: Filter by role
    responses:
      200:
        description: List of users
    """
    role = request.args.get("role")
    query = User.query
    if role and role.upper() in ("STUDENT", "COUNSELLOR"):
        query = query.filter_by(role=role.upper())
    users = query.order_by(User.name.asc()).all()
    return jsonify({
        "users": [
            {
                "id": str(u.id),
                "name": u.name,
                "role": u.role,
                "email": u.email,
            }
            for u in users
        ]
    }), 200


@app.route("/")
def index():
    """Root
    ---
    tags:
      - general
    responses:
      200:
        description: API info
    """
    return jsonify({"message": "Student Mental Support API"}), 200


@app.route("/health")
def health():
    """Health check
    ---
    tags:
      - general
    responses:
      200:
        description: Server is running
    """
    return {"status": "ok", "message": "Server is running"}, 200


@app.route("/api/health", methods=["GET"])
def api_health():
    """API health check
    ---
    tags:
      - general
    responses:
      200:
        description: API is healthy
    """
    return jsonify({"status": "ok", "message": "API is healthy"}), 200


@app.route("/api/test", methods=["POST"])
def post_test():
    """POST test (echo body)
    ---
    tags:
      - general
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        schema:
          type: object
        description: Optional JSON body
    responses:
      201:
        description: Echo of request body
    """
    body = request.get_json(silent=True) or {}
    return jsonify({"received": body, "message": "POST received"}), 201
