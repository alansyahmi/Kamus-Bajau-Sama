import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

# Check entries headword
c.execute("UPDATE entries SET headword = \"mulé'\", search_normalized = 'mule' WHERE headword = \"mule'\"")

# Check examples
rows = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%mule%'").fetchall()
print(f"Found {len(rows)} examples with mule:")
for eid, sent in rows:
    new_sent = sent.replace("mule'", "mulé'").replace("Mule'", "Mulé'").replace("mule’", "mulé'").replace("Mule’", "Mulé'")
    print(f"  #{eid}: {sent} -> {new_sent}")
    c.execute("UPDATE examples SET sentence_bajau = ? WHERE id = ?", (new_sent, eid))

conn.commit()
conn.close()
print("Committed mulé' updates successfully.")
