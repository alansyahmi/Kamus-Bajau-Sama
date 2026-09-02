import sys
import sqlite3

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

c.execute("SELECT id, headword, part_of_speech, ipa FROM entries WHERE search_normalized = 'ngenda'")
entry = c.fetchone()
print('=== Headword ===')
print(entry)

if entry:
    entry_id = entry[0]
    c.execute("SELECT definition_ms, definition_en FROM senses WHERE entry_id = ?", (entry_id,))
    print('\n=== Senses ===')
    for s in c.fetchall():
        print(f"MS: {s[0]} | EN: {s[1]}")

    c.execute("SELECT sentence_bajau, sentence_en, sentence_ms FROM examples WHERE sense_id IN (SELECT id FROM senses WHERE entry_id = ?)", (entry_id,))
    print('\n=== Verified Examples ===')
    for ex in c.fetchall():
        print(f"Bajau: {ex[0]}")
        print(f"EN: {ex[1]}")
        print(f"MS: {ex[2]}")
        print('---')

    c.execute("SELECT related_headword, relation_note FROM thesaurus WHERE entry_id = ?", (entry_id,))
    print('\n=== Thesaurus / Compounds ===')
    for th in c.fetchall():
        print(f"• {th[0]}: {th[1]}")
