import sqlite3
import os

DB_NAME = "users.db"

# Delete old DB if exists (optional)
if os.path.exists(DB_NAME):
    os.remove(DB_NAME)

conn = sqlite3.connect(DB_NAME)
c = conn.cursor()

# ===== Users Table =====
c.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    is_admin INTEGER DEFAULT 0
)
""")

# ===== Menu Table =====
c.execute("""
CREATE TABLE menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    status TEXT DEFAULT 'Available'
)
""")

# ===== Orders Table =====
c.execute("""
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (food_id) REFERENCES menu (id)
)
""")

# ===== Insert Menu Items =====
menu_items = [
    ("Tapsilog", "Rice Meal", 120, "Available"),
    ("Longsilog", "Rice Meal", 80, "Available"),
    ("Maling silog", "Rice Meal", 50, "Available"),
    ("Hotsilog", "Rice Meal", 60, "Available"),
    ("Silog", "Rice Meal", 60, "Available"),
    ("Bangus silog", "Rice Meal", 90, "Available"),
    ("Pork silog", "Rice Meal", 70, "Available")
]

c.executemany("INSERT INTO menu (product_name, category, price, status) VALUES (?, ?, ?, ?)", menu_items)

# ===== Create Default Admin =====
from werkzeug.security import generate_password_hash
c.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)",
          ("admin", generate_password_hash("admin12345"), 1))

conn.commit()
conn.close()

print("Database initialized successfully ✅")
