"""
Database connection and SQLAlchemy initialization.
"""
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy object. It will be bound to the Flask app in app.py.
db = SQLAlchemy()
