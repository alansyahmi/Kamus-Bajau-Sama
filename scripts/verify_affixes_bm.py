import sys
import sqlite3

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

test_words = ['bagi', 'alap', 'mangan', 'keta', 'beli', 'tilau', 'malas']

print('=== Checking Terbitan Imbuhan with Malay Equivalents ===\n')

for w in test_words:
    c.execute("SELECT id, headword, part_of_speech FROM entries WHERE search_normalized = ?", (w,))
    entry = c.fetchone()
    if entry:
        entry_id, hw, pos = entry
        c.execute("SELECT definition_ms, definition_en FROM senses WHERE entry_id = ?", (entry_id,))
        sense = c.fetchone()
        print(f"• {hw} ({pos}) -> BM: {sense[0]} | EN: {sense[1]}")
        
        c.execute("SELECT term, meaning_ms, meaning_en FROM affixes WHERE entry_id = ?", (entry_id,))
        affixes = c.fetchall()
        for af in affixes:
            print(f"    - {af[0]:15} : {af[1]} [{af[2]}]")
        print()
