import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

rows = c.execute("""
    SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.id, s.order_index, s.definition_ms, s.definition_en
    FROM entries e
    LEFT JOIN senses s ON e.id = s.entry_id
    WHERE e.headword IN ("pu'", "pu", "sempu'", "duompulu'", "pulu'")
       OR e.search_normalized IN ("pu", "pu'")
       OR s.definition_ms LIKE "%puluh%"
""").fetchall()

for r in rows:
    print(r)
