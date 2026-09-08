import sqlite3
import shutil
import time
import sys
import unicodedata
import re

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_locatives_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Safety backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

def normalize_query(q):
    s = q.strip().lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = re.sub(r"['’`\s\-_=]", '', s)
    if s.endswith('ay'):
        s = s[:-2] + 'ai'
    elif s.endswith('aw'):
        s = s[:-2] + 'au'
    return s

def add_dialect(entry_id, locality, form):
    # Check if already exists
    exists = c.execute("SELECT id FROM dialects WHERE entry_id = ? AND locality_name = ? AND dialect_form = ?", (entry_id, locality, form)).fetchone()
    if not exists:
        c.execute("INSERT INTO dialects (entry_id, locality_name, dialect_form) VALUES (?, ?, ?)", (entry_id, locality, form))
        print(f"  + Added dialect: [{locality}] '{form}' for entry #{entry_id}")

# -------------------------------------------------------------
# 1. diata' (Standard Ancestral / Proto-Sama-Bajaw form) & jata' (KB variant)
# -------------------------------------------------------------
print("\n--- 1. Processing diata' & jata' ---")
# Check if diata' already exists
diata_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("diata'",)).fetchone()
if not diata_row:
    norm = normalize_query("diata'")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("diata'", norm, 'KATA ARAH', '/di.a.taʔ/'))
    diata_id = c.lastrowid
    print(f"Created primary headword 'diata'' with ID #{diata_id}")
    
    # Sense for diata'
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (diata_id, 'atas, di atas, bahagian atas', 'above, on top of, on (ancestral / standard Sama-Bajaw form, PSB *diataʔ)'))
    diata_sense_id = c.lastrowid
    
    # Examples
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        diata_sense_id,
        "Temban no using e en-diata' jing ruma'.",
        "diata'",
        "Kucing itu berada di atas bumbung zink rumah.",
        "The cat stayed on top of the zinc roof of the house."
    ))
    
    # Sources
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (diata_id, "Proto-Sama-Bajaw (*diataʔ); A Grammar of West Coast Bajau, hlm. 89"))
else:
    diata_id = diata_row[0]

# Add variants for diata'
add_dialect(diata_id, 'Kota Belud (KB)', "jata'")
add_dialect(diata_id, 'Varian Dialek', "diyata'")

# Update existing jata' (#19140)
c.execute("""
    UPDATE entries 
    SET part_of_speech = 'KATA ARAH', ipa = '/dʒataʔ/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19140
""")
c.execute("""
    UPDATE senses
    SET definition_ms = ?,
        definition_en = ?
    WHERE entry_id = 19140 AND order_index = 1
""", (
    "atas, di atas, bahagian atas (ragam Kota Belud bagi diata')",
    "above, on top of, on (Kota Belud regional contracted form of diata')"
))
jata_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19140 AND order_index = 1").fetchone()[0]
# Check example for jata'
c.execute("DELETE FROM examples WHERE sense_id = ?", (jata_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    jata_sense_id,
    "Temban no using e en-jata' jing...",
    "jata'",
    "Kucing itu berada di atas bumbung zink...",
    "The cat stayed on top of the zinc (roof)..."
))
add_dialect(19140, 'Bentuk Standard', "diata'")
add_dialect(19140, 'Varian Dialek', "diyata'")
print("Updated jata' (#19140) with KB variant note and authentic example.")


# -------------------------------------------------------------
# 2. diom (Standard Ancestral form), diam (KB variant), dialom (Archaic/Regional)
# -------------------------------------------------------------
print("\n--- 2. Processing diom, diam, dialom ---")
diom_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("diom",)).fetchone()
if not diom_row:
    norm = normalize_query("diom")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("diom", norm, 'KATA ARAH', '/di.om/'))
    diom_id = c.lastrowid
    print(f"Created primary headword 'diom' with ID #{diom_id}")
    
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (diom_id, 'dalam, bahagian dalam (bentuk asal / standard Sama-Bajaw)', 'inside, within (ancestral / standard Sama-Bajaw form, PSB *diom / *dialom)'))
    diom_sense_id = c.lastrowid
    
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        diom_sense_id,
        "Sangsuriang pan lumaan no engko' Situmang en-diom taun.",
        "diom",
        "Sangsuriang berjalan bersama Situmang ke dalam hutan.",
        "Sangsuriang traveled with Situmang into the forest."
    ))
    
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (diom_id, "Proto-Sama-Bajaw (*diom / *dialom); A Grammar of West Coast Bajau, hlm. 89"))
else:
    diom_id = diom_row[0]

add_dialect(diom_id, 'Kota Belud (KB)', 'diam')
add_dialect(diom_id, 'Varian Tradisional', 'dialom')

# Update diam (#19069)
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA ARAH', ipa = '/di.am/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19069
""")
c.execute("""
    UPDATE senses
    SET definition_ms = 'dalam, bahagian dalam (ragam Kota Belud bagi diom)',
        definition_en = 'inside, within (Kota Belud variant of diom)'
    WHERE entry_id = 19069 AND order_index = 1
""")
diam_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19069 AND order_index = 1").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (diam_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    diam_sense_id,
    "Sangsuriang pan lumaan no engko' Situmang en-diam taun.",
    "diam",
    "Sangsuriang berjalan bersama Situmang ke dalam hutan.",
    "Sangsuriang traveled with Situmang into the forest."
))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    diam_sense_id,
    "lua' en-diam lubang langkaw",
    "diam",
    "dari dalam lubang atau terowong yang panjang",
    "from within the long tunnel"
))
add_dialect(19069, 'Bentuk Standard', 'diom')
add_dialect(19069, 'Varian Dialek', 'dialom')
print("Updated diam (#19069) with KB note and authentic examples.")

# Insert dialom
dialom_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("dialom",)).fetchone()
if not dialom_row:
    norm = normalize_query("dialom")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("dialom", norm, 'KATA ARAH', '/di.a.lom/'))
    dialom_id = c.lastrowid
    print(f"Created entry 'dialom' with ID #{dialom_id}")
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (dialom_id, 'dalam, bahagian dalam (varian tradisi / serantau bagi diom)', 'inside, within (archaic / regional Sama-Bajaw variant of diom)'))
    add_dialect(dialom_id, 'Bentuk Standard', 'diom')
    add_dialect(dialom_id, 'Kota Belud (KB)', 'diam')


# -------------------------------------------------------------
# 3. lua' (Native Bajau form) & luar (Malay influence)
# -------------------------------------------------------------
print("\n--- 3. Processing lua' & luar ---")
lua_id = 19269
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA SENDI NAMA / KATA ARAH', ipa = '/luaʔ/', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
""", (lua_id,))

# Ensure Sense 1 has correct preposition definition and example
c.execute("""
    UPDATE senses
    SET definition_ms = 'dari, daripada (kata sendi nama arah atau punca)',
        definition_en = 'from, out of (locative/source preposition)'
    WHERE entry_id = ? AND order_index = 1
""", (lua_id,))
sense1_id = c.execute("SELECT id FROM senses WHERE entry_id = ? AND order_index = 1", (lua_id,)).fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (sense1_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    sense1_id,
    "Masa gai kepo lua' ta' kayangan...",
    "lua'",
    "Pada masa mereka melompat turun dari kayangan...",
    "At the time they jumped down from the heavens..."
))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    sense1_id,
    "...iyo ngagad-ngagad lua' kemuap lagi...",
    "lua'",
    "...dia terus menunggu sejak waktu petang lagi...",
    "...she continued to wait since the afternoon..."
))

