"""
Database Seeding Script for MessMate
Creates SQLite database with realistic college mess data:
- 3 Students & 1 Admin User
- 7 Days of Meals (Breakfast, Lunch, Snacks, Dinner) with food items
- Example Ratings
- Example Complaints
- Example Announcements
"""
from datetime import datetime, date, timedelta
from app import create_app
from database import db
from models import User, Meal, FoodItem, Rating, Complaint, Announcement

def seed_database():
    app = create_app()
    with app.app_context():
        print("[SEED] Dropping old tables and creating fresh database...")
        db.drop_all()
        db.create_all()

        # -------------------------------------------------------------
        # 1. SEED USERS (1 Admin, 3 Students)
        # -------------------------------------------------------------
        print("[SEED] Seeding Users...")

        admin_user = User(
            name="Mr. Rajendra Prasad",
            email="admin@college.edu",
            student_id="MESS-ADMIN-01",
            course="Mess Administration",
            year="Staff",
            hostel="Staff Quarters",
            room_number="SQ-101",
            role="admin"
        )
        admin_user.set_password("admin123")

        student_1 = User(
            name="Aarav Sharma",
            email="aarav@college.edu",
            student_id="2023CSB1042",
            course="B.Tech Computer Science",
            year="3rd Year",
            hostel="Aravali Hostel",
            room_number="B-304",
            role="student"
        )
        student_1.set_password("student123")

        student_2 = User(
            name="Ananya Verma",
            email="ananya@college.edu",
            student_id="2023EEB1015",
            course="B.Tech Electrical Engineering",
            year="3rd Year",
            hostel="Shivalik Hostel",
            room_number="G-202",
            role="student"
        )
        student_2.set_password("student123")

        student_3 = User(
            name="Rohan Gupta",
            email="rohan@college.edu",
            student_id="2024MEB1089",
            course="B.Tech Mechanical Engineering",
            year="2nd Year",
            hostel="Vindhyachal Hostel",
            room_number="A-110",
            role="student"
        )
        student_3.set_password("student123")

        db.session.add_all([admin_user, student_1, student_2, student_3])
        db.session.commit()

        # -------------------------------------------------------------
        # 2. SEED 7 DAYS OF MEALS & FOOD ITEMS
        # -------------------------------------------------------------
        print("[SEED] Seeding 7 Days of Meals & Food Items...")

        # Generate dates for 7 days starting today
        start_date = date.today()

        weekly_template = [
            # Day 0: Monday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "North Indian Breakfast",
                    "time": "07:30 AM - 09:30 AM",
                    "status": "Completed",
                    "items": [
                        {"name": "Aloo Paratha (2 pcs)", "vegetarian": True},
                        {"name": "Fresh Curd", "vegetarian": True},
                        {"name": "Mixed Pickle", "vegetarian": True},
                        {"name": "Hot Ginger Tea", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "Standard North Indian Thali",
                    "time": "12:30 PM - 02:30 PM",
                    "status": "Serving Now",
                    "items": [
                        {"name": "Steamed Basmati Rice", "vegetarian": True},
                        {"name": "Dal Tadka", "vegetarian": True},
                        {"name": "Paneer Butter Masala", "vegetarian": True},
                        {"name": "Tawa Roti", "vegetarian": True},
                        {"name": "Gulab Jamun", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Crispy Evening Samosa",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Veg Samosa (2 pcs)", "vegetarian": True},
                        {"name": "Green Mint Chutney", "vegetarian": True},
                        {"name": "Masala Chai", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Pindi Chhole & Bhature Combo",
                    "time": "07:45 PM - 09:45 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Pindi Chhole", "vegetarian": True},
                        {"name": "Crispy Bhature", "vegetarian": True},
                        {"name": "Jeera Rice", "vegetarian": True},
                        {"name": "Masala Buttermilk", "vegetarian": True},
                        {"name": "Ice Cream", "vegetarian": True}
                    ]
                }
            ],
            # Day 1: Tuesday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "South Indian Tiffin Special",
                    "time": "07:30 AM - 09:30 AM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Steamed Idli (3 pcs)", "vegetarian": True},
                        {"name": "Medu Vada (1 pc)", "vegetarian": True},
                        {"name": "Vegetable Sambar", "vegetarian": True},
                        {"name": "Coconut Chutney", "vegetarian": True},
                        {"name": "Filter Coffee", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "Kashmiri Rajma Feast",
                    "time": "12:30 PM - 02:30 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Kashmiri Rajma Gravy", "vegetarian": True},
                        {"name": "Steamed Rice", "vegetarian": True},
                        {"name": "Aloo Gobi Dry", "vegetarian": True},
                        {"name": "Tawa Chapati", "vegetarian": True},
                        {"name": "Rice Kheer", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Mumbai Pav Bhaji",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Butter Pav Bhaji", "vegetarian": True},
                        {"name": "Chopped Onion & Lemon", "vegetarian": True},
                        {"name": "Hot Coffee", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Dhaba Kadai Special",
                    "time": "07:45 PM - 09:45 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Kadai Paneer / Egg Curry", "vegetarian": False},
                        {"name": "Yellow Dal Fry", "vegetarian": True},
                        {"name": "Butter Naan", "vegetarian": True},
                        {"name": "Peas Pulao", "vegetarian": True},
                        {"name": "Fruit Custard", "vegetarian": True}
                    ]
                }
            ],
            # Day 2: Wednesday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "Indori Poha & Sprouts",
                    "time": "07:30 AM - 09:30 AM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Poha with Sev & Peanuts", "vegetarian": True},
                        {"name": "Moong Sprouts", "vegetarian": True},
                        {"name": "Banana / Boiled Egg", "vegetarian": False},
                        {"name": "Hot Tea", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "South Indian Lunch Platter",
                    "time": "12:30 PM - 02:30 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Lemon Rice", "vegetarian": True},
                        {"name": "Veg Avial", "vegetarian": True},
                        {"name": "Sambar & Rasam", "vegetarian": True},
                        {"name": "Appalam", "vegetarian": True},
                        {"name": "Payasam", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Grilled Cheese Sandwich",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Veg Cheese Grilled Sandwich", "vegetarian": True},
                        {"name": "Green Chutney & Ketchup", "vegetarian": True},
                        {"name": "Ginger Tea", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Hyderabadi Dum Biryani Feast",
                    "time": "07:45 PM - 09:45 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Chicken Biryani / Paneer Dum Biryani", "vegetarian": False},
                        {"name": "Mirchi Ka Salan", "vegetarian": True},
                        {"name": "Burani Raita", "vegetarian": True},
                        {"name": "Shahi Tukda", "vegetarian": True}
                    ]
                }
            ],
            # Day 3: Thursday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "Poori Bedmi Aloo",
                    "time": "07:30 AM - 09:30 AM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Crispy Pooris (4 pcs)", "vegetarian": True},
                        {"name": "Bedmi Aloo Sabzi", "vegetarian": True},
                        {"name": "Suji Halwa", "vegetarian": True},
                        {"name": "Hot Coffee", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "Gujarati Khichdi & Kadhi",
                    "time": "12:30 PM - 02:30 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Kadhai Khichdi", "vegetarian": True},
                        {"name": "Gujarati Kadhi", "vegetarian": True},
                        {"name": "Sev Tameta", "vegetarian": True},
                        {"name": "Phulka", "vegetarian": True},
                        {"name": "Moong Dal Halwa", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Paneer Bread Pakora",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Stuffed Bread Pakora", "vegetarian": True},
                        {"name": "Sweet Tamarind Chutney", "vegetarian": True},
                        {"name": "Masala Chai", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Dal Makhani & Shahi Paneer",
                    "time": "07:45 PM - 09:45 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Slow-cooked Dal Makhani", "vegetarian": True},
                        {"name": "Shahi Paneer", "vegetarian": True},
                        {"name": "Jeera Rice", "vegetarian": True},
                        {"name": "Butter Roti", "vegetarian": True},
                        {"name": "Rasgulla", "vegetarian": True}
                    ]
                }
            ],
            # Day 4: Friday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "Onion Uttapam Combo",
                    "time": "07:30 AM - 09:30 AM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Onion Tomato Uttapam", "vegetarian": True},
                        {"name": "Medu Vada", "vegetarian": True},
                        {"name": "Coconut Chutney", "vegetarian": True},
                        {"name": "Filter Coffee", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "Amritsari Chhole Kulche",
                    "time": "12:30 PM - 02:30 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Amritsari Chana Masala", "vegetarian": True},
                        {"name": "Kulcha / Basmati Rice", "vegetarian": True},
                        {"name": "Aloo Jeera", "vegetarian": True},
                        {"name": "Sweet Lassi", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Khasta Kachori & Jalebi",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Khasta Kachori with Aloo Sabzi", "vegetarian": True},
                        {"name": "Hot Crispy Jalebi", "vegetarian": True},
                        {"name": "Adrak Chai", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Chinese Indo-Fusion Night",
                    "time": "07:45 PM - 09:45 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Veg Hakka Noodles", "vegetarian": True},
                        {"name": "Fried Rice", "vegetarian": True},
                        {"name": "Chilli Paneer / Manchurian", "vegetarian": True},
                        {"name": "Spring Rolls", "vegetarian": True},
                        {"name": "Warm Chocolate Brownie", "vegetarian": True}
                    ]
                }
            ],
            # Day 5: Saturday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "Paneer Paratha Feast",
                    "time": "08:00 AM - 10:00 AM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Paneer Paratha (2 pcs)", "vegetarian": True},
                        {"name": "Fresh Curd & White Butter", "vegetarian": True},
                        {"name": "Green Pickle", "vegetarian": True},
                        {"name": "Hot Tea", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "Punjabi Kadhi Pakora",
                    "time": "12:30 PM - 02:30 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Punjabi Kadhi Pakora", "vegetarian": True},
                        {"name": "Steamed Rice", "vegetarian": True},
                        {"name": "Aloo Bhindi Masala", "vegetarian": True},
                        {"name": "Chapati", "vegetarian": True},
                        {"name": "Papad & Salad", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Butter Masala Maggi",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Special Butter Veg Maggi", "vegetarian": True},
                        {"name": "Sweet Corn Chaat", "vegetarian": True},
                        {"name": "Lemon Ice Tea", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Continental Pasta Night",
                    "time": "07:45 PM - 09:45 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Creamy Penne Alfredo / Arrabiata", "vegetarian": True},
                        {"name": "Cheese Garlic Bread", "vegetarian": True},
                        {"name": "Caesar Salad", "vegetarian": True},
                        {"name": "Fruit Punch Drink", "vegetarian": True}
                    ]
                }
            ],
            # Day 6: Sunday Template
            [
                {
                    "meal_type": "breakfast",
                    "name": "Lazy Sunday Brunch",
                    "time": "08:00 AM - 10:30 AM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Crispy Masala Dosa", "vegetarian": True},
                        {"name": "Bread Omelette / Veg Cutlet", "vegetarian": False},
                        {"name": "Fresh Watermelon Juice", "vegetarian": True},
                        {"name": "Filter Coffee", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "lunch",
                    "name": "Grand Weekend Feast",
                    "time": "12:45 PM - 03:00 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Butter Chicken / Matar Paneer", "vegetarian": False},
                        {"name": "Dal Maharani", "vegetarian": True},
                        {"name": "Butter Garlic Naan", "vegetarian": True},
                        {"name": "Peas Pulao", "vegetarian": True},
                        {"name": "Angoori Gulab Jamun with Rabdi", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "snacks",
                    "name": "Chaupati Bhel Puri",
                    "time": "05:00 PM - 06:15 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Crispy Bhel Puri", "vegetarian": True},
                        {"name": "Cold Frappe Coffee", "vegetarian": True}
                    ]
                },
                {
                    "meal_type": "dinner",
                    "name": "Comfort Sunday Dinner",
                    "time": "07:45 PM - 09:30 PM",
                    "status": "Upcoming",
                    "items": [
                        {"name": "Moong Dal Khichdi", "vegetarian": True},
                        {"name": "Baingan Bharta", "vegetarian": True},
                        {"name": "Phulka Roti", "vegetarian": True},
                        {"name": "Chilled Rasmalai", "vegetarian": True}
                    ]
                }
            ]
        ]

        created_meals = []
        for day_offset, day_meals in enumerate(weekly_template):
            current_date_str = (start_date + timedelta(days=day_offset)).strftime('%Y-%m-%d')

            for meal_info in day_meals:
                meal = Meal(
                    date=current_date_str,
                    meal_type=meal_info["meal_type"],
                    name=meal_info["name"],
                    description=f"{meal_info['name']} served fresh in Central Dining Hall.",
                    time=meal_info["time"],
                    status=meal_info["status"]
                )
                db.session.add(meal)
                db.session.flush()

                for item in meal_info["items"]:
                    food_item = FoodItem(
                        meal_id=meal.id,
                        name=item["name"],
                        vegetarian=item["vegetarian"]
                    )
                    db.session.add(food_item)

                created_meals.append(meal)

        db.session.commit()

        # -------------------------------------------------------------
        # 3. SEED RATINGS
        # -------------------------------------------------------------
        print("[SEED] Seeding Ratings...")
        if len(created_meals) >= 3:
            r1 = Rating(
                user_id=student_1.id,
                meal_id=created_meals[0].id,
                taste=5,
                quality=5,
                quantity=4,
                hygiene=5,
                comment="Aloo Paratha was hot, crispy and curd was fresh!"
            )
            r2 = Rating(
                user_id=student_2.id,
                meal_id=created_meals[0].id,
                taste=4,
                quality=4,
                quantity=5,
                hygiene=4,
                comment="Good breakfast portion."
            )
            r3 = Rating(
                user_id=student_1.id,
                meal_id=created_meals[1].id,
                taste=5,
                quality=5,
                quantity=4,
                hygiene=5,
                comment="Paneer Butter Masala was very aromatic and rich."
            )
            r4 = Rating(
                user_id=student_3.id,
                meal_id=created_meals[1].id,
                taste=4,
                quality=4,
                quantity=4,
                hygiene=4,
                comment="Dal Tadka was well seasoned."
            )
            db.session.add_all([r1, r2, r3, r4])
            db.session.commit()

        # -------------------------------------------------------------
        # 4. SEED COMPLAINTS
        # -------------------------------------------------------------
        print("[SEED] Seeding Complaints...")
        c1 = Complaint(
            user_id=student_1.id,
            category="Hygiene",
            title="Drinking water cooler filter indicator blinking red",
            description="The RO water cooler on the 2nd row near table 14 is dispensing lukewarm water and red filter alarm is active.",
            status="resolved",
            admin_response="RO filter cartridge replaced and cooling thermostat recalibrated by maintenance technician."
        )
        c2 = Complaint(
            user_id=student_2.id,
            category="Quantity",
            title="Shortage of trays and spoons during peak lunch slot",
            description="Between 1:15 PM and 1:40 PM, cleaned steel plates ran out causing long queues at counter 2.",
            status="under_review",
            admin_response="Additional rack of 200 trays added to rotation and dishwashing shift timings adjusted."
        )
        c3 = Complaint(
            user_id=student_3.id,
            category="Food Quality",
            title="Chapatis served cold after 9:15 PM dinner slot",
            description="Students arriving in late slots found hot-cases empty and chapatis kept outside in open containers.",
            status="pending",
            admin_response=None
        )
        db.session.add_all([c1, c2, c3])
        db.session.commit()

        # -------------------------------------------------------------
        # 5. SEED ANNOUNCEMENTS
        # -------------------------------------------------------------
        print("[SEED] Seeding Announcements...")
        a1 = Announcement(
            title="Special Festive Dinner & Cultural Feast on Navratri Eve",
            description="Join us for a grand festive feast featuring live Fafda-Jalebi counters, Sabudana delicacies, and Garba music in the central lawn area from 7:30 PM onwards.",
            category="Events",
            priority="Important"
        )
        a2 = Announcement(
            title="Mess Deep UV Sanitization this Sunday",
            description="The mess kitchen and dining hall will undergo comprehensive UV sanitization and pest maintenance this Sunday between 3:00 PM and 5:00 PM.",
            category="Maintenance",
            priority="Important"
        )
        a3 = Announcement(
            title="Revised Breakfast Timings for Mid-Semester Exam Week",
            description="To accommodate early 8:00 AM exam slots starting next Monday, breakfast counters will open 30 minutes earlier at 07:00 AM sharp.",
            category="General",
            priority="General"
        )
        db.session.add_all([a1, a2, a3])
        db.session.commit()

        print("[SUCCESS] Database successfully seeded with full college mess dataset!")

if __name__ == '__main__':
    seed_database()
