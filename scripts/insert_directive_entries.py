import sqlite3
import shutil
import time
import sys
import unicodedata
import re
from apply_syllabified_ipa import syllabify_bajau_ipa

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_directive_entries_{int(time.time())}.db'
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

# Directive roots
directive_hws = [
    "buli'", "bunda'", "dia'", "diata'", "jata'", "diom", "diam", "dialom",
    "lua'", "sedi", "tenga'", "torong", "dembila'", "kuanan", "gibang"
]

# Fetch all derivations from affixes table
rows = c.execute(f"""
    SELECT DISTINCT a.term, a.meaning_ms, a.meaning_en, e.headword, e.id
    FROM affixes a
    JOIN entries e ON a.entry_id = e.id
    WHERE e.headword IN ({','.join(['?']*len(directive_hws))})
    ORDER BY a.term ASC
""", directive_hws).fetchall()

print(f"Found {len(rows)} derivation items to process...")

inserted_count = 0
existing_count = 0

for term, m_ms, m_en, root_hw, root_id in rows:
    # Check if entry already exists
    existing = c.execute("SELECT id FROM entries WHERE headword = ?", (term,)).fetchone()
    if existing:
        existing_count += 1
        term_id = existing[0]
        # Ensure thesaurus link exists
        t_link = c.execute("SELECT id FROM thesaurus WHERE entry_id = ? AND related_headword = ?", (term_id, root_hw)).fetchone()
        if not t_link:
            c.execute("INSERT INTO thesaurus (entry_id, related_headword, relation_note) VALUES (?, ?, ?)",
                      (term_id, root_hw, "kata dasar / root word"))
        continue

    # Determine POS
    if term.startswith('em') or term.startswith('en') or term.startswith('eng') or term.startswith('me'):
        pos = 'KATA ARAH'
    elif term.startswith('si'):
        pos = 'KATA KERJA'
    elif term.startswith('pe'):
        pos = 'KATA KERJA'
    elif term.endswith('an'):
        pos = 'KATA KERJA'
    else:
        pos = 'KATA ARAH'

    norm = normalize_query(term)
    ipa = syllabify_bajau_ipa(term)

    # Insert into entries
    c.execute("""
        INSERT INTO entries (headword, search_normalized, part_of_speech, ipa, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, (term, norm, pos, ipa))
    term_id = c.lastrowid

    # Insert into senses
    c.execute("""
        INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
        VALUES (?, 1, ?, ?)
    """, (term_id, m_ms, m_en))

    # Link in thesaurus (term -> root_hw)
    c.execute("""
        INSERT INTO thesaurus (entry_id, related_headword, relation_note)
        VALUES (?, ?, ?)
    """, (term_id, root_hw, "kata dasar / root word"))

    # Link in thesaurus (root_hw -> term)
    c.execute("""
        INSERT INTO thesaurus (entry_id, related_headword, relation_note)
        VALUES (?, ?, ?)
    """, (root_id, term, f"turunan / derivation ({pos.lower()})"))

    # Add source provenance referencing Miller grammar / Sama-Bajaw morphology
    c.execute("""
        INSERT INTO sources (entry_id, source_type, description)
        VALUES (?, 'linguistic_grammar', ?)
    """, (term_id, f"Terbitan morfologi bahasa Bajau Sama bagi kata dasar '{root_hw}' (rujukan: A Grammar of West Coast Bajau, hlm. 89, 280-284)"))

    inserted_count += 1
    print(f"  + Inserted #{term_id} '{term}' [{pos}] {ipa} -> MS: {m_ms}")

conn.commit()
conn.close()

print(f"\nProcessing complete!")
print(f"  - Already existed: {existing_count}")
print(f"  - Newly inserted: {inserted_count}")
