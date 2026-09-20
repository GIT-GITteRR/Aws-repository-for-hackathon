"""
Announcements Routes: Broadcast circulars, notices and events.
"""
from flask import Blueprint, request, jsonify
from models import Announcement
from database import db

announcements_bp = Blueprint('announcements', __name__, url_prefix='/api/announcements')

@announcements_bp.route('', methods=['GET'])
def get_announcements():
    """Return all announcements ordered by latest."""
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify({
        "success": True,
        "data": [a.to_dict() for a in announcements]
    }), 200


@announcements_bp.route('', methods=['POST'])
def create_announcement():
    """
    Admin creates announcement.
    Expected JSON:
    {
        "title": "Special Festive Feast",
        "description": "Navratri festive dinner menu in Central Dining Hall.",
        "category": "Events",
        "priority": "Important"
    }
    """
    data = request.get_json() or {}

    title = data.get('title')
    description = data.get('description')

    if not title or not description:
        return jsonify({
            "success": False,
            "message": "Title and description are required"
        }), 400

    announcement = Announcement(
        title=title.strip(),
        description=description.strip(),
        category=data.get('category', 'General').strip(),
        priority=data.get('priority', 'General').strip()
    )

    try:
        db.session.add(announcement)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Announcement broadcasted successfully",
            "data": announcement.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to create announcement: {str(e)}"
        }), 500


@announcements_bp.route('/<int:announcement_id>', methods=['PUT'])
def update_announcement(announcement_id):
    """Admin edits announcement."""
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return jsonify({
            "success": False,
            "message": "Announcement not found"
        }), 404

    data = request.get_json() or {}

    if 'title' in data: announcement.title = data['title'].strip()
    if 'description' in data: announcement.description = data['description'].strip()
    if 'category' in data: announcement.category = data['category'].strip()
    if 'priority' in data: announcement.priority = data['priority'].strip()

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Announcement updated successfully",
            "data": announcement.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update announcement: {str(e)}"
        }), 500


@announcements_bp.route('/<int:announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    """Admin deletes announcement."""
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return jsonify({
            "success": False,
            "message": "Announcement not found"
        }), 404

    try:
        db.session.delete(announcement)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Announcement deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to delete announcement: {str(e)}"
        }), 500
