"""
MessMate Flask Application Entry Point
Initializes the Flask app, registers blueprints, enables CORS, and runs the server.
"""
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db

# Import all route blueprints
from routes.auth import auth_bp
from routes.users import users_bp
from routes.menu import menu_bp
from routes.ratings import ratings_bp
from routes.complaints import complaints_bp
from routes.announcements import announcements_bp
from routes.dashboard import dashboard_bp

def create_app():
    """Application factory to create and configure the Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes so our frontend (localhost:3000, 5500, or file://) can connect cleanly
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Bind SQLAlchemy to this app
    db.init_app(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(ratings_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(announcements_bp)
    app.register_blueprint(dashboard_bp)

    # Root welcome & health route
    @app.route('/')
    def root():
        return jsonify({
            "message": "Welcome to MessMate API",
            "version": "1.0",
            "status": "Running",
            "endpoints": "/api/*"
        })

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "message": "Requested endpoint or resource was not found"
        }), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({
            "success": False,
            "message": "Internal server error occurred"
        }), 500

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Create database tables if they do not exist
        db.create_all()
    print("🚀 MessMate API server is starting on http://localhost:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=True)
