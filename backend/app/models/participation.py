from app import db

class Participation(db.Model):
    __tablename__ = 'participations'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), primary_key=True)