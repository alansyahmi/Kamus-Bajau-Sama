import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

tables = ['entries', 'senses', 'examples', 'sources', 'affixes', 'dialects']
for t in tables:
    cols = c.execute(f"PRAGMA table_info({t})").fetchall()
    print(f"Table {t}: {[col[1] for col in cols]}")
    max_id = c.execute(f"SELECT MAX(id) FROM {t}").fetchone()[0]
    print(f"  Max ID: {max_id}")
