import sqlite3
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

# 1. Clean up the 7 noisy fragment rows
c.execute("DELETE FROM examples WHERE id IN (3961, 3981, 3982, 3987, 4033, 4036, 4037)")
# Clean Ahh... to Aa... in #4424
c.execute("UPDATE examples SET sentence_bajau = REPLACE(sentence_bajau, 'Ahh...', 'Aa...') WHERE id = 4424")

conn.commit()

# Check mulé' headword and examples
print("Entries with mul:")
for r in c.execute("SELECT id, headword, search_normalized FROM entries WHERE headword LIKE 'mul%'").fetchall():
    print(" ", r)

print("\nSentences with mul:")
for r in c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%mul%'").fetchall():
    print(" ", r)

print("\nCheck atay:")
print(" ", c.execute("SELECT count(*) FROM entries WHERE headword LIKE '%atay%'").fetchone()[0], "headwords")
print(" ", c.execute("SELECT count(*) FROM examples WHERE sentence_bajau LIKE '%atay%'").fetchone()[0], "examples")

print("\nCheck atai:")
print(" ", c.execute("SELECT count(*) FROM entries WHERE headword LIKE '%atai%'").fetchone()[0], "headwords")
print(" ", c.execute("SELECT count(*) FROM examples WHERE sentence_bajau LIKE '%atai%'").fetchone()[0], "examples")

print("\nCheck '=' clitic symbols:")
print(" ", c.execute("SELECT count(*) FROM examples WHERE sentence_bajau LIKE '%=%'").fetchone()[0], "examples with =")
print(" ", c.execute("SELECT count(*) FROM entries WHERE headword LIKE '%=%'").fetchone()[0], "entries with =")

print("\nCheck 'ke-*-an' or 'te-*' in examples:")
for r in c.execute("SELECT id, sentence_bajau FROM examples WHERE sentence_bajau LIKE '%ke-%' OR sentence_bajau LIKE '%te-%'").fetchall():
    print(" ", r)

conn.close()
