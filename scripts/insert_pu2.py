import sqlite3

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

# Check existing pu' entries
existing = c.execute("SELECT id, headword, part_of_speech FROM entries WHERE headword = \"pu'\"").fetchall()
print(f"Existing pu' entries: {existing}")

# Check if second pu' already exists
has_adverb = any(pos == 'KATA KETERANGAN' for _, _, pos in existing)
if not has_adverb:
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa)
        VALUES ("pu'", "pu", "KATA KETERANGAN", "/puʔ/")
    """)
    new_id = c.lastrowid
    print(f"Inserted new pu' entry #{new_id} as KATA KETERANGAN")

    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, "ke sana nun, ke arah sana (pergerakan terarah ke tempat yang jauh)", "to yonder, thither (directed motion to a distant location)")
    """, (new_id,))
    sense_id = c.lastrowid

    c.execute("""
        INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
        VALUES (?, "Uun entedo Hassan pu' ta' laat dembua' nuut bono'.", "pu'", "Ada suatu ketika Hassan pergi ke sana nun ke negeri lain menyertai pertempuran.", "One time Hassan went yonder to another country to fight.")
    """, (sense_id,))

    c.execute("""
        INSERT INTO sources (entry_id, source_type, description, verified_by)
        VALUES (?, "Buku / Bahan Bertulis", "Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 120)", "Penyelidikan Linguistik (Mark T. Miller, 2007)")
    """, (new_id,))

    conn.commit()
    print("Committed pu' (KATA KETERANGAN) successfully.")
else:
    print("Second pu' entry already exists, skipping insert.")

# Also add the example sentence to entry #19208 'koso' if missing!
koso_sense = c.execute("SELECT id FROM senses WHERE entry_id = 19208").fetchone()
if koso_sense:
    sid = koso_sense[0]
    ex_count = c.execute("SELECT count(*) FROM examples WHERE sense_id = ?", (sid,)).fetchone()[0]
    if ex_count == 0:
        c.execute("""
            INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
            VALUES (?, "Pemia=ti koso, dong kau susa atay, ling=ni.", "koso", "Kita akan mencari dia, jangan kamu susah hati, katanya.", "We will look for (him), don't you worry, he said.")
        """, (sid,))
        conn.commit()
        print("Added authentic example sentence to entry #19208 'koso'.")

conn.close()
