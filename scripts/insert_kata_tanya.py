import sqlite3
import shutil
import time

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_kata_tanya_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Update existing entries
# sian (#19559) -> KATA TANYA, update defs & replace poor example
c.execute("""
    UPDATE entries 
    SET part_of_speech = 'KATA TANYA', updated_at = CURRENT_TIMESTAMP 
    WHERE id = 19559
""")
c.execute("""
    UPDATE senses 
    SET definition_ms = 'siapa, siapakah', definition_en = 'who, whom (interrogative pronoun)' 
    WHERE entry_id = 19559 AND order_index = 1
""")
sian_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19559").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (sian_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, 'Sian oron=nu?', 'Sian', 'Siapakah nama kamu?', 'What is your name? (lit. Who is your name?)')
""", (sian_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, "Ta' sian kau boi turi debui'?", 'sian', 'Di rumah siapakah kamu tidur malam tadi?', 'At whose place did you sleep last night?')
""", (sian_sense_id,))
print("Updated #19559 'sian' to KATA TANYA with authentic Miller (2007) examples.")

# minggo (#19309) -> add authentic examples
minggo_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19309").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (minggo_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, 'Minggo tungan mandi mitu?', 'Minggo', 'Di manakah tempat mandi di sini?', 'Where is a place to bathe here?')
""", (minggo_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, "Minggo kam boi turi debui'?", 'Minggo', 'Di manakah kamu tidur malam tadi?', 'Where did you sleep last night?')
""", (minggo_sense_id,))
print("Enriched #19309 'minggo' with authentic Miller (2007) examples.")

# enggo (#19101) -> add authentic examples
enggo_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19101").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (enggo_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, "Badu enggo boi pene'=nu?", 'enggo', 'Baju manakah yang telah kamu pilih?', 'Which shirt did you choose?')
""", (enggo_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, "Enggo di'=ku Amat? ling Inang.", 'Enggo', 'Di manakah adikku Amat? kata Inang.', 'Where is my younger brother Amat? said Inang.')
""", (enggo_sense_id,))
print("Enriched #19101 'enggo' with authentic Miller (2007) examples.")

# pian (#19493) -> add authentic example
pian_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19493").fetchone()[0]
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, "Pian le'=ku nya' sugul bana, te-ingot=ku hal e.", 'Pian', 'Bagaimanakah caranya aku tidak sangat bersedih, teringat aku akan hal itu.', 'How could I not be very upset, remembering that matter.')
""", (pian_sense_id,))
print("Enriched #19493 'pian' with authentic Miller (2007) example.")

# dangai (#19055) -> add authentic example
dangai_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19055").fetchone()[0]
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, "Kiniro jo dangay orang boi pinanggil e si'.", 'dangay', 'Dikira sahaja berapa orang yang telah dipanggil tadi.', 'Let it be counted how many people were invited.')
""", (dangai_sense_id,))
print("Enriched #19055 'dangai' with authentic Miller (2007) example.")

# Helper to normalize
def normalize_query(q):
    import unicodedata
    import re
    s = q.strip().lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = re.sub(r"['’`\s\-_]", '', s)
    if s.endswith('ay'):
        s = s[:-2] + 'ai'
    elif s.endswith('aw'):
        s = s[:-2] + 'au'
    return s

# 2. Insert new Kata Tanya entries
new_entries = [
    {
        'headword': 'iyan',
        'ipa': '/i.jan/',
        'pos': 'KATA TANYA',
        'def_ms': 'apa, apakah',
        'def_en': 'what (interrogative pronoun)',
        'sentence_bj': "pak pan tilaw, 'Iyan boo=nu e, Kin?'",
        'highlight': 'Iyan',
        'sentence_ms': "Katak pun bertanya, 'Apakah yang kamu bawa itu, Kin?'",
        'sentence_en': "The frog asked, 'What are you to bring, Kin?'",
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 387)',
        'variants': [('dialek/lisan', 'ai'), ('dialek/lisan', 'nu')]
    },
    {
        'headword': 'emberen',
        'ipa': '/əm.bə.rən/',
        'pos': 'KATA TANYA',
        'def_ms': 'bila, bilakah',
        'def_en': 'when (interrogative adverb of time)',
        'sentence_bj': "Emberen kau mule' pitu balik?",
        'highlight': 'Emberen',
        'sentence_ms': 'Bilakah kamu akan pulang ke sini semula?',
        'sentence_en': 'When will you return here again?',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 388)',
        'variants': []
    },
    {
        'headword': 'ngini',
        'ipa': '/ŋi.ni/',
        'pos': 'KATA TANYA',
        'def_ms': 'mengapa, kenapa',
        'def_en': 'why (interrogative adverb of reason)',
        'sentence_bj': "Ngini kau nya' maku kebanaran m-aku'?",
        'highlight': 'Ngini',
        'sentence_ms': 'Mengapa kamu tidak meminta izin daripadaku?',
        'sentence_en': 'Why did you not ask permission of me?',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 388)',
        'variants': []
    },
    {
        'headword': 'ka',
        'ipa': '/ka/',
        'pos': 'KATA TANYA',
        'def_ms': '-kah (partikel penanya soalan ya/tidak)',
        'def_en': 'question particle for polar / yes-no questions (equivalent to Malay -kah)',
        'sentence_bj': "Buli ka kiti be-soro' ta' mahkamah? ling rojo.",
        'highlight': 'ka',
        'sentence_ms': 'Bolehkah kita bertengkar tentang hal ini di mahkamah? kata raja.',
        'sentence_en': 'Can we dispute this in court? said the king.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 386)',
        'variants': []
    },
    {
        'headword': 'ano',
        'ipa': '/a.no/',
        'pos': 'KATA GANTI NAMA TANYA',
        'def_ms': 'apa namanya (kata ganti tanya atau penanda ragu-ragu apabila terlupa nama benda sementara)',
        'def_en': "what's-it-called (hesitation interrogative / indefinite pronoun)",
        'sentence_bj': "Moo kau ano e pitu, timba e.",
        'highlight': 'ano',
        'sentence_ms': 'Bawalah apa namanya itu ke sini, baldi itu.',
        'sentence_en': "Bring that what's-it-called here, the bucket.",
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 390)',
        'variants': []
    }
]

inserted_count = 0
for entry in new_entries:
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
    print(f"Inserted new Kata Tanya #{entry_id}: '{entry['headword']}' ({entry['pos']})")

conn.commit()
conn.close()
print(f"\nCompleted! Inserted {inserted_count} new Kata Tanya entries.")
