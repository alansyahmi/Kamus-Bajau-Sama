import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

rows = c.execute("""
    SELECT e.id, e.headword, e.part_of_speech, s.definition_ms 
    FROM entries e 
    LEFT JOIN senses s ON e.id = s.entry_id 
    WHERE e.headword IN ('tilau', 'nintilau', 'penilau', 'tetilau', 'betilau')
""").fetchall()

for r in rows:
    print(r)
