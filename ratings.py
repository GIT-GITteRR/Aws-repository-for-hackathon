"""
Ratings Routes: Submit meal ratings and compute average multi-criteria scores.
"""
from flask import Blueprint, request, jsonify
from models import Rating, Meal, User
from database import db

ratings_bp = Blueprint('ratings', __name__, url_prefix='/api/ratings')

@ratings_bp.route('', methods=['POST'])
def submit_rating():
    """
    Allow a student to submit a rating for a meal.
    Expected JSON:
    {
        "user_id": 1,
        "meal_id": 2,
        "taste": 5,
        "quality": 4,
        "quantity": 5,
        "hygiene": 4,
        "comment": "Paneer was fresh and hot!"
    }
    """
    data = request.get_json() or {}

    user_id = data.get('user_id')
    meal_id = data.get('meal_id')

    if not user_id or not meal_id:
        return jsonify({
            "success": False,
            "message": "user_id and meal_id are required"
        }), 400

    # Validate that meal exists
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    # Validate that user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    # Check if student already rated this meal
    existing_rating = Rating.query.filter_by(user_id=user_id, meal_id=meal_id).first()
    if existing_rating:
        return jsonify({
            "success": False,
            "message": "You have already submitted a rating for this meal."
        }), 409

    # Validate scores (1-5)
    try:
        taste = max(1, min(5, int(data.get('taste', 5))))
        quality = max(1, min(5, int(data.get('quality', 5))))
        quantity = max(1, min(5, int(data.get('quantity', 5))))
        hygiene = max(1, min(5, int(data.get('hygiene', 5))))
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Scores for taste, quality, quantity, and hygiene must be numbers between 1 and 5"
        }), 400

    rating = Rating(
        user_id=user_id,
        meal_id=meal_id,
        taste=taste,
        quality=quality,
        quantity=quantity,
        hygiene=hygiene,
        comment=data.get('comment', '').strip()
    )

    try:
        db.session.add(rating)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Rating submitted successfully!",
            "data": rating.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to submit rating: {str(e)}"
        }), 500


@ratings_bp.route('', methods=['GET'])
def get_all_ratings():
    """Return all ratings across the mess."""
    ratings = Rating.query.order_by(Rating.created_at.desc()).all()
    return jsonify({
        "success": True,
        "data": [r.to_dict() for r in ratings]
    }), 200


@ratings_bp.route('/meal/<int:meal_id>', methods=['GET'])
def get_meal_ratings(meal_id):
    """Return all rating entries for a specific meal."""
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    ratings = Rating.query.filter_by(meal_id=meal_id).order_by(Rating.created_at.desc()).all()
    return jsonify({
        "success": True,
        "meal": meal.name,
        "data": [r.to_dict() for r in ratings]
    }), 200


@ratings_bp.route('/average/<int:meal_id>', methods=['GET'])
def get_meal_average_rating(meal_id):
    """
    Calculate and return average ratings for a meal:
    - average taste
    - average quality
    - average quantity
    - average hygiene
    - overall average
    """
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    ratings = Rating.query.filter_by(meal_id=meal_id).all()
    count = len(ratings)

    if count == 0:
        return jsonify({
            "success": True,
            "data": {
                "meal_id": meal_id,
                "meal_name": meal.name,
                "total_ratings": 0,
                "average_taste": 0.0,
                "average_quality": 0.0,
                "average_quantity": 0.0,
                "average_hygiene": 0.0,
                "overall_average": 0.0
            }
        }), 200

    avg_taste = round(sum(r.taste for r in ratings) / count, 2)
    avg_quality = round(sum(r.quality for r in ratings) / count, 2)
    avg_quantity = round(sum(r.quantity for r in ratings) / count, 2)
    avg_hygiene = round(sum(r.hygiene for r in ratings) / count, 2)
    overall_avg = round((avg_taste + avg_quality + avg_quantity + avg_hygiene) / 4.0, 2)

    return jsonify({
        "success": True,
        "data": {
            "meal_id": meal_id,
            "meal_name": meal.name,
            "total_ratings": count,
            "average_taste": avg_taste,
            "average_quality": avg_quality,
            "average_quantity": avg_quantity,
            "average_hygiene": avg_hygiene,
            "overall_average": overall_avg
        }
    }), 200
