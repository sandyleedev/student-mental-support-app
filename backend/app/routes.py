from flask import jsonify
from app import app


@app.route("/")
def index():
    return jsonify({"message": "Student Mental Support API"}), 200


@app.route("/health")
def health():
    return {"status": "ok", "message": "Server is running"}, 200


@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({"status": "ok", "message": "API is healthy"}), 200
