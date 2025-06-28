import datetime
import jwt
import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User
from app.service import generate_token
   
# 创建认证蓝图
auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # 获取注册信息，并验证信息是否完整
    register_info = request.get_json()
    if not register_info or not register_info.get('username') or not register_info.get('email') or not register_info.get('password'):
        return jsonify({'error': '缺少必要字段'}), 400

    # 检查用户名或邮箱是否已存在
    if User.query.filter_by(username=register_info['username']).first() or User.query.filter_by(email=register_info['email']).first():
        return jsonify({'error': '用户名或邮箱已被使用'}), 400

    # 创建用户
    new_user = User(
        username=register_info['username'],
        email=register_info['email'],
        password_hash = generate_password_hash(register_info['password']),
        created_at = datetime.datetime.now()
    )

    # 提交数据
    db.session.add(new_user)
    db.session.commit()

    # 生成 JWT Token，在用户本地保存登录信息，后续通过token验证登录情况
    token = generate_token(new_user.get_user_info().get('id'))
    return jsonify({'message': '注册成功', 'token': token}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # 获取登录信息，并验证信息是否完整
    login_info = request.get_json()
    if not login_info or not login_info.get('email') or not login_info.get('password'):
        return jsonify({'error': '缺少邮箱或密码'}), 400

    # 查找用户
    user = User.query.filter_by(email=login_info['email']).first()
    if not user or not check_password_hash(user.password_hash, login_info['password']):
        return jsonify({'error': '邮箱或密码错误'}), 401
    
    # 生成 JWT Token，在用户本地保存登录信息，后续通过token验证登录情况
    token = generate_token(user.get_user_info().get('id'))
    return jsonify({'message': '登录成功', 'token': token}), 200
    