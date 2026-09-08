import sqlite3
import shutil
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_kata_perintah_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Safety backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

def normalize_query(q):
    import unicodedata
    import re
    s = q.strip().lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = re.sub(r"['’`\s\-_=]", '', s)
    if s.endswith('ay'):
        s = s[:-2] + 'ai'
    elif s.endswith('aw'):
        s = s[:-2] + 'au'
    return s

new_perintah_entries = [
    {
        'headword': 'dong',
        'ipa': '/doŋ/',
        'pos': 'KATA PERINTAH',
        'def_ms': 'jangan (kata perintah larangan)',
        'def_en': 'do not, don\'t (negative imperative / prohibitive marker)',
        'sentence_bj': "Dong kau susa atay, ling=ni.",
        'highlight': 'Dong',
        'sentence_ms': "Jangan kamu berasa susah hati, katanya.",
        'sentence_en': "Don't you worry, he said.",
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 381 & 440)',
        'secondary_example': {
            'sentence_bj': "Dong no kam tinau, kiti ruun pengawal mitu.",
            'highlight': 'Dong',
            'sentence_ms': "Jangan kamu semua berasa takut, kita ada pengawal di sini.",
            'sentence_en': "Don't you all be afraid, we have guards here."
        },
        'variants': []
    },
    {
        'headword': 'daa',
        'ipa': '/daː/',
        'pos': 'KATA PERINTAH',
        'def_ms': 'jangan (kata perintah larangan)',
        'def_en': 'do not, don\'t (prohibitive marker, interchangeable with dong)',
        'sentence_bj': "Daa no kiti nipu, daa no kiti muat ke-raat-an.",
        'highlight': 'Daa',
        'sentence_ms': "Janganlah kita menipu, janganlah kita membuat kejahatan.",
        'sentence_en': "Let us not cheat, let us not do bad things.",
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 381 & 385)',
        'secondary_example': {
            'sentence_bj': "Daa kau manas e, aku ke-kuri jo.",
            'highlight': 'Daa',
            'sentence_ms': "Janganlah engkau marah, aku hanya bergurau sahaja.",
            'sentence_en': "Don't be angry! I was just playing around."
        },
        'variants': [('dialek/ortografi', 'daha')]
    },
    {
        'headword': "baa'",
        'ipa': '/baːʔ/',
        'pos': 'KATA PERINTAH',
        'def_ms': 'mari, ayuh, jom (kata perintah ajakan)',
        'def_en': 'let\'s, come on (hortative particle)',
        'sentence_bj': "Baa' no kiti mule' pitu balik sebelum petang.",
        'highlight': "Baa'",
        'sentence_ms': "Marilah kita pulang ke sini semula sebelum waktu petang.",
        'sentence_en': "Come on, let us return here before evening.",
        'source_desc': 'Penyelidikan Linguistik & Penutur Jati Kota Belud',
        'variants': [('dialek/lisan', "ba'")]
    },
    {
        'headword': 'pasi',
        'ipa': '/pa.si/',
        'pos': 'KATA PERINTAH',
        'def_ms': 'sila, jemput, silakan (kata perintah silaan sopan)',
        'def_en': 'please, do (polite imperative marker)',
        'sentence_bj': "Pasi kam ningkoo' mitu diam ruma'.",
        'highlight': 'Pasi',
        'sentence_ms': "Silalah kamu semua duduk di sini di dalam rumah.",
        'sentence_en': "Please sit here inside the house.",
        'source_desc': 'Penutur Jati & Korpus Linguistik Bajau Sama',
        'variants': []
    },
    {
        'headword': "baya'=ni",
        'ipa': '/ba.jaʔ.ni/',
        'pos': 'KATA PERINTAH',
        'def_ms': 'biarkan, biarlah (kata perintah pembiaran)',
        'def_en': 'let it be, allow it (permissive imperative)',
        'sentence_bj': "Mule' jo no kam, baya'=ni no aku temban mitu.",
        'highlight': "baya'=ni",
        'sentence_ms': "Pulang sajalah kamu semua, biarkan aku tinggal di sini.",
        'sentence_en': "You all go home, just let me stay here.",
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 384)',
        'secondary_example': {
            'sentence_bj': "Ahh... baya'=ni! Kakan=ku jo iyan uun.",
            'highlight': "baya'=ni",
            'sentence_ms': "Ahh... biarkanlah! Aku makan sahaja apa yang ada.",
            'sentence_en': "Ahh, let it be! I will eat whatever is available."
        },
        'variants': [('dialek/kata dasar', "baya'")]
    }
]

inserted_count = 0
for entry in new_perintah_entries:
    existing = c.execute("SELECT id FROM entries WHERE headword = ?", (entry['headword'],)).fetchone()
    if existing:
        print(f"Entry '{entry['headword']}' already exists (#{existing[0]}), skipping.")
        continue

    norm = normalize_query(entry['headword'])
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa)
        VALUES (?, ?, ?, ?)
    """, (entry['headword'], norm, entry['pos'], entry['ipa']))
    entry_id = c.lastrowid

    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (entry_id, entry['def_ms'], entry['def_en']))
    sense_id = c.lastrowid

    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (sense_id, entry['sentence_bj'], entry['highlight'], entry['sentence_ms'], entry['sentence_en']))

    if 'secondary_example' in entry and entry['secondary_example']:
        sec = entry['secondary_example']
        c.execute("""
            INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
            VALUES (?, ?, ?, ?, ?)
        """, (sense_id, sec['sentence_bj'], sec['highlight'], sec['sentence_ms'], sec['sentence_en']))

    c.execute("""
        INSERT INTO sources (entry_id, source_type, description, verified_by)
        VALUES (?, 'Buku / Bahan Bertulis', ?, 'Penyelidikan Linguistik (Mark T. Miller, 2007)')
    """, (entry_id, entry['source_desc']))

    for loc, form in entry['variants']:
        c.execute("""
            INSERT INTO dialects (entry_id, locality_name, dialect_form)
            VALUES (?, ?, ?)
        """, (entry_id, loc, form))

    inserted_count += 1
    print(f"Inserted new Kata Perintah #{entry_id}: '{entry['headword']}' ({entry['pos']})")

conn.commit()
conn.close()
print(f"\nAll operations complete! Successfully inserted {inserted_count} new Kata Perintah entries.")
