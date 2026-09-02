import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

words = ['tilau', "laa'", "bu'e'", 'kerabau', 'keta', 'alap', 'jomo', "tingkoo'", 'beli', "sedo'"]
for w in words:
    c.execute('SELECT e.headword, ex.sentence_bajau, ex.sentence_en, ex.sentence_ms, ex.highlight_word FROM entries e JOIN senses s ON e.id = s.entry_id JOIN examples ex ON s.id = ex.sense_id WHERE e.headword = ?', (w,))
    rows = c.fetchall()
    print(f'=== Examples for "{w}" (Found {len(rows)}) ===')
    for r in rows:
        print(f'   BJ: {r[1]}')
        print(f'   MS: {r[3]}')
        print(f'   EN: {r[2]}')
        print(f'   HL: {r[4]}\n')
