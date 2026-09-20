"""
Authentication Routes: Register and Login
"""
from flask import Blueprint, request, jsonify
from models import User
from database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new student.
    Expected JSON:
    {
        "name": "Aarav Sharma",
        "email": "aarav@college.edu",
        "password": "mypassword123",
        "student_id": "2023CSB1042",
        "course": "B.Tech Computer Science",
        "year": "3rd Year",
        "hostel": "Aravali Hostel",
        "room_number": "B-304",
        "role": "student"
    }
    """
    data = request.get_json() or {}

    # Basic validations
    required_fields = ['name', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"Missing required field: {field}"
            }), 400

    # Check if user with email already exists
    if User.query.filter_by(email=data['email'].strip().lower()).first():
        return jsonify({
            "success": False,
            "message": "A user with this email address already exists"
        }), 400

    # Create new user
    user = User(
        name=data['name'].strip(),
        email=data['email'].strip().lower(),
        student_id=data.get('student_id'),
        course=data.get('course'),
        year=data.get('year'),
        hostel=data.get('hostel'),
        room_number=data.get('room_number'),
        role=data.get('role', 'student')
    )
    user.set_password(data['password'])

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "data": user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Database error: {str(e)}"
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login student or admin with email and password.
    Expected JSON:
    {
        "email": "aarav@college.edu",
        "password": "mypassword123"
    }
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.name}!",
        "data": {
            "user": user.to_dict()
        }
    }), 200
