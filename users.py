"""
User Profile Routes: Fetch and update user information.
"""
from flask import Blueprint, request, jsonify
from models import User
from database import db

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Return user profile by ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "data": user.to_dict()
    }), 200


@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Update user profile information.
    Accepts: name, student_id, course, year, hostel, room_number
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    data = request.get_json() or {}

    if 'name' in data and data['name']:
        user.name = data['name'].strip()
    if 'student_id' in data:
        user.student_id = data['student_id']
    if 'course' in data:
        user.course = data['course']
    if 'year' in data:
        user.year = data['year']
    if 'hostel' in data:
        user.hostel = data['hostel']
    if 'room_number' in data:
        user.room_number = data['room_number']

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "data": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update profile: {str(e)}"
        }), 500
