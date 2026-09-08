import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

print("--- EXAMPLES WITH EQUALS SIGN (=) (interlinear clitic glosses) ---")
eq_rows = c.execute("SELECT id, sense_id, sentence_bajau, highlight_word FROM examples WHERE sentence_bajau LIKE '%=%'").fetchall()
print(f"Total: {len(eq_rows)}")
for r in eq_rows:
    print(f"#{r[0]} (sense {r[1]}): {r[2]}")

print("\n--- EXAMPLES WITH HYPHENATED AFFIXES (like ke-raat-an, ng-enda, p-in-akan, etc.) ---")
hyphen_rows = c.execute("""
    SELECT id, sentence_bajau FROM examples 
    WHERE sentence_bajau LIKE '%-in-%' 
       OR sentence_bajau LIKE '%ke-%' 
       OR sentence_bajau LIKE '%te-%' 
       OR sentence_bajau LIKE '%ng-%' 
       OR sentence_bajau LIKE '%pe-%'
""").fetchall()
print(f"Total: {len(hyphen_rows)}")
for r in hyphen_rows:
    print(f"#{r[0]}: {r[1]}")

print("\n--- EXAMPLES/ENTRIES WITH 'atay' (should be 'atai') ---")
atay_rows = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%atay%'").fetchall()
print(f"Total examples with atay: {len(atay_rows)}")
for r in atay_rows:
    print(f"#{r[0]}: {r[1]}")

print("\n--- EXAMPLES WITH 'mule'' (should be 'mulé'') ---")
mule_rows = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE \"%mule'%\"").fetchall()
print(f"Total examples with mule': {len(mule_rows)}")
for r in mule_rows:
    print(f"#{r[0]}: {r[1]}")

print("\n--- ENTRIES WITH 'h' OR '=' ---")
h_entries = c.execute("SELECT id, headword, part_of_speech FROM entries WHERE headword LIKE '%=%' OR headword LIKE '%h%'").fetchall()
print(f"Total entries with h or =: {len(h_entries)}")
for r in h_entries:
    print(r)

print("\n--- DIALECTS/VARIANTS WITH 'daha' OR 'h' ---")
h_dialects = c.execute("SELECT id, entry_id, locality_name, dialect_form FROM dialects WHERE dialect_form LIKE '%daha%'").fetchall()
for r in h_dialects:
    print(r)
