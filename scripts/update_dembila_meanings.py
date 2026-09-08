import sqlite3
import shutil
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_dembila_update_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Safety backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Update affixes under dembila' (#19065)
# Update sidembila'
c.execute("""
    UPDATE affixes 
    SET meaning_ms = 'bersebelahan, berdampingan',
        meaning_en = 'adjacent to, side-to-side, alongside each other'
    WHERE entry_id = 19065 AND term = "sidembila'"
""")

# Check if bedembilaan is already an affix under dembila' (#19065), if not add it
has_bedembilaan = c.execute("SELECT id FROM affixes WHERE entry_id = 19065 AND term = 'bedembilaan'").fetchone()
if not has_bedembilaan:
    c.execute("""
        INSERT INTO affixes (entry_id, term, meaning_ms, meaning_en)
        VALUES (19065, 'bedembilaan', 'seberang-menyeberang, (harfiah) bersebelahan', 'on both sides, across from each other (distributive)')
    """)
    print("Added 'bedembilaan' affix under dembila' (#19065)")
else:
    c.execute("""
        UPDATE affixes 
        SET meaning_ms = 'seberang-menyeberang, (harfiah) bersebelahan',
            meaning_en = 'on both sides, across from each other (distributive)'
        WHERE entry_id = 19065 AND term = 'bedembilaan'
    """)

# 2. Update entry #19552 sidembila'
c.execute("""
    UPDATE senses 
    SET definition_ms = 'bersebelahan, berdampingan',
        definition_en = 'adjacent to, side-to-side, alongside each other'
    WHERE entry_id = 19552 AND order_index = 1
""")
c.execute("""
    UPDATE entries 
    SET part_of_speech = 'KATA SIFAT / KATA KERJA', updated_at = CURRENT_TIMESTAMP
    WHERE id = 19552
""")
# Remove unnatural auto-generated affixes on sidembila'
c.execute("DELETE FROM affixes WHERE entry_id = 19552")
print("Updated entry #19552 'sidembila'' senses and cleaned affixes")

# 3. Update entry #18994 bedembilaan
c.execute("""
    UPDATE senses 
    SET definition_ms = 'seberang-menyeberang, (harfiah) bersebelahan',
        definition_en = 'on both sides, across from each other (distributive)'
    WHERE entry_id = 18994 AND order_index = 1
""")
c.execute("""
    UPDATE entries 
    SET part_of_speech = 'KATA SIFAT', updated_at = CURRENT_TIMESTAMP
    WHERE id = 18994
""")
c.execute("DELETE FROM affixes WHERE entry_id = 18994")
print("Updated entry #18994 'bedembilaan' definition")

conn.commit()
conn.close()
print("All updates to dembila' derivations committed successfully!")
