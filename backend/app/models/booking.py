from app import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    activity_id = db.Column(db.BigInteger, db.ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    cancelled_at = db.Column(db.DateTime(timezone=True))

    student = db.relationship("User", backref=db.backref("bookings", lazy="dynamic"))

    __table_args__ = (
        db.CheckConstraint("status IN ('CONFIRMED', 'CANCELLED')", name="bookings_status_check"),
        db.UniqueConstraint("activity_id", "student_id", name="bookings_activity_student_unique"),
    )


class BookingStatus:
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
