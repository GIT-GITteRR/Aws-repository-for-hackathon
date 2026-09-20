import os

# Base directory of the backend folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """
    Application Configuration
    Uses SQLite database stored locally in the backend directory.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'messmate-hackathon-super-secret-key-2026'
    
    # SQLite Database URI
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'messmate.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
