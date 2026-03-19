from app import db


class FAQ(db.Model):
    __tablename__ = "faqs"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    question = db.Column(db.String(255), nullable=False)
    preview = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False,
    )

    tags = db.relationship("FAQTag", backref="faq", lazy="dynamic", cascade="all, delete-orphan")

    __table_args__ = (
        db.CheckConstraint(
            "category IN ('ACADEMIC_STRESS', 'MENTAL_HEALTH', 'CAMPUS_RESOURCES')",
            name="faqs_category_check",
        ),
    )


class FAQTag(db.Model):
    __tablename__ = "faq_tags"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    faq_id = db.Column(db.BigInteger, db.ForeignKey("faqs.id", ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(100), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("faq_id", "name", name="faq_tags_faq_name_unique"),
    )


class FAQCategory:
    ACADEMIC_STRESS = "ACADEMIC_STRESS"
    MENTAL_HEALTH = "MENTAL_HEALTH"
    CAMPUS_RESOURCES = "CAMPUS_RESOURCES"
