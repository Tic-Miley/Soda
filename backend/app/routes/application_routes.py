from flask import Blueprint, request, jsonify
from app import db
from app.models import Application, Activity, User, Participation
from app.service import verify_token
from datetime import datetime

# Create applications blueprint
application_bp = Blueprint('application_bp', __name__)

@application_bp.route('/apply_activity', methods=['POST'])
def apply_activity():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):  # If verification failed
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    data = request.get_json()
    
    if not data or 'activity_id' not in data:
        return jsonify({'error': '缺少必要字段'}), 400
    
    activity_id = data['activity_id']
    
    try:
        # Check if the activity exists
        activity = Activity.query.get(activity_id)
        if not activity:
            return jsonify({'error': '该活动不存在'}), 404
        
        # Check if user is the creator (can't apply to own activity)
        if activity.creator_id == user_id:
            return jsonify({'error': '不能申请加入自己创建的活动'}), 400
        
        # Check if user already applied
        existing_application = Application.query.filter_by(
            user_id=user_id, 
            activity_id=activity_id
        ).first()
        
        if existing_application:
            return jsonify({'error': '您已经申请过这个活动了'}), 400
        
        # Check if user is already a participant
        existing_participation = Participation.query.filter_by(
            user_id=user_id, 
            activity_id=activity_id
        ).first()
        
        if existing_participation:
            return jsonify({'error': '您已经是该活动的参与者'}), 400
            
        # Create new application
        application = Application(
            user_id=user_id,
            activity_id=activity_id,
            status='pending',
            created_at=datetime.utcnow()
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({'message': '申请成功，等待审核'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'申请失败: {str(e)}'}), 500

@application_bp.route('/get_my_applications', methods=['GET'])
def get_my_applications():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    
    try:
        # Get all applications by the user
        applications = Application.query.filter_by(user_id=user_id).all()
        
        # Get detailed information for each application
        application_list = []
        for app in applications:
            activity = Activity.query.get(app.activity_id)
            if activity:
                app_info = {
                    'application_id': f"{app.user_id}-{app.activity_id}",
                    'activity_id': app.activity_id,
                    'title': activity.title,
                    'time': activity.time.isoformat(),
                    'location': activity.location,
                    'tags': str(activity.tags)[1:-1].split(','),
                    'creator_name': User.query.get(activity.creator_id).username,
                    'status': app.status,
                    'created_at': app.created_at.isoformat()
                }
                application_list.append(app_info)
        
        return jsonify(application_list), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@application_bp.route('/get_activity_applications', methods=['GET'])
def get_activity_applications():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    
    try:
        # Get all activities created by the user
        activities = Activity.query.filter_by(creator_id=user_id).all()
        activity_ids = [activity.id for activity in activities]
        
        # Get all applications for these activities
        applications = Application.query.filter(
            Application.activity_id.in_(activity_ids)
        ).all()
        
        # Get detailed information for each application
        application_list = []
        for app in applications:
            activity = Activity.query.get(app.activity_id)
            user = User.query.get(app.user_id)
            
            if activity and user:
                app_info = {
                    'application_id': f"{app.user_id}-{app.activity_id}",
                    'activity_id': app.activity_id,
                    'activity_title': activity.title,
                    'user_id': app.user_id,
                    'username': user.username,
                    'status': app.status,
                    'created_at': app.created_at.isoformat()
                }
                application_list.append(app_info)
        
        return jsonify(application_list), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@application_bp.route('/update_application_status', methods=['PUT'])
def update_application_status():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    data = request.get_json()
    
    if not data or 'application_id' not in data or 'status' not in data:
        return jsonify({'error': '缺少必要字段'}), 400
    
    app_id_parts = data['application_id'].split('-')
    if len(app_id_parts) != 2:
        return jsonify({'error': '申请ID格式错误'}), 400
    
    applicant_id = int(app_id_parts[0])
    activity_id = int(app_id_parts[1])
    new_status = data['status']
    
    if new_status not in ['accepted', 'rejected']:
        return jsonify({'error': '状态值无效'}), 400
    
    try:
        # Check if the activity exists and user is the creator
        activity = Activity.query.get(activity_id)
        if not activity or activity.creator_id != user_id:
            return jsonify({'error': '您无权修改此申请状态'}), 403
        
        # Find the application
        application = Application.query.filter_by(
            user_id=applicant_id, 
            activity_id=activity_id
        ).first()
        
        if not application:
            return jsonify({'error': '申请不存在'}), 404
        
        # Update application status
        application.status = new_status
        
        # If accepted, add participation
        if new_status == 'accepted':
            # Check if participation already exists
            existing_participation = Participation.query.filter_by(
                user_id=applicant_id, 
                activity_id=activity_id
            ).first()
            
            if not existing_participation:
                participation = Participation(
                    user_id=applicant_id,
                    activity_id=activity_id
                )
                db.session.add(participation)
        
        db.session.commit()
        
        return jsonify({'message': f'申请已{"接受" if new_status == "accepted" else "拒绝"}'}), 200
                                         
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新失败: {str(e)}'}), 500

@application_bp.route('/get_my_participations', methods=['GET'])
def get_my_participations():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    
    try:
        # Get all participations by the user
        participations = Participation.query.filter_by(user_id=user_id).all()
        
        # Get detailed information for each participation
        participation_list = []
        for p in participations:
            activity = Activity.query.get(p.activity_id)
            if activity:
                participation_info = {
                    'activity_id': p.activity_id,
                    'title': activity.title,
                    'time': activity.time.isoformat(),
                    'location': activity.location,
                    'tags': str(activity.tags)[1:-1].split(','),
                    'creator_name': User.query.get(activity.creator_id).username
                }
                participation_list.append(participation_info)
        
        return jsonify(participation_list), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@application_bp.route('/get_activity_participants', methods=['GET'])
def get_activity_participants():
    # Verify token
    decoded_token = verify_token()
    if isinstance(decoded_token, tuple):
        return decoded_token
    
    user_id = decoded_token.get('user_id')
    
    try:
        # Get all activities created by the user
        activities = Activity.query.filter_by(creator_id=user_id).all()
        activity_ids = [activity.id for activity in activities]
        
        # Get all participants for these activities
        participants_by_activity = {}
        for activity_id in activity_ids:
            participations = Participation.query.filter_by(activity_id=activity_id).all()
            participant_list = []
            
            for p in participations:
                user = User.query.get(p.user_id)
                if user:
                    participant_info = {
                        'user_id': p.user_id,
                        'username': user.username
                    }
                    participant_list.append(participant_info)
            
            participants_by_activity[activity_id] = {
                'title': Activity.query.get(activity_id).title,
                'participants': participant_list
            }
        
        return jsonify(participants_by_activity), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500