from app import db


class SupportThread(db.Model):
    __tablename__ = "support_threads"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    student_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    student = db.relationship("User", backref=db.backref("threads", lazy="dynamic"))

    __table_args__ = (db.CheckConstraint("status IN ('WAITING', 'REPLIED')", name="support_threads_status_check"),)
