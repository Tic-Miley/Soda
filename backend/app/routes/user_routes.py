import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import User
from app.service import verify_token
from werkzeug.utils import secure_filename

# Create user blueprint
user_bp = Blueprint('user_bp', __name__)

# Check if the file is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png'}

@user_bp.route('/upload_avatar', methods=['POST'])
def upload_avatar():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    
    # Check if the post request has the file part
    if 'avatar' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['avatar']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        # Generate a unique filename to prevent overwriting
        filename = secure_filename(str(uuid.uuid4()) + '.png')
        
        # Create avatars directory if it doesn't exist
        avatars_dir = os.path.join(current_app.static_folder, 'avatars')
        if not os.path.exists(avatars_dir):
            os.makedirs(avatars_dir)
        
        # Save the file
        file_path = os.path.join(avatars_dir, filename)
        file.save(file_path)
        
        # Update user's avatar_url in the database
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': '用户不存在'}), 404
            
            # Set the avatar URL
            avatar_url = f'/static/avatars/{filename}'
            user.avatar_url = avatar_url
            db.session.commit()
            
            return jsonify({
                'message': '头像上传成功',
                'avatar_url': avatar_url
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'上传失败: {str(e)}'}), 500
    
    return jsonify({'error': '不支持的文件格式，只允许PNG格式'}), 400

@user_bp.route('/get_user_profile', methods=['GET'])
def get_user_profile():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    
    try:
        # Get the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # Return the user profile
        return jsonify(user.get_user_profile()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/get_user_by_id/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    try:
        # Get the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # Return the user information
        return jsonify(user.get_user_profile()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/update_profile', methods=['PUT'])
def update_profile():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    data = request.get_json()
    
    if not data:
        return jsonify({'error': '缺少必要字段'}), 400
    
    try:
        # Get the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # Update user profile fields
        if 'bio' in data:
            user.bio = data['bio']
        if 'signature' in data:
            user.signature = data['signature']
        if 'habits' in data:
            user.habits = data['habits']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        
        # Save changes to the database
        db.session.commit()
        
        # Return the updated user profile
        return jsonify({
            'message': '个人资料更新成功',
            'profile': user.get_user_profile()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新失败: {str(e)}'}), 500

@user_bp.route('/get_activity_participants/<int:activity_id>', methods=['GET'])
def get_activity_participants(activity_id):
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    try:
        # Import Activity model here to avoid circular imports
        from app.models import Activity
        
        # Get the activity
        activity = Activity.query.get(activity_id)
        if not activity:
            return jsonify({'error': '活动不存在'}), 404
        
        # Get the participants
        participants = []
        for participant in activity.participants:
            participants.append(participant.get_simple_info())
        
        # Return the participants
        return jsonify(participants), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500