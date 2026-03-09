from enum import Enum

from app import db


class ActivityType(str, Enum):
    SESSION = "SESSION"
    WORKSHOP = "WORKSHOP"


class ActivityStatus(str, Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    capacity = db.Column(db.Integer, nullable=True)
    facilitator = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    __table_args__ = (
        db.CheckConstraint(
            "type IN ('SESSION', 'WORKSHOP')",
            name="activities_type_check",
        ),
        db.CheckConstraint(
            "status IN ('UPCOMING', 'ONGOING', 'COMPLETED')",
            name="activities_status_check",
        ),
    )
