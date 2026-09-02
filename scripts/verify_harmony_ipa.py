import sys
import sqlite3

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

test_words = ['laan', 'raat', 'tingkoo', 'jomo', 'songom', 'kebo', 'beli', 'mangan']

print('=== Verifying Phonetic IPA Vowel Lengthening & Suffix Vowel Harmony ===\n')

for norm in test_words:
    c.execute('SELECT id, headword, ipa, part_of_speech FROM entries WHERE search_normalized = ?', (norm,))
    e = c.fetchone()
    if e:
        print(f"• {e[1]:15} | IPA: {e[2]:12} | POS: {e[3]}")
        c.execute('SELECT term, meaning_ms FROM affixes WHERE entry_id = ?', (e[0],))
        for af in c.fetchall():
            print(f"   - {af[0]:15} -> {af[1]}")
        print()
