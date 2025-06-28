import os
import jwt
import datetime
from flask import jsonify, request

def generate_token(id):
    token = jwt.encode(
        {
            'user_id': id,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=12) # 过期时间
        },
        os.getenv('JWT_SECRET_KEY'),
        algorithm='HS256'
    )
    return token
    
def verify_token():
    # 验证前端请求是否包含用户的登录信息
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'NOTOKEN'}), 401

    # 验证登录信息是否有效
    try:
        # 解码 JWT Token
        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        return decoded_token
    except Exception:
        return jsonify({'error': 'INVALIDTOKEN'}), 500