from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = 'users'  # 指定在数据库中的表名为 'users'

    id = db.Column(db.Integer, primary_key=True)  # 主键，用户唯一标识
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False) 
    password_hash = db.Column(db.String(256), nullable=False)  # 存储加密后的密码
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New profile fields
    bio = db.Column(db.Text, nullable=True)  # 自我介绍
    signature = db.Column(db.String(100), nullable=True)  # 个性签名
    habits = db.Column(db.Text, nullable=True)  # 个人习惯
    avatar_url = db.Column(db.String(255), nullable=True, default="/icons/avatar_origin.png")  # 头像URL

    # 与活动的多对多关系：用户可以参加多个活动，一个活动也可以有多个参与者
    # 通过第三张关联表 participations 来实现
    participated_activities = db.relationship(
        'Activity',                         # 目标模型为 Activity
        secondary='participations',         # 使用中间表 participations 建立多对多关系
        back_populates='participants'       # 对应 Activity 模型中的 participants 字段，实现双向绑定
    )

    # 与活动的一对多关系：一个用户可以创建多个活动
    created_activities = db.relationship(
        'Activity',                         # 目标模型为 Activity
        back_populates='creator'            # 对应 Activity 模型中的 creator 字段，实现双向绑定
    )

    # 与申请活动的多对多关系：用户可以申请多个活动，一个活动也可以有多个申请者
    # 通过第三张关联表 applications 来实现
    applied_activities = db.relationship(
        'Activity',                         # 目标模型为 Activity
        secondary='applications',           # 使用中间表 applications 建立多对多关系
        back_populates='applicants'         # 对应 Activity 模型中的 applicants 字段，实现双向绑定
    )

    def get_user_info(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def get_user_profile(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'signature': self.signature,
            'habits': self.habits,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def get_simple_info(self):
        return {
            'id': self.id,
            'username': self.username,
            'avatar_url': self.avatar_url
        }