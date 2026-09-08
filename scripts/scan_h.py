import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

print("--- ENTRIES WITH 'h' ---")
h_entries = c.execute("""
    SELECT e.id, e.headword, e.part_of_speech, s.definition_ms 
    FROM entries e 
    LEFT JOIN senses s ON e.id = s.entry_id 
    WHERE e.headword LIKE '%h%'
""").fetchall()
for r in h_entries:
    print(r)

print("\n--- DIALECTS WITH 'h' ---")
h_dialects = c.execute("""
    SELECT d.id, d.entry_id, e.headword, d.locality_name, d.dialect_form 
    FROM dialects d
    JOIN entries e ON d.entry_id = e.id
    WHERE d.dialect_form LIKE '%h%'
""").fetchall()
for r in h_dialects:
    print(r)

print("\n--- AFFIXES WITH 'h' ---")
h_affixes = c.execute("""
    SELECT a.id, a.entry_id, e.headword, a.term 
    FROM affixes a
    JOIN entries e ON a.entry_id = e.id
    WHERE a.term LIKE '%h%'
""").fetchall()
for r in h_affixes:
    print(r)
