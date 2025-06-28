from app import db
from datetime import datetime

class Application(db.Model):
    __tablename__ = 'applications'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), primary_key=True)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'rejected'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('applications', lazy=True))
    activity = db.relationship('Activity', backref=db.backref('applications', lazy=True))
    
    def get_application_info(self):
        return {
            'user_id': self.user_id,
            'activity_id': self.activity_id,
            'username': self.user.username,
            'activity_title': self.activity.title,
            'status': self.status,
            'created_at': self.created_at
        }