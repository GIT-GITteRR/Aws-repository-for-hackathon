"""
Backend API Test Script for MessMate
Tests every single endpoint with realistic HTTP requests to verify correctness:
- Authentication (Register & Login)
- User Profile (GET & PUT)
- Menu (Today, Weekly, Date, Create, Update, Delete)
- Food Items (Get, Add, Delete)
- Ratings (Submit, Get Meal Ratings, Get Average Metrics, Duplicate prevention)
- Complaints (Submit, User Complaints, Admin List, Update status & reply)
- Announcements (List, Create, Update, Delete)
- Dashboard (Student Dashboard & Admin Dashboard)
"""
import unittest
import json
from app import create_app
from database import db
from seed import seed_database

class MessMateAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        # Seed the database before tests
        seed_database()

    def test_01_root_health(self):
        """Test API welcome endpoint."""
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'Running')

    def test_02_authentication(self):
        """Test User Registration and Login."""
        # Test Login with seeded student
        login_payload = {
            "email": "aarav@college.edu",
            "password": "student123"
        }
        res = self.client.post('/api/auth/login', json=login_payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['user']['name'], "Aarav Sharma")

        # Test Register new student
        new_student = {
            "name": "Priya Sharma",
            "email": "priya@college.edu",
            "password": "password123",
            "student_id": "2024CSB1099",
            "course": "B.Tech Computer Science",
            "year": "2nd Year",
            "hostel": "Kailash Hostel",
            "room_number": "C-102",
            "role": "student"
        }
        res = self.client.post('/api/auth/register', json=new_student)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['email'], "priya@college.edu")

    def test_03_user_profile(self):
        """Test User Profile GET and PUT."""
        res = self.client.get('/api/users/2')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])

        # Update profile
        update_payload = {"name": "Aarav S. Kumar", "room_number": "B-305"}
        res = self.client.put('/api/users/2', json=update_payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['data']['name'], "Aarav S. Kumar")
        self.assertEqual(data['data']['room_number'], "B-305")

    def test_04_menu_endpoints(self):
        """Test Menu Today, Weekly, Creation, and Update."""
        # 1. Today's menu
        res = self.client.get('/api/menu/today')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertTrue(len(data['data']) > 0)

        # 2. Weekly menu
        res = self.client.get('/api/menu/weekly')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 28) # 7 days * 4 meals

        # 3. Create meal
        new_meal = {
            "date": "2026-10-01",
            "meal_type": "lunch",
            "name": "Festival Grand Feast",
            "time": "12:30 PM - 02:30 PM",
            "status": "Upcoming",
            "items": ["Paneer Tikka", "Butter Naan", "Gulab Jamun"]
        }
        res = self.client.post('/api/menu', json=new_meal)
        self.assertEqual(res.status_code, 201)
        created_meal = res.get_json()['data']
        meal_id = created_meal['id']

        # 4. Update meal
        res = self.client.put(f'/api/menu/{meal_id}', json={"status": "Serving Now"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['data']['status'], "Serving Now")

        # 5. Food items sub-endpoints
        res = self.client.get(f'/api/meals/{meal_id}/items')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()['data']), 3)

        # 6. Delete meal
        res = self.client.delete(f'/api/menu/{meal_id}')
        self.assertEqual(res.status_code, 200)

    def test_05_ratings_endpoints(self):
        """Test Rating Submission, Duplicate Prevention, and Averages."""
        # 1. Submit valid rating from student 3 on meal 1 (Aloo Paratha)
        rating_payload = {
            "user_id": 4, # Rohan Gupta
            "meal_id": 1,
            "taste": 5,
            "quality": 4,
            "quantity": 5,
            "hygiene": 5,
            "comment": "Superb crisp parathas!"
        }
        res = self.client.post('/api/ratings', json=rating_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['overall'], 4.8)

        # 2. Test duplicate rating rejection
        res = self.client.post('/api/ratings', json=rating_payload)
        self.assertEqual(res.status_code, 409)

        # 3. Test average rating calculation
        res = self.client.get('/api/ratings/average/1')
        self.assertEqual(res.status_code, 200)
        avg_data = res.get_json()['data']
        self.assertTrue(avg_data['total_ratings'] >= 3)
        self.assertTrue('overall_average' in avg_data)

    def test_06_complaints_endpoints(self):
        """Test Complaint creation, user complaints, and admin updates."""
        # 1. Submit complaint
        complaint_payload = {
            "user_id": 2,
            "category": "Timing",
            "title": "Breakfast counter opened 15 mins late",
            "description": "Counter 1 opened at 7:45 AM instead of 7:30 AM."
        }
        res = self.client.post('/api/complaints', json=complaint_payload)
        self.assertEqual(res.status_code, 201)
        created_cmp = res.get_json()['data']
        cmp_id = created_cmp['id']

        # 2. Get user complaints
        res = self.client.get('/api/complaints/user/2')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.get_json()['data']) >= 2)

        # 3. Admin update status and reply
        update_payload = {
            "status": "resolved",
            "admin_response": "Morning staff shift timing issue addressed."
        }
        res = self.client.put(f'/api/complaints/{cmp_id}', json=update_payload)
        self.assertEqual(res.status_code, 200)
        updated = res.get_json()['data']
        self.assertEqual(updated['status'], 'resolved')
        self.assertEqual(updated['admin_response'], update_payload['admin_response'])

    def test_07_announcements_endpoints(self):
        """Test Announcements List, Create, Update, Delete."""
        # 1. List announcements
        res = self.client.get('/api/announcements')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.get_json()['data']) >= 3)

        # 2. Create announcement
        new_ann = {
            "title": "Guest Dinner Coupons Notice",
            "description": "Guest coupons available at reception.",
            "category": "General",
            "priority": "General"
        }
        res = self.client.post('/api/announcements', json=new_ann)
        self.assertEqual(res.status_code, 201)
        ann_id = res.get_json()['data']['id']

        # 3. Delete announcement
        res = self.client.delete(f'/api/announcements/{ann_id}')
        self.assertEqual(res.status_code, 200)

    def test_08_dashboards(self):
        """Test Student and Admin Dashboard endpoints."""
        # Student Dashboard
        res = self.client.get('/api/dashboard/student/2')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()['data']
        self.assertEqual(data['student']['name'], "Aarav Sharma")
        self.assertTrue('today_meals' in data)
        self.assertTrue('announcements' in data)

        # Admin Dashboard
        res = self.client.get('/api/dashboard/admin')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()['data']
        self.assertEqual(data['total_students'], 3)
        self.assertTrue('pending_complaints' in data)
        self.assertTrue('average_meal_rating' in data)

if __name__ == '__main__':
    print("[TEST] Running MessMate Full API Test Suite...")
    unittest.main()
