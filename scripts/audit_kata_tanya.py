import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

targets = [
    'sian', 'sai', 'iyan', 'ai', 'nu', 'anu', 'enggo', 'minggo', 'emberen', 'pian', 'ngini', 'dangai', 'dangay',
    'siano', 'ano', 'iyan-iyan', 'sian-sian', 'enggo-enggo', 'pian-pian', 'minggo-minggo'
]

print("--- AUDITING KATA TANYA IN DICTIONARY.DB ---")
for t in targets:
    rows = c.execute("""
        SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.definition_ms, s.definition_en
        FROM entries e
        LEFT JOIN senses s ON e.id = s.entry_id
        WHERE e.headword = ? OR e.search_normalized = ?
    """, (t, t.replace("'", "").replace("-", ""))).fetchall()
    if rows:
        for r in rows:
            print(f"FOUND #{r[0]}: '{r[1]}' [{r[2]}] IPA: {r[3]} | MS: {r[4]} | EN: {r[5]}")
    else:
        print(f"NOT FOUND: '{t}'")
