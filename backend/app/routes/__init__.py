from flask import Flask
from app.routes import activity_routes
from app.routes import auth_routes
from app.routes import application_routes
from app.routes import user_routes

# 在 app 中加载蓝图
def register_routes(app: Flask):
    app.register_blueprint(activity_routes.activity_bp, url_prefix='/api/activity')
    app.register_blueprint(auth_routes.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(application_routes.application_bp, url_prefix='/api/application')
    app.register_blueprint(user_routes.user_bp, url_prefix='/api/user')