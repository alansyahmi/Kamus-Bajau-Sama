import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

print("ENTRIES COUNT:", c.execute("SELECT COUNT(*) FROM entries").fetchone()[0])
rows = c.execute("SELECT id, headword, part_of_speech FROM entries WHERE headword LIKE '%pu%'").fetchall()
for r in rows:
    print(r)
