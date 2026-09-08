import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

# Fix 3993 and 4057
c.execute("""
    UPDATE examples 
    SET sentence_bajau = "Rupiah ingin mulé' lingaw, tapi' Mastura noo' iyo ningkoo'."
    WHERE id IN (3993, 4057)
""")

# Also check headword for mulé'
entry_mule = c.execute("SELECT id, headword FROM entries WHERE headword LIKE '%mule%'").fetchall()
print("Entries with mule:", entry_mule)

# Check if any '=ni', '=ku', '=nu', '=ti' remain in examples
remain_eq = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%=%'").fetchall()
print(f"Remaining examples with '=': {len(remain_eq)}")
for r in remain_eq:
    print(r)

# Check if any 'atay' remain in examples
remain_atay = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%atay%'").fetchall()
print(f"Remaining examples with 'atay': {len(remain_atay)}")
for r in remain_atay:
    print(r)

# Check if any 'ke-' remain in examples
remain_ke = c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%ke-%'").fetchall()
print(f"Remaining examples with 'ke-': {len(remain_ke)}")
for r in remain_ke:
    print(r)

conn.commit()
conn.close()
print("Check complete.")
