from flask import jsonify, request
from app import app, db
from app.models import FAQ, FAQTag, FAQCategory

VALID_CATEGORIES = (
    FAQCategory.ACADEMIC_STRESS,
    FAQCategory.MENTAL_HEALTH,
    FAQCategory.CAMPUS_RESOURCES,
)

CATEGORY_TO_LABEL = {
    FAQCategory.ACADEMIC_STRESS: "Academic Stress",
    FAQCategory.MENTAL_HEALTH: "Mental Health",
    FAQCategory.CAMPUS_RESOURCES: "Campus Resources",
}

LABEL_TO_CATEGORY = {v: k for k, v in CATEGORY_TO_LABEL.items()}


def _normalize_category(value):
    """Accept display label or enum, return enum for DB."""
    if not value:
        return None
    s = str(value).strip()
    if s in VALID_CATEGORIES:
        return s
    return LABEL_TO_CATEGORY.get(s)


def _faq_to_dict(faq, include_timestamps=True):
    """Convert FAQ model to API response dict."""
    tags = [t.name for t in faq.tags.order_by(FAQTag.name).all()]
    out = {
        "id": str(faq.id),
        "question": faq.question,
        "preview": faq.preview,
        "fullAnswer": faq.answer,
        "category": CATEGORY_TO_LABEL.get(faq.category, faq.category),
        "tags": tags,
    }
    if include_timestamps:
        out["createdDate"] = faq.created_at.strftime("%Y-%m-%d") if faq.created_at else ""
        out["lastModified"] = faq.updated_at.strftime("%Y-%m-%d") if faq.updated_at else ""
    return out


def _parse_tags(value):
    """Parse tags from JSON array or comma-separated string."""
    if value is None:
        return []
    if isinstance(value, list):
        return [str(t).strip() for t in value if str(t).strip()]
    if isinstance(value, str):
        return [t.strip() for t in value.split(",") if t.strip()]
    return []


@app.route("/api/faqs", methods=["GET"])
def list_faqs():
    """List all FAQs. Search and category filtering are handled on the frontend.
    ---
    tags:
      - faqs
    responses:
      200:
        description: List of FAQs
    """
    faqs = FAQ.query.order_by(FAQ.updated_at.desc()).all()
    return jsonify({"faqs": [_faq_to_dict(f) for f in faqs]}), 200


@app.route("/api/faqs", methods=["POST"])
def create_faq():
    """Create a new FAQ.
    ---
    tags:
      - faqs
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [question, preview, fullAnswer, category]
          properties:
            question: { type: string }
            preview: { type: string }
            fullAnswer: { type: string }
            category: { type: string }
            tags: { type: array, items: { type: string } }
    responses:
      201:
        description: Created FAQ
      400:
        description: Invalid input
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    question = (data.get("question") or "").strip()
    preview = (data.get("preview") or "").strip()
    answer = (data.get("fullAnswer") or data.get("answer") or "").strip()
    category = _normalize_category(data.get("category"))
    tags = _parse_tags(data.get("tags"))

    if not question:
        return jsonify({"error": "question is required"}), 400
    if not preview:
        return jsonify({"error": "preview is required"}), 400
    if not answer:
        return jsonify({"error": "fullAnswer is required"}), 400
    if not category:
        return jsonify({"error": "category must be Academic Stress, Mental Health, or Campus Resources"}), 400

    faq = FAQ(question=question, preview=preview, answer=answer, category=category)
    db.session.add(faq)
    db.session.flush()

    for tag_name in tags:
        if tag_name:
            db.session.add(FAQTag(faq_id=faq.id, name=tag_name))

    db.session.commit()
    return jsonify(_faq_to_dict(faq)), 201


@app.route("/api/faqs/<int:faq_id>", methods=["GET"])
def get_faq(faq_id):
    """Get a single FAQ by ID.
    ---
    tags:
      - faqs
    parameters:
      - in: path
        name: faq_id
        type: integer
        required: true
    responses:
      200:
        description: FAQ details
      404:
        description: FAQ not found
    """
    faq = FAQ.query.get(faq_id)
    if not faq:
        return jsonify({"error": "FAQ not found"}), 404
    return jsonify(_faq_to_dict(faq)), 200


@app.route("/api/faqs/<int:faq_id>", methods=["PUT"])
def update_faq(faq_id):
    """Update an existing FAQ.
    ---
    tags:
      - faqs
    consumes:
      - application/json
    parameters:
      - in: path
        name: faq_id
        type: integer
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            question: { type: string }
            preview: { type: string }
            fullAnswer: { type: string }
            category: { type: string }
            tags: { type: array, items: { type: string } }
    responses:
      200:
        description: Updated FAQ
      404:
        description: FAQ not found
      400:
        description: Invalid input
    """
    faq = FAQ.query.get(faq_id)
    if not faq:
        return jsonify({"error": "FAQ not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "question" in data:
        val = (data["question"] or "").strip()
        if not val:
            return jsonify({"error": "question cannot be empty"}), 400
        faq.question = val
    if "preview" in data:
        faq.preview = (data["preview"] or "").strip()
    if "fullAnswer" in data or "answer" in data:
        val = (data.get("fullAnswer") or data.get("answer") or "").strip()
        if not val:
            return jsonify({"error": "fullAnswer cannot be empty"}), 400
        faq.answer = val
    if "category" in data:
        cat = _normalize_category(data["category"])
        if not cat:
            return jsonify({"error": "category must be Academic Stress, Mental Health, or Campus Resources"}), 400
        faq.category = cat
    if "tags" in data:
        FAQTag.query.filter_by(faq_id=faq.id).delete()
        for tag_name in _parse_tags(data["tags"]):
            if tag_name:
                db.session.add(FAQTag(faq_id=faq.id, name=tag_name))

    db.session.commit()
    return jsonify(_faq_to_dict(faq)), 200


@app.route("/api/faqs/<int:faq_id>", methods=["DELETE"])
def delete_faq(faq_id):
    """Delete an FAQ.
    ---
    tags:
      - faqs
    parameters:
      - in: path
        name: faq_id
        type: integer
        required: true
    responses:
      204:
        description: Deleted
      404:
        description: FAQ not found
    """
    faq = FAQ.query.get(faq_id)
    if not faq:
        return jsonify({"error": "FAQ not found"}), 404
    db.session.delete(faq)
    db.session.commit()
    return "", 204
