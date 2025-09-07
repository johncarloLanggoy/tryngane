from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.secret_key = "supersecretkey"
DB_NAME = "users.db"

# ===== Food Prices =====
FOOD_PRICES = {
    "Tapsilog": 120,
    "Longsilog": 80,
    "Maling silog": 50,
    "Hotsilog": 60,
    "Silog": 60,
    "Bangus silog": 90,
    "Pork silog": 70
}

# ===== MENU =====
MENU_ITEMS = [
    ('001', 'Tapsilog', 'Rice Meal'),
    ('002', 'Longsilog', 'Rice Meal'),
    ('003', 'Maling silog', 'Rice Meal'),
    ('004', 'Hotsilog', 'Rice Meal'),
    ('005', 'Silog', 'Rice Meal'),
    ('006', 'Bangus silog', 'Rice Meal'),
    ('007', 'Pork silog', 'Rice Meal')
]

# ===== Initialize DB =====
def init_db():
    create_new_db = not os.path.exists(DB_NAME)
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    # Users table
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        is_admin INTEGER DEFAULT 0,
        is_staff INTEGER DEFAULT 0
    )""")
    
    # Orders table
    c.execute("""CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        cust_name TEXT,
        cust_contact TEXT,
        order_date TEXT,
        food TEXT,
        category TEXT,
        quantity INTEGER,
        payment_status TEXT DEFAULT 'Pending',
        price REAL,
        status TEXT DEFAULT 'Available',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )""")
    
    # Menu Status table
    c.execute("""CREATE TABLE IF NOT EXISTS menu_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'Available'
    )""")
    
    # Ratings table
    c.execute("""CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food TEXT NOT NULL,
        rating INTEGER NOT NULL,
        username TEXT NOT NULL
    )""")

    # Global comments table
    c.execute("""CREATE TABLE IF NOT EXISTS global_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        comment TEXT NOT NULL
    )""")

    # Insert default menu items
    for food in FOOD_PRICES.keys():
        c.execute("INSERT OR IGNORE INTO menu_status (food, status) VALUES (?, ?)", (food, 'Available'))

    # Create default admin
    c.execute("INSERT OR IGNORE INTO users (username, password, is_admin) VALUES (?,?,?)",
              ("admin", generate_password_hash("admin12345"), 1))

    conn.commit()
    conn.close()

# Initialize DB first
init_db()

# ===== Create 5 Staff Accounts =====
def create_staff_accounts():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    staff_users = [
        ("staff1", "staffpass1"),
        ("staff2", "staffpass2"),
        ("staff3", "staffpass3"),
        ("staff4", "staffpass4"),
        ("staff5", "staffpass5")
    ]

    for username, pwd in staff_users:
        c.execute("SELECT * FROM users WHERE username=?", (username,))
        if not c.fetchone():
            c.execute(
                "INSERT INTO users (username, password, is_admin, is_staff) VALUES (?, ?, ?, ?)",
                (username, generate_password_hash(pwd), 0, 1)
            )
    
    conn.commit()
    conn.close()

create_staff_accounts()

# ===== Helper Function =====
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# ===== Routes =====
@app.route('/')
def index():
    if "user_id" in session:
        return redirect(url_for('home'))
    return redirect(url_for('auth'))

# ===== Public Landing Page =====
@app.route('/home')
def home():
    # You can render the same auth.html or a separate landing page if you want
    return render_template('auth.html')

@app.route("/rate", methods=["POST"])
def rate_food():
    data = request.get_json()
    food = data["food"]
    stars = data["rating"]
    username = session.get("username")  # get logged-in user

    con = sqlite3.connect(DB_NAME)
    cur = con.cursor()
    cur.execute(
        "INSERT INTO ratings (food, rating, username) VALUES (?, ?, ?)",
        (food, stars, username)
    )
    con.commit()
    con.close()
    return jsonify({"success": True})

@app.route("/get_ratings")
def get_ratings():
    con = sqlite3.connect(DB_NAME)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("SELECT food, rating, username FROM ratings")
    ratings = cur.fetchall()
    con.close()
    return jsonify([dict(r) for r in ratings])

# Fetch ratings & comments
@app.route('/food_data')
def get_food_data():
    data = {}
    with sqlite3.connect(DB_NAME) as con:
        con.row_factory = sqlite3.Row

        # Ratings
        for row in con.execute("SELECT food, AVG(rating) as avg_rating FROM ratings GROUP BY food"):
            data[row['food']] = {'avg_rating': row['avg_rating']}

    return jsonify(data)

# ===== Global Comments =====
@app.route('/get_comments_global')
def get_comments_global():
    conn = get_db_connection()
    comments = conn.execute("SELECT username, comment FROM global_comments ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(c) for c in comments])

@app.route('/add_comment_global', methods=['POST'])
def add_comment_global():
    if 'username' not in session:
        return jsonify({"error": "not logged in"}), 403
    data = request.get_json()
    comment = data.get('comment', '').strip()
    if not comment:
        return jsonify({"error": "empty comment"}), 400
    conn = get_db_connection()
    conn.execute("INSERT INTO global_comments (username, comment) VALUES (?, ?)", (session['username'], comment))
    conn.commit()
    conn.close()
    return jsonify({"success": True})
# ===== AUTH (Login/Register) =====
@app.route('/auth', methods=['GET', 'POST'])
def auth():
    login_error = None
    register_error = None
    show_form = None

    if request.method == "POST":
        action = request.form.get("action")
        username = request.form.get("username")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")
        email = request.form.get("email")
        phone = request.form.get("phone")
        address = request.form.get("address")

        conn = get_db_connection()

        # Sa login section lang
        if action == "login":
            user = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
            if user and check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                session['username'] = user['username']
                session['is_admin'] = user['is_admin']
                session['is_staff'] = user['is_staff']


                conn.close()
                return redirect(url_for('home'))
            else:
                login_error = "Invalid username or password"
                show_form = "login"

        elif action == "register":
            if not username or not password or not confirm_password or not email or not phone or not address:
                register_error = "Please fill all fields"
                show_form = "register"
            elif password != confirm_password:
                register_error = "Passwords do not match"
                show_form = "register"
            else:
                existing_email = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
                existing_user = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
                if existing_email:
                    register_error = "Email already exists"
                    show_form = "register"
                elif existing_user:
                    register_error = "Username already exists"
                    show_form = "register"
                else:
                    try:
                        conn.execute(
                            "INSERT INTO users (username,password,email,phone,address) VALUES (?,?,?,?,?)",
                            (username, generate_password_hash(password), email, phone, address)
                        )
                        conn.commit()
                        conn.close()
                        login_error = "Registered successfully! Please login."
                        show_form = "login"
                        return render_template("auth.html",
                                               login_error=login_error,
                                               register_error=None,
                                               show_form=show_form)
                    except sqlite3.IntegrityError:
                        register_error = "Error during registration"
                        show_form = "register"
        conn.close()

    template_args = {"login_error": login_error, "register_error": register_error}
    if show_form:
        template_args["show_form"] = show_form

    return render_template("auth.html", **template_args)

# ===== Dashboard =====
@app.route('/dashboard')
def dashboard():
    conn = get_db_connection()
    menu_items = []

    for food, price in FOOD_PRICES.items():
        row = conn.execute("SELECT status FROM menu_status WHERE food=?", (food,)).fetchone()
        status = row['status'] if row else "Available"
        menu_items.append({
            'food': food,
            'category': 'Rice Meal',
            'status': status
        })

        # Ensure row exists
        if not row:
            conn.execute("INSERT INTO menu_status (food, status) VALUES (?, ?)", (food, 'Available'))

    conn.commit()
    conn.close()

    return render_template("dashboard.html", orders=menu_items)


# ===== Update status =====
@app.route('/update_status', methods=['POST'])
def update_status():
    if "user_id" not in session or not (session.get('is_staff') or session.get('is_admin')):
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    food = data.get('food')
    status = data.get('status')

    if not food or not status:
        return jsonify({"message": "Invalid data"}), 400

    conn = get_db_connection()
    conn.execute("UPDATE menu_status SET status=? WHERE food=?", (status, food))
    conn.commit()
    conn.close()

    return jsonify({"message": f"{food} status updated to {status}"})

# ===== Inventory =====
@app.route('/inventory')
def inventory():
    conn = get_db_connection()
    ongoing_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE payment_status='Pending'").fetchone()[0]
    total_customers = conn.execute("SELECT COUNT(DISTINCT cust_name) FROM orders").fetchone()[0]
    total_sales = conn.execute("SELECT SUM(quantity) FROM orders").fetchone()[0] or 0
    total_amount = conn.execute("SELECT SUM(price) FROM orders WHERE payment_status != 'Pending'").fetchone()[0] or 0
    staff = conn.execute("SELECT * FROM users WHERE is_staff=1").fetchall()
    customers = conn.execute("SELECT * FROM users WHERE is_staff=0 AND username!='admin'").fetchall()

    conn.close()

    users = staff + customers
    return render_template("inventory.html",
                       ongoing_orders=ongoing_orders,
                       total_customers=total_customers,
                       total_sales=total_sales,
                       total_amount=total_amount,
                       users=users)


# ===== Add Order =====
@app.route('/add_order', methods=['GET', 'POST'])
def add_order():
    conn = get_db_connection()
    menu_items = []

    # Prepare menu items with availability
    for food, price in FOOD_PRICES.items():
        row = conn.execute("SELECT status FROM menu_status WHERE food=?", (food,)).fetchone()
        availability = row['status'] if row else "Available"
        menu_items.append({
            "name": food,
            "price": price,
            "availability": availability
        })

    conn.close()

    # Handle POST (placing order)
    if request.method == 'POST':
        # Only logged-in users can place order
        if not session.get('user_id'):
            return redirect(url_for('auth'))

        cust_name = request.form['cust_name']
        cust_contact = request.form['cust_contact']
        order_date = request.form['order_date']

        foods = request.form.getlist('food')
        quantities_list = request.form.getlist('quantity')

        conn = get_db_connection()
        for food, qty in zip(foods, quantities_list):
            row = conn.execute("SELECT status FROM menu_status WHERE food=?", (food,)).fetchone()
            if row and row['status'] != 'Available':
                continue
            qty = int(qty)
            price = FOOD_PRICES.get(food, 100) * qty
            conn.execute(
                "INSERT INTO orders (user_id, cust_name, cust_contact, order_date, food, quantity, price) VALUES (?,?,?,?,?,?,?)",
                (session['user_id'], cust_name, cust_contact, order_date, food, qty, price)
            )
        conn.commit()
        conn.close()
        return redirect(url_for('view_orders'))

    # Guests can see the menu but can't place orders
    return render_template("add_order.html", menu_items=menu_items)


# ===== View Orders =====
@app.route('/view_orders')
def view_orders():
    conn = get_db_connection()
    if session.get('user_id'):
        orders_rows = conn.execute(
            "SELECT * FROM orders WHERE user_id=?",
            (session['user_id'],)
        ).fetchall()
    else:
        orders_rows = []  # Guests cannot see orders
    conn.close()
    orders = [dict(order) for order in orders_rows]
    return render_template("view_orders.html", orders=orders)

# ===== Edit Order =====
@app.route('/edit_order/<int:order_id>', methods=['GET','POST'])
def edit_order(order_id):
    if "user_id" not in session:
        return redirect(url_for('auth'))
    conn = get_db_connection()
    order = conn.execute("SELECT * FROM orders WHERE id=? AND user_id=?", (order_id, session['user_id'])).fetchone()
    if not order:
        conn.close()
        return redirect(url_for('view_orders'))

    if request.method == 'POST':
        cust_name = request.form['cust_name']
        cust_contact = request.form['cust_contact']
        order_date = request.form['order_date']
        food = request.form['food']
        qty = int(request.form['quantity'])
        price = FOOD_PRICES.get(food, 100) * qty
        conn.execute(
            "UPDATE orders SET cust_name=?, cust_contact=?, order_date=?, food=?, quantity=?, price=? WHERE id=?",
            (cust_name, cust_contact, order_date, food, qty, price, order_id)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('view_orders'))

    conn.close()
    return render_template("edit_order.html", order=order)

# ===== Delete Order =====
@app.route('/delete_order/<int:order_id>', methods=['POST'])
def delete_order(order_id):
    if "user_id" not in session:
        return redirect(url_for('auth'))
    conn = get_db_connection()
    conn.execute("DELETE FROM orders WHERE id=? AND user_id=?", (order_id, session['user_id']))
    conn.commit()
    conn.close()
    return redirect(url_for('view_orders'))

# ===== Logout =====
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth'))

if __name__ == "__main__":
    app.run(debug=True)
