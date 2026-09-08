import sqlite3
import re
import shutil
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_orthography_fixes_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Update entries headwords
# rupo=ni -> rupo-ni
c.execute("UPDATE entries SET headword = 'rupo-ni', search_normalized = 'ruponi' WHERE headword = 'rupo=ni'")
# baya'=ni -> baya'-ni
c.execute("UPDATE entries SET headword = \"baya'-ni\", search_normalized = 'bayani' WHERE headword = \"baya'=ni\"")
# habis -> abis (if exists)
c.execute("UPDATE entries SET headword = 'abis', search_normalized = 'abis', ipa = '/abis/' WHERE id = 19121")

# 2. Remove 'daha' from dialects
c.execute("DELETE FROM dialects WHERE dialect_form = 'daha'")
print("Removed 'daha' from dialects (violates native Sama phonotactics).")

# 3. Clean all example sentences in examples table
rows = c.execute("SELECT id, sentence_bajau, highlight_word FROM examples").fetchall()
updated_count = 0

def clean_orthography(text):
    if not text:
        return text
    s = text

    # 1. Pronomial clitic = to - (e.g. =ku, =nu, =ni, =ti, =kami, =kam, =gai)
    s = re.sub(r'=(\w+)', r'-\1', s)

    # 2. Specific fix: atay -> atai, matay -> matai
    s = re.sub(r'\batay\b', 'atai', s)
    s = re.sub(r'\bmatay\b', 'matai', s)

    # 3. Specific fix: mule' -> mulé'
    s = re.sub(r"\bmule'\b", "mulé'", s)
    s = re.sub(r"\bMule'\b", "Mulé'", s)

    # 4. Remove hyphens in affixes / un-hyphenate morphological glosses
    # ke-X-an -> keXan
    s = re.sub(r'\bke-([a-z]+)-an\b', r'ke\1an', s, flags=re.IGNORECASE)
    # te-kito -> tekito
    s = re.sub(r'\bte-([a-z]+)\b', r'te\1', s, flags=re.IGNORECASE)
    # pe-X -> peX
    s = re.sub(r'\bpe-([a-z]+)\b', r'pe\1', s, flags=re.IGNORECASE)
    # nge-X -> ngeX
    s = re.sub(r'\bnge-([a-z]+)\b', r'nge\1', s, flags=re.IGNORECASE)
    # ng-X -> ngX
    s = re.sub(r'\bng-([a-z]+)\b', r'ng\1', s, flags=re.IGNORECASE)
    # me-kito-on -> mekitoon
    s = re.sub(r'\bme-([a-z]+)-on\b', r'me\1on', s, flags=re.IGNORECASE)
    # X-in-Y or C-in-V infix: b-in-oo -> binoo, t-in-onom -> tinonom, etc.
    s = re.sub(r'\b([b-df-hj-np-tv-z])-in-([a-z]+)\b', r'\1in\2', s, flags=re.IGNORECASE)
    # l-um-aan -> lumaan
    s = re.sub(r'\b([b-df-hj-np-tv-z])-um-([a-z]+)\b', r'\1um\2', s, flags=re.IGNORECASE)
    # di-kau' -> dikau'
    s = re.sub(r"\bdi-kau'\b", "dikau'", s, flags=re.IGNORECASE)
    # eng-Kuta' -> engKuta' or ta' Kuta'
    s = s.replace("eng-Kuta'", "engKuta'")
    # em-bunda' -> embunda'
    s = s.replace("em-bunda'", "embunda'")
    # pedih -> pedis
    s = s.replace("pedih", "pedis")

    return s

for ex_id, sent, hl in rows:
    cleaned_sent = clean_orthography(sent)
    cleaned_hl = clean_orthography(hl) if hl else hl

    if cleaned_sent != sent or cleaned_hl != hl:
        c.execute("""
            UPDATE examples 
            SET sentence_bajau = ?, highlight_word = ?
            WHERE id = ?
        """, (cleaned_sent, cleaned_hl, ex_id))
        print(f"#{ex_id}:")
        print(f"  OLD: {sent}")
        print(f"  NEW: {cleaned_sent}")
        updated_count += 1

conn.commit()
conn.close()
print(f"\nCompleted orthography fixes! Updated {updated_count} example sentences.")
