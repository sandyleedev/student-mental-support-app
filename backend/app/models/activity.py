from datetime import datetime, timezone, timedelta

from app import db


def compute_activity_status(start_time: datetime, duration_min: int) -> str:
    """Derive status from start_time and duration. UPCOMING | ONGOING | COMPLETED."""
    end_time = start_time + timedelta(minutes=duration_min)
    now = datetime.now(timezone.utc)
    if now < start_time:
        return "UPCOMING"
    if now < end_time:
        return "ONGOING"
    return "COMPLETED"


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    type = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    duration_min = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    facilitator_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    facilitator = db.relationship("User", backref=db.backref("facilitated_activities", lazy="dynamic"))
    bookings = db.relationship("Booking", backref="activity", lazy="dynamic", cascade="all, delete-orphan")

    __table_args__ = (
        db.CheckConstraint("type IN ('SESSION', 'WORKSHOP')", name="activities_type_check"),
        db.CheckConstraint("duration_min > 0", name="activities_duration_check"),
        db.CheckConstraint("capacity > 0", name="activities_capacity_check"),
        db.CheckConstraint("type != 'SESSION' OR capacity = 1", name="activities_session_capacity"),
    )

    @property
    def status(self) -> str:
        return compute_activity_status(self.start_time, self.duration_min)

    def confirmed_booking_count(self) -> int:
        return self.bookings.filter_by(status="CONFIRMED").count()


class ActivityType:
    SESSION = "SESSION"
    WORKSHOP = "WORKSHOP"


class ActivityStatus:
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
