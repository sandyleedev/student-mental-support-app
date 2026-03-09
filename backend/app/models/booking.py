from enum import Enum

from app import db


class BookingStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    student_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    activity_id = db.Column(db.BigInteger, db.ForeignKey("activities.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    student = db.relationship("User", backref=db.backref("bookings", lazy="dynamic"))
    activity = db.relationship("Activity", backref=db.backref("bookings", lazy="dynamic"))

    __table_args__ = (
        db.CheckConstraint(
            "status IN ('CONFIRMED', 'CANCELLED')",
            name="bookings_status_check",
        ),
    )
