import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()
print(c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='entries'").fetchone()[0])
print(c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='senses'").fetchone()[0])
