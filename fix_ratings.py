import sqlite3

DB_NAME = "users.db"

conn = sqlite3.connect(DB_NAME)
c = conn.cursor()

# Check if "ratings" table exists
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ratings'")
if not c.fetchone():
    # Table doesn't exist → create it
    c.execute('''
        CREATE TABLE ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food TEXT NOT NULL,
            stars INTEGER NOT NULL
        )
    ''')
else:
    # Table exists → make sure it has 'stars' column
    c.execute("PRAGMA table_info(ratings)")
    columns = [col[1] for col in c.fetchall()]
    if "stars" not in columns:
        c.execute("ALTER TABLE ratings ADD COLUMN stars INTEGER")

conn.commit()
conn.close()
print("Ratings table checked/updated successfully!")
