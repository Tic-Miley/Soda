import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
jwt = JWTManager()

# 创建应用，加载配置、数据库、数据模型、api等
def create_app():
    app = Flask(__name__)
    # 配置
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_size': 10}

    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    jwt.init_app(app)
    # 导入数据模型
    from app import models

    # 注册蓝图
    from app.routes import register_routes
    register_routes(app)

    return app