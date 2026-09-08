import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

words = ['dong', 'daa', 'daha', 'baya', "baya'", "baya'=ni", "baa'", "ba'", 'pasi', 'koo', "koo'", 'koyon', "soo'", "do'"]
print("--- CHECKING IMPERATIVE WORDS IN DB ---")
for w in words:
    rows = c.execute("""
        SELECT e.id, e.headword, e.part_of_speech, s.definition_ms 
        FROM entries e 
        LEFT JOIN senses s ON e.id = s.entry_id 
        WHERE e.headword = ?
    """, (w,)).fetchall()
    if rows:
        for r in rows:
            print(f"FOUND #{r[0]}: '{r[1]}' [{r[2]}] -> {r[3]}")
    else:
        print(f"NOT FOUND: '{w}'")
