from app import db


class CounsellorRota(db.Model):
    __tablename__ = "counsellor_rotas"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    counsellor_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    day_of_week = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    duration_min = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    counsellor = db.relationship("User", backref=db.backref("rotas", lazy="dynamic"))

    __table_args__ = (db.CheckConstraint("duration_min > 0", name="counsellor_rotas_duration_check"),)
