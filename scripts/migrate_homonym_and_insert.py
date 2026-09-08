import sqlite3
import shutil
import time

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_homonym_migration_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Check table definition
schema_sql = c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='entries'").fetchone()[0]
print("Current schema:", schema_sql)

if "UNIQUE" in schema_sql.upper():
    print("Removing UNIQUE constraint from entries.headword...")
    c.execute("PRAGMA foreign_keys = OFF;")
    c.execute("""
        CREATE TABLE entries_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            headword TEXT NOT NULL,
            search_normalized TEXT NOT NULL,
            part_of_speech TEXT NOT NULL,
            ipa TEXT,
            audio_url TEXT,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
            updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
        );
    """)
    c.execute("""
        INSERT INTO entries_new (id, headword, search_normalized, part_of_speech, ipa, audio_url, created_at, updated_at)
        SELECT id, headword, search_normalized, part_of_speech, ipa, audio_url, created_at, updated_at FROM entries;
    """)
    c.execute("DROP TABLE entries;")
    c.execute("ALTER TABLE entries_new RENAME TO entries;")
    c.execute("CREATE INDEX IF NOT EXISTS entries_headword_idx ON entries (headword);")
    c.execute("CREATE INDEX IF NOT EXISTS entries_search_normalized_idx ON entries (search_normalized);")
    c.execute("PRAGMA foreign_keys = ON;")
    print("entries table successfully updated without UNIQUE constraint.")

# Now insert the second pu' entry
existing_pu = c.execute("SELECT id, headword, part_of_speech FROM entries WHERE headword = \"pu'\"").fetchall()
print("Existing pu' entries:", existing_pu)

has_adverb = any(pos == 'KATA KETERANGAN' for _, _, pos in existing_pu)
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
    print(f"Sense, example, and source inserted for pu' #{new_id}")

# Add example to koso if missing
koso_sense = c.execute("SELECT id FROM senses WHERE entry_id = 19208").fetchone()
if koso_sense:
    sid = koso_sense[0]
    ex_count = c.execute("SELECT count(*) FROM examples WHERE sense_id = ?", (sid,)).fetchone()[0]
    if ex_count == 0:
        c.execute("""
            INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en)
            VALUES (?, "Pemia=ti koso, dong kau susa atay, ling=ni.", "koso", "Kita akan mencari dia, jangan kamu susah hati, katanya.", "We will look for (him), don't you worry, he said.")
        """, (sid,))
        print("Added authentic example sentence to entry #19208 'koso'.")

conn.commit()
conn.close()
print("Migration completed successfully!")
