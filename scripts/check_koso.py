import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

print("--- Searching for 'loso' across tables ---")
for tbl, col in [('entries', 'headword'), ('dialects', 'dialect_form'), ('affixes', 'term')]:
    try:
        rows = c.execute(f"SELECT * FROM {tbl} WHERE {col} LIKE '%loso%'").fetchall()
        print(f"{tbl}.{col}: {rows}")
    except Exception as e:
        print(f"Error checking {tbl}: {e}")

print("\n--- Checking entry for 'koso' ---")
row = c.execute("SELECT id, headword, part_of_speech, ipa FROM entries WHERE headword = 'koso'").fetchone()
print("Entry:", row)
senses = c.execute("SELECT * FROM senses WHERE entry_id = ?", (row[0],)).fetchall()
print("Senses:", senses)
for s in senses:
    ex = c.execute("SELECT * FROM examples WHERE sense_id = ?", (s[0],)).fetchall()
    print("  Examples:", ex)