# Sense 2: Locative noun 'luar, bahagian luar'
sense2_row = c.execute("SELECT id FROM senses WHERE entry_id = ? AND order_index = 2", (lua_id,)).fetchone()
if not sense2_row:
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 2, ?, ?)
    """, (lua_id, 'luar, bahagian luar (kata arah jati)', 'outside, exterior (native Sama-Bajaw locative noun)'))
    sense2_id = c.lastrowid
else:
    sense2_id = sense2_row[0]
    c.execute("""
        UPDATE senses
        SET definition_ms = 'luar, bahagian luar (kata arah jati)',
            definition_en = 'outside, exterior (native Sama-Bajaw locative noun)'
        WHERE id = ?
    """, (sense2_id,))

c.execute("DELETE FROM examples WHERE sense_id = ?", (sense2_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    sense2_id,
    "Daa temban ta' lua' bilik amun uran.",
    "lua'",
    "Jangan berada di luar bilik jika hujan.",
    "Don't stay outside the room when it rains."
))

add_dialect(lua_id, 'Pengaruh Bahasa Melayu', 'luar')
print("Updated lua' (#19269) with 2 senses (preposition + locative noun) and Malay-influence variant luar.")


# -------------------------------------------------------------
# 4. Other Locative Nouns from Section 4.2.3.4
# -------------------------------------------------------------
print("\n--- 4. Processing remaining locative nouns ---")

# dia' (#19068)
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA ARAH', ipa = '/diyaʔ/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19068
""")
c.execute("""
    UPDATE senses
    SET definition_ms = 'bawah, bahagian bawah',
        definition_en = 'beneath, below, under'
    WHERE entry_id = 19068 AND order_index = 1
""")
dia_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19068 AND order_index = 1").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (dia_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    dia_sense_id,
    "Beranti iyo ta' dia' poon kayu.",
    "dia'",
    "Dia berhenti di bawah pokok.",
    "He stopped beneath a tree."
))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    dia_sense_id,
    "ta' dia' poon suka'",
    "dia'",
    "di bawah pohon kelapa",
    "beneath the coconut tree"
))
print("Enriched dia' (#19068)")

# bunda' (#19049)
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA ARAH', ipa = '/bundaʔ/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19049
""")
c.execute("""
    UPDATE senses
    SET definition_ms = 'hadapan, depan, bahagian depan',
        definition_en = 'front, in front of'
    WHERE entry_id = 19049 AND order_index = 1
""")
bunda_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19049 AND order_index = 1").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (bunda_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    bunda_sense_id,
    "Iyo nanduk-nanduk poon saging em-bunda' beluang gua e.",
    "bunda'",
    "Ia menanduk-nanduk pohon pisang di hadapan pintu gua itu.",
    "She would butt her horns against the banana tree in front of the door to the cave."
))
print("Enriched bunda' (#19049)")

# buli' (#19679)
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA ARAH / KATA NAMA', ipa = '/buliʔ/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19679
""")
c.execute("""
    UPDATE senses
    SET definition_ms = 'belakang, bahagian belakang; punggung',
        definition_en = 'back, behind; rear'
    WHERE entry_id = 19679 AND order_index = 1
""")
buli_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19679 AND order_index = 1").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (buli_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    buli_sense_id,
    "Dendo em-buli' bana ngentan ta' torong puyut.",
    "buli'",
    "Wanita yang di paling belakang memegang hujung sapu tangan.",
    "The woman in the very back holds the end of the handkerchief."
))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    buli_sense_id,
    "em-buli' ruma' e",
    "buli'",
    "di belakang rumah itu",
    "behind the house"
))
print("Enriched buli' (#19679)")

# sedi (#19537)
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA ARAH / KATA NAMA', ipa = '/sədi/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19537
""")
sedi_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19537 AND order_index = 1").fetchone()[0]
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    sedi_sense_id,
    "ta' sedi selang",
    "sedi",
    "di tepi laut / pesisir pantai",
    "beside the sea"
))
print("Enriched sedi (#19537)")

# dembila' (#19065)
c.execute("""
    UPDATE entries
    SET part_of_speech = 'KATA ARAH', ipa = '/dəmbilaʔ/', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19065
""")
c.execute("""
    UPDATE senses
    SET definition_ms = 'seberang, sebelah seberang, bahagian bertentangan',
        definition_en = 'other side, across, opposite side'
    WHERE entry_id = 19065 AND order_index = 1
""")
dembila_sense_id = c.execute("SELECT id FROM senses WHERE entry_id = 19065 AND order_index = 1").fetchone()[0]
c.execute("DELETE FROM examples WHERE sense_id = ?", (dembila_sense_id,))
c.execute("""
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
    VALUES (?, ?, ?, ?, ?)
