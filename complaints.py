"""
Complaints Routes: Student filing, user complaint history, and admin updates.
"""
from flask import Blueprint, request, jsonify
from models import Complaint, User
from database import db

complaints_bp = Blueprint('complaints', __name__, url_prefix='/api/complaints')

@complaints_bp.route('', methods=['POST'])
def create_complaint():
    """
    Submit a new complaint.
    Expected JSON:
    {
        "user_id": 1,
        "category": "Hygiene",
        "title": "Lukewarm water dispenser",
        "description": "The cooler in Block B is not cooling.",
        "image_url": "data:image/png;base64,..."
    }
    """
    data = request.get_json() or {}

    user_id = data.get('user_id')
    category = data.get('category')
    title = data.get('title')
    description = data.get('description')

    if not user_id or not category or not title or not description:
        return jsonify({
            "success": False,
            "message": "user_id, category, title, and description are required"
        }), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    complaint = Complaint(
        user_id=user_id,
        category=category.strip(),
        title=title.strip(),
        description=description.strip(),
        image_url=data.get('image_url'),
        status='pending'
    )

    try:
        db.session.add(complaint)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Complaint submitted successfully. Mess committee has been alerted.",
            "data": complaint.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to submit complaint: {str(e)}"
        }), 500


@complaints_bp.route('', methods=['GET'])
def get_all_complaints():
    """Admin endpoint returning all complaints."""
    complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    return jsonify({
        "success": True,
        "data": [c.to_dict() for c in complaints]
    }), 200


@complaints_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_complaints(user_id):
    """Return complaints submitted by a specific student."""
    complaints = Complaint.query.filter_by(user_id=user_id).order_by(Complaint.created_at.desc()).all()
    return jsonify({
        "success": True,
        "data": [c.to_dict() for c in complaints]
    }), 200


@complaints_bp.route('/<int:complaint_id>', methods=['GET'])
def get_single_complaint(complaint_id):
    """Return single complaint details."""
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({
            "success": False,
            "message": "Complaint not found"
        }), 404

    return jsonify({
        "success": True,
        "data": complaint.to_dict()
    }), 200


@complaints_bp.route('/<int:complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    """
    Allow admin to update complaint status and add official response.
    Expected JSON:
    {
        "status": "resolved",  // 'pending', 'under_review', 'resolved'
        "admin_response": "Water filter cartridge has been replaced."
    }
    """
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({
            "success": False,
            "message": "Complaint not found"
        }), 404

    data = request.get_json() or {}

    if 'status' in data and data['status']:
        valid_statuses = ['pending', 'under_review', 'resolved']
        new_status = data['status'].strip().lower().replace(' ', '_')
        if new_status in valid_statuses:
            complaint.status = new_status
        else:
            complaint.status = data['status'].strip()

    if 'admin_response' in data:
        complaint.admin_response = data['admin_response'].strip()

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Complaint updated successfully",
            "data": complaint.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update complaint: {str(e)}"
        }), 500
