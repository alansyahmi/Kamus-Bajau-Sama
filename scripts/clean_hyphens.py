import sqlite3
import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

c.execute("UPDATE examples SET sentence_bajau = 'Daa kau manas e, aku kekuri jo.' WHERE id = 4420")
c.execute("UPDATE examples SET sentence_bajau = REPLACE(sentence_bajau, 'den-d-anganni.5', 'dendangan-ni.') WHERE id IN (3955, 3956)")

# Fix specific morphological hyphens
replacements = [
    ('be-tapuk-an', 'betapukan'),
    ('Di-kau\'', 'Dikau\''),
    ('di-kau\'', 'dikau\''),
    ('-ebba-an', 'ebbaan'),
    ('ebba-an', 'ebbaan'),
    ('m-aku', 'maku'),
    ('be-tutur', 'betutur'),
    ('en-diam', 'endiam'),
    ('be-suang', 'besuang'),
    ('te-kito', 'tekito'),
    ('ng-enda\'', 'ngenda\''),
    ('p-in-akan', 'pinakan'),
    ('l-um-aan', 'lumaan'),
    ('ke-raat-an', 'keraatan'),
    ('ke-kuasa-an', 'kekuasaan'),
]

for old, new in replacements:
    c.execute(f"UPDATE examples SET sentence_bajau = REPLACE(sentence_bajau, ?, ?)", (old, new))

# Clean up corrupted quotes or trailing artifacts if any
c.execute("UPDATE examples SET sentence_bajau = REPLACE(sentence_bajau, '', '''')")

# Check remaining hyphens
rows = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%-%'").fetchall()
print(f"Total sentences with hyphens: {len(rows)}")
for eid, s in rows:
    print(f"  #{eid}: {s}")

conn.commit()
conn.close()
print("Cleaned successfully!")

