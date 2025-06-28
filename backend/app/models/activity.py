from datetime import datetime
from app import db

class Activity(db.Model):
    __tablename__ = 'activities' 

    id = db.Column(db.Integer, primary_key=True)  # 主键，活动唯一标识
    title = db.Column(db.String(255), nullable=False) 
    time = db.Column(db.DateTime, nullable=False)  
    location = db.Column(db.String(255), nullable=False)  
    tags = db.Column(db.Text)  # 活动标签，多个标签用逗号分隔存储
    description = db.Column(db.Text) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # 外键，指向创建该活动的用户 ID

    # 与用户的一对多关系：每个活动只能有一个创建者（creator）
    creator = db.relationship(
        'User',                              # 目标模型为 User
        back_populates='created_activities'  # 对应 User 模型中的 created_activities 字段，实现双向绑定
    )

    # 与用户的多对多关系：一个活动可以有多个参与者，一个用户也可以参加多个活动
    # 使用第三张中间表 participations 来建立这种多对多映射
    participants = db.relationship(
        'User',                              # 目标模型为 User
        secondary='participations',          # 指定多对多使用的关联表 participations
        back_populates='participated_activities'  # 对应 User 模型中的 participated_activities 字段
    )

    # 与申请者的多对多关系：一个活动可以有多个申请者，一个用户也可以申请多个活动
    # 使用第三张中间表 applications 来建立这种多对多映射
    applicants = db.relationship(
        'User',                              # 目标模型为 User
        secondary='applications',            # 指定多对多使用的关联表 applications
        back_populates='applied_activities'  # 对应 User 模型中的 applied_activities 字段
    )

    def get_activity_info(self):
        return {
            'id': self.id,
            'title': self.title,
            'time': self.time,
            'location': self.location,
            'tags': str(self.tags)[1:-1].split(','),
            'description': self.description,
            'creator_id': self.creator.id,
            'creator_name': self.creator.username 
        }