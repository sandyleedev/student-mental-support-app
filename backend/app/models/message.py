from app import db


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    thread_id = db.Column(db.BigInteger, db.ForeignKey("support_threads.id"), nullable=False)
    sender_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)

    thread = db.relationship("SupportThread", backref=db.backref("messages", lazy="dynamic"))
    sender = db.relationship("User", backref=db.backref("sent_messages", lazy="dynamic"))