""", (
    dembila_sense_id,
    "Gai temban ta' dembila' suang.",
    "dembila'",
    "Mereka tinggal di seberang sungai.",
    "They live on the other side of the river."
))
print("Enriched dembila' (#19065)")

# tenga' (New entry)
tenga_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("tenga'",)).fetchone()
if not tenga_row:
    norm = normalize_query("tenga'")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("tenga'", norm, 'KATA ARAH', '/təŋaʔ/'))
    tenga_id = c.lastrowid
    print(f"Created entry 'tenga'' with ID #{tenga_id}")
    
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (tenga_id, 'tengah, bahagian tengah', 'middle, center, midst'))
    tenga_sense_id = c.lastrowid
    
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        tenga_sense_id,
        "Dau-dau tu kono' iko bana kerabaw tenga' padang.",
        "tenga'",
        "Dahulu kala dikatakan sangat banyak kerbau di tengah padang.",
        "A long time ago it is said that there were many buffalo in the middle of the field."
    ))
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        tenga_sense_id,
        "en-tenga'=ni",
        "tenga'",
        "di bahagian tengahnya",
        "in the middle of it"
    ))
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (tenga_id, "Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 89 & 473)"))

# torong (New entry)
torong_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("torong",)).fetchone()
if not torong_row:
    norm = normalize_query("torong")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("torong", norm, 'KATA ARAH', '/toroŋ/'))
    torong_id = c.lastrowid
    print(f"Created entry 'torong' with ID #{torong_id}")
    
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (torong_id, 'hujung, tebing, bucu', 'end, edge, tip'))
    torong_sense_id = c.lastrowid
    
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        torong_sense_id,
        "Dendo em-buli' bana ngentan ta' torong puyut.",
        "torong",
        "Wanita yang di paling belakang memegang hujung sapu tangan.",
        "The woman in the very back holds the end of the handkerchief."
    ))
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (torong_id, "Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 89 & 383)"))

# kuanan (New entry)
kuanan_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("kuanan",)).fetchone()
if not kuanan_row:
    norm = normalize_query("kuanan")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("kuanan", norm, 'KATA ARAH', '/kuanan/'))
    kuanan_id = c.lastrowid
    print(f"Created entry 'kuanan' with ID #{kuanan_id}")
    
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (kuanan_id, 'kanan, sebelah kanan', 'right, right side'))
    kuanan_sense_id = c.lastrowid
    
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        kuanan_sense_id,
        "Iyo lumaan ta' sedi kuanan.",
        "kuanan",
        "Dia berjalan di sebelah kanan.",
        "He walked on the right side."
    ))
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (kuanan_id, "Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 89)"))

# gibang (New entry)
gibang_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("gibang",)).fetchone()
if not gibang_row:
    norm = normalize_query("gibang")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("gibang", norm, 'KATA ARAH', '/gibaŋ/'))
    gibang_id = c.lastrowid
    print(f"Created entry 'gibang' with ID #{gibang_id}")
    
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (gibang_id, 'kiri, sebelah kiri', 'left, left side'))
    gibang_sense_id = c.lastrowid
    
    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, ?, ?, ?, ?)
    """, (
        gibang_sense_id,
        "Pasi ilik ta' sedi gibang dau.",
        "gibang",
        "Sila tengok ke sebelah kiri dahulu.",
        "Please look to the left side first."
    ))
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (gibang_id, "Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 89)"))

# kon (New entry)
kon_row = c.execute("SELECT id FROM entries WHERE headword = ?", ("kon",)).fetchone()
if not kon_row:
    norm = normalize_query("kon")
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, ("kon", norm, 'KATA ARAH / KATA SENDI NAMA', '/kon/'))
    kon_id = c.lastrowid
    print(f"Created entry 'kon' with ID #{kon_id}")
    
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (kon_id, 'sehingga, sampai ke, sejauh', 'until, as far as (locative limit marker)'))
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'corpus', ?)
    """, (kon_id, "Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 89)"))

conn.commit()
conn.close()
print("\nAll locative nouns inserted, enriched, and committed successfully!")
