from flask import jsonify, request
from app import app
from app.models import CounsellorRota, User


def _rota_to_dict(rota):
    """Serialize CounsellorRota to API response dict."""
    return {
        "id": str(rota.id),
        "counsellor_id": rota.counsellor_id,
        "counsellor_name": rota.counsellor.name if rota.counsellor else None,
        "day_of_week": rota.day_of_week,
        "start_time": str(rota.start_time) if rota.start_time else None,
        "duration_min": rota.duration_min,
        "duration": f"{rota.duration_min} min",
        "created_at": rota.created_at.isoformat() if rota.created_at else None,
        "updated_at": rota.updated_at.isoformat() if rota.updated_at else None,
    }


@app.route("/api/rotas", methods=["GET"])
def list_rotas():
    """View counsellor rota. Filter by userId.
    ---
    tags:
      - rotas
    parameters:
      - in: query
        name: userId
        type: integer
        description: Counsellor user ID. Omit for all rotas.
    responses:
      200:
        description: List of rotas
      404:
        description: User not found (when userId provided)
    """
    userId = request.args.get("userId")

    if userId is not None:
        try:
            userId = int(userId)
        except (TypeError, ValueError):
            return jsonify({"error": "userId must be an integer"}), 400
        user = User.query.get(userId)
        if not user:
            return jsonify({"error": "User not found"}), 404
        rotas = CounsellorRota.query.filter_by(counsellor_id=userId).order_by(
            CounsellorRota.day_of_week, CounsellorRota.start_time
        ).all()
    else:
        rotas = CounsellorRota.query.order_by(
            CounsellorRota.counsellor_id, CounsellorRota.day_of_week, CounsellorRota.start_time
        ).all()

    return jsonify({"rotas": [_rota_to_dict(r) for r in rotas]}), 200
