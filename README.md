# 🍲 MessMate - Python Flask Backend & Setup Guide

Welcome to the backend documentation for **MessMate**, a modern college mess management REST API built with **Python 3, Flask, SQLite, and SQLAlchemy**.

---

## 📁 Project Architecture

```
messmate/
│
├── backend/
│   ├── app.py               # Flask Application Entrypoint & CORS Configuration
│   ├── config.py            # SQLite database configuration & secret key
│   ├── database.py          # SQLAlchemy db instance initialization
│   ├── models.py            # SQLite Database Models (Users, Meals, FoodItems, Ratings, Complaints, Announcements)
│   ├── seed.py              # Realistic college dataset seeder (7 days meals, 4 users, ratings, complaints, announcements)
│   ├── test_api.py          # Automated test suite verifying all REST API endpoints
│   ├── requirements.txt     # Python dependency list
│   └── routes/
│       ├── auth.py          # /api/auth (Register & Login with Werkzeug password hashing)
│       ├── users.py         # /api/users (Profile retrieval & updates)
│       ├── menu.py          # /api/menu & /api/meals (Today, Weekly, Date-specific, and Admin CRUD)
│       ├── ratings.py       # /api/ratings (Taste, Quality, Quantity, Hygiene scoring & duplicate rating prevention)
│       ├── complaints.py    # /api/complaints (Student issue submission, timeline, and Admin replies)
│       ├── announcements.py # /api/announcements (Broadcast noticeboard and circular management)
│       └── dashboard.py     # /api/dashboard (Student footfall & Admin KPI statistics)
│
└── frontend/                # Complete responsive HTML/CSS/JS frontend
    ├── index.html           # Landing page with Student/Admin role switcher
    ├── dashboard.html       # Student overview & live meal status
    ├── menu.html            # Today's detailed menu with dietary badges
    ├── weekly-menu.html     # 7-day calendar planner with pure-veg/non-veg filters
    ├── ratings.html         # Multi-metric star rating system & modal
    ├── complaints.html      # Grievance registration & timeline tracker
    ├── announcements.html   # Circular noticeboard
    ├── information.html     # Timings, rules & accordion FAQ
    ├── profile.html         # Student academic & hostel profile editor
    ├── admin/               # Admin Management Portal (Dashboard, Menu CRUD, Complaints, Announcements)
    ├── css/style.css        # Clean, modern college design system
    └── js/api.js            # Frontend REST API connector (http://localhost:5000)
```

---

## 🚀 How to Run the Backend (Step-by-Step)

### Step 1: Open Terminal in the `backend` Folder
```powershell
cd "C:\Users\Ashu Kumar\.gemini\antigravity-ide\scratch\messmate\backend"
```

### Step 2: Create a Virtual Environment
```powershell
python -m venv venv
```

### Step 3: Activate the Virtual Environment (Windows)
```powershell
venv\Scripts\activate
```

### Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 5: Seed the SQLite Database
```powershell
python seed.py
```
*This creates `messmate.db` populated with 1 admin, 3 students, 7 full days of meals (Breakfast, Lunch, Snacks, Dinner), multi-criteria ratings, complaints, and circulars.*

### Step 6: Start the Flask API Server
```powershell
python app.py
```
The server will start listening at **`http://localhost:5000`**.

---

## 🧪 Testing the API
To run the automated test suite verifying all endpoints:
```powershell
python test_api.py
```

---

## 📡 Key REST API Endpoints Summary

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register a new student |
| **Auth** | `POST` | `/api/auth/login` | Login with email & password |
| **Users** | `GET` | `/api/users/<user_id>` | Get student profile details |
| **Users** | `PUT` | `/api/users/<user_id>` | Update student profile details |
| **Menu** | `GET` | `/api/menu/today` | Fetch today's meal schedule |
| **Menu** | `GET` | `/api/menu/weekly` | Fetch 7-day meal planner |
| **Menu** | `GET` | `/api/menu/date/<YYYY-MM-DD>` | Fetch meals for specific date |
| **Menu** | `POST` | `/api/menu` | Admin creates a new meal |
| **Menu** | `PUT` | `/api/menu/<meal_id>` | Admin updates meal/items |
| **Menu** | `DELETE` | `/api/menu/<meal_id>` | Admin removes a meal |
| **Ratings** | `POST` | `/api/ratings` | Submit multi-criteria rating (Taste, Quality, Quantity, Hygiene) |
| **Ratings** | `GET` | `/api/ratings/average/<meal_id>` | Returns calculated average metrics |
| **Complaints** | `POST` | `/api/complaints` | Submit student grievance with category |
| **Complaints** | `GET` | `/api/complaints/user/<user_id>` | Fetch student's own complaints |
| **Complaints** | `PUT` | `/api/complaints/<id>` | Admin updates status (*pending*, *under_review*, *resolved*) and adds reply |
| **Announcements**| `GET` | `/api/announcements` | Fetch active notices & circulars |
| **Announcements**| `POST` | `/api/announcements` | Admin broadcasts new circular |
| **Dashboard** | `GET` | `/api/dashboard/student/<user_id>` | Combined student overview data |
| **Dashboard** | `GET` | `/api/dashboard/admin` | Total students, footfall, rating KPIs |
