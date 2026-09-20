"""
Database Models for MessMate.
Uses SQLAlchemy to define tables and relationships.
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db

class User(db.Model):
    """
    Users table - stores students and administrators.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    student_id = db.Column(db.String(50), nullable=True) # e.g. 2023CSB1042
    course = db.Column(db.String(100), nullable=True)     # e.g. B.Tech Computer Science
    year = db.Column(db.String(50), nullable=True)        # e.g. 3rd Year
    hostel = db.Column(db.String(100), nullable=True)     # e.g. Aravali Hostel
    room_number = db.Column(db.String(50), nullable=True) # e.g. B-304
    role = db.Column(db.String(20), default='student')    # 'student' or 'admin'

    # Relationships
    ratings = db.relationship('Rating', backref='user', lazy=True, cascade="all, delete-orphan")
    complaints = db.relationship('Complaint', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        """Hash and save password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check entered password against hashed password."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert object to dictionary (excluding password for security)."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "student_id": self.student_id,
            "course": self.course,
            "year": self.year,
            "hostel": self.hostel,
            "room_number": self.room_number,
            "role": self.role
        }


class Meal(db.Model):
    """
    Meals table - records breakfast, lunch, snacks and dinner for each day.
    """
    __tablename__ = 'meals'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)        # YYYY-MM-DD
    meal_type = db.Column(db.String(20), nullable=False)   # 'breakfast', 'lunch', 'snacks', 'dinner'
    name = db.Column(db.String(150), nullable=False)       # e.g. "North Indian Thali"
    description = db.Column(db.Text, nullable=True)
    time = db.Column(db.String(50), nullable=False)        # e.g. "12:30 PM - 02:30 PM"
    status = db.Column(db.String(30), default='Upcoming')  # 'Upcoming', 'Serving Now', 'Available', 'Completed'

    # Relationships
    food_items = db.relationship('FoodItem', backref='meal', lazy=True, cascade="all, delete-orphan")
    ratings = db.relationship('Rating', backref='meal', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Convert meal to dictionary with its food items and average rating."""
        total_ratings = len(self.ratings)
        avg_rating = 0.0
        if total_ratings > 0:
            avg_rating = round(sum(r.overall for r in self.ratings) / total_ratings, 1)

        return {
            "id": self.id,
            "date": self.date,
            "meal_type": self.meal_type,
            "name": self.name,
            "description": self.description,
            "time": self.time,
            "status": self.status,
            "food_items": [item.to_dict() for item in self.food_items],
            "average_rating": avg_rating,
            "total_ratings": total_ratings
        }


class FoodItem(db.Model):
    """
    Food items table - individual items included in a meal.
    """
    __tablename__ = 'food_items'

    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)       # e.g. "Paneer Butter Masala"
    vegetarian = db.Column(db.Boolean, default=True)       # True for Veg, False for Non-Veg

    def to_dict(self):
        return {
            "id": self.id,
            "meal_id": self.meal_id,
            "name": self.name,
            "vegetarian": self.vegetarian
        }


class Rating(db.Model):
    """
    Ratings table - multi-criteria ratings given by students for a meal.
    """
    __tablename__ = 'ratings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    taste = db.Column(db.Integer, nullable=False)          # 1 to 5
    quality = db.Column(db.Integer, nullable=False)        # 1 to 5
    quantity = db.Column(db.Integer, nullable=False)       # 1 to 5
    hygiene = db.Column(db.Integer, nullable=False)        # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Ensure a user can only rate a specific meal once
    __table_args__ = (
        db.UniqueConstraint('user_id', 'meal_id', name='unique_user_meal_rating'),
    )

    @property
    def overall(self):
        """Calculate overall average rating from 4 categories."""
        return round((self.taste + self.quality + self.quantity + self.hygiene) / 4.0, 1)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else "Anonymous",
            "meal_id": self.meal_id,
            "meal_name": self.meal.name if self.meal else "",
            "meal_type": self.meal.meal_type if self.meal else "",
            "taste": self.taste,
            "quality": self.quality,
            "quantity": self.quantity,
            "hygiene": self.hygiene,
            "overall": self.overall,
            "comment": self.comment,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }


class Complaint(db.Model):
    """
    Complaints table - tracks student issues and administrative resolutions.
    """
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)    # 'Food Quality', 'Hygiene', 'Quantity', 'Timing', 'Staff', 'Other'
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.Text, nullable=True)          # Base64 string or image link
    status = db.Column(db.String(30), default='pending')   # 'pending', 'under_review', 'resolved'
    admin_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_code": f"CMP-{self.created_at.year if self.created_at else 2026}-{str(self.id).zfill(3)}",
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else "Student",
            "category": self.category,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "status": self.status,
            "admin_response": self.admin_response,
            "created_at": self.created_at.strftime('%Y-%m-%d') if self.created_at else None,
            "updated_at": self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }


class Announcement(db.Model):
    """
    Announcements table - notices and updates published by mess management.
    """
    __tablename__ = 'announcements'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='General') # 'Events', 'Maintenance', 'General'
    priority = db.Column(db.String(30), default='General') # 'Important', 'General'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "created_at": self.created_at.strftime('%Y-%m-%d') if self.created_at else None
        }
