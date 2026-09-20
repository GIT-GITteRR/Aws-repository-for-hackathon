"""
Menu & Food Item Routes: Today, Weekly, Date-specific and CRUD operations.
"""
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from models import Meal, FoodItem
from database import db

menu_bp = Blueprint('menu', __name__, url_prefix='/api')

@menu_bp.route('/menu/today', methods=['GET'])
def get_today_menu():
    """
    Return all meals for today's date (or fallback to latest meals if today has none).
    """
    today_str = date.today().strftime('%Y-%m-%d')
    meals = Meal.query.filter_by(date=today_str).all()

    # If no meals seeded for current real date, return the first available date in database
    if not meals:
        first_meal = Meal.query.order_by(Meal.date.asc()).first()
        if first_meal:
            today_str = first_meal.date
            meals = Meal.query.filter_by(date=today_str).all()

    return jsonify({
        "success": True,
        "date": today_str,
        "data": [m.to_dict() for m in meals]
    }), 200


@menu_bp.route('/menu/weekly', methods=['GET'])
def get_weekly_menu():
    """
    Return all meals grouped by day or date across the schedule.
    """
    meals = Meal.query.order_by(Meal.date.asc(), Meal.id.asc()).all()
    return jsonify({
        "success": True,
        "data": [m.to_dict() for m in meals]
    }), 200


@menu_bp.route('/menu/date/<string:meal_date>', methods=['GET'])
@menu_bp.route('/menu/<string:meal_date>', methods=['GET'])
def get_meals_by_date(meal_date):
    """
    Return meals for a specific date (YYYY-MM-DD).
    """
    meals = Meal.query.filter_by(date=meal_date).all()
    return jsonify({
        "success": True,
        "date": meal_date,
        "data": [m.to_dict() for m in meals]
    }), 200


@menu_bp.route('/menu', methods=['POST'])
def create_meal():
    """
    Admin creates a meal.
    Expected JSON:
    {
        "date": "2026-09-20",
        "meal_type": "lunch",
        "name": "Special Thali",
        "description": "Delicious weekend meal",
        "time": "12:30 PM - 02:30 PM",
        "status": "Upcoming",
        "items": [
            {"name": "Paneer Butter Masala", "vegetarian": true},
            {"name": "Butter Naan", "vegetarian": true}
        ]
    }
    """
    data = request.get_json() or {}

    required = ['date', 'meal_type', 'name', 'time']
    for field in required:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"Missing required field: {field}"
            }), 400

    meal = Meal(
        date=data['date'].strip(),
        meal_type=data['meal_type'].strip().lower(),
        name=data['name'].strip(),
        description=data.get('description', ''),
        time=data['time'].strip(),
        status=data.get('status', 'Upcoming')
    )

    try:
        db.session.add(meal)
        db.session.flush() # Flush to get generated meal.id

        # Add food items if provided
        items = data.get('items', [])
        for item_data in items:
            if isinstance(item_data, dict) and item_data.get('name'):
                food_item = FoodItem(
                    meal_id=meal.id,
                    name=item_data['name'].strip(),
                    vegetarian=item_data.get('vegetarian', True)
                )
                db.session.add(food_item)
            elif isinstance(item_data, str) and item_data.strip():
                # Allow simple list of string names as well
                food_item = FoodItem(
                    meal_id=meal.id,
                    name=item_data.strip(),
                    vegetarian=True
                )
                db.session.add(food_item)

        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Meal created successfully",
            "data": meal.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to create meal: {str(e)}"
        }), 500


@menu_bp.route('/menu/<int:meal_id>', methods=['PUT'])
def update_meal(meal_id):
    """
    Admin updates a meal.
    """
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    data = request.get_json() or {}

    if 'name' in data: meal.name = data['name'].strip()
    if 'meal_type' in data: meal.meal_type = data['meal_type'].strip().lower()
    if 'date' in data: meal.date = data['date'].strip()
    if 'time' in data: meal.time = data['time'].strip()
    if 'status' in data: meal.status = data['status'].strip()
    if 'description' in data: meal.description = data['description']

    # If new items list is provided, replace items
    if 'items' in data:
        # Delete old food items
        FoodItem.query.filter_by(meal_id=meal.id).delete()
        for item_data in data['items']:
            if isinstance(item_data, dict) and item_data.get('name'):
                food_item = FoodItem(
                    meal_id=meal.id,
                    name=item_data['name'].strip(),
                    vegetarian=item_data.get('vegetarian', True)
                )
                db.session.add(food_item)
            elif isinstance(item_data, str) and item_data.strip():
                food_item = FoodItem(
                    meal_id=meal.id,
                    name=item_data.strip(),
                    vegetarian=True
                )
                db.session.add(food_item)

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Meal updated successfully",
            "data": meal.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update meal: {str(e)}"
        }), 500


@menu_bp.route('/menu/<int:meal_id>', methods=['DELETE'])
def delete_meal(meal_id):
    """
    Admin deletes a meal.
    """
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    try:
        db.session.delete(meal)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Meal deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to delete meal: {str(e)}"
        }), 500


# --- FOOD ITEMS SUB-ENDPOINTS ---

@menu_bp.route('/meals/<int:meal_id>/items', methods=['GET'])
def get_meal_items(meal_id):
    """Get all food items for a specific meal."""
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    return jsonify({
        "success": True,
        "data": [item.to_dict() for item in meal.food_items]
    }), 200


@menu_bp.route('/meals/<int:meal_id>/items', methods=['POST'])
def add_meal_item(meal_id):
    """Add a food item to a meal."""
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({
            "success": False,
            "message": "Meal not found"
        }), 404

    data = request.get_json() or {}
    if not data.get('name'):
        return jsonify({
            "success": False,
            "message": "Item name is required"
        }), 400

    item = FoodItem(
        meal_id=meal.id,
        name=data['name'].strip(),
        vegetarian=data.get('vegetarian', True)
    )

    try:
        db.session.add(item)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Food item added",
            "data": item.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to add item: {str(e)}"
        }), 500


@menu_bp.route('/food-items/<int:item_id>', methods=['DELETE'])
def delete_food_item(item_id):
    """Delete a single food item."""
    item = FoodItem.query.get(item_id)
    if not item:
        return jsonify({
            "success": False,
            "message": "Food item not found"
        }), 404

    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Food item deleted"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to delete food item: {str(e)}"
        }), 500
