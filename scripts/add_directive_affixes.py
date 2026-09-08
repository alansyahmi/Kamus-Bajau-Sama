import sqlite3
import shutil
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_directive_affixes_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Safety backup created at: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Derivations table for spatial directives:
# Following the exact 4-term paradigm established for buli' and bunda':
# 1. eN- locative form (en-, em-, eng-, me-)
# 2. si- reciprocal / mutual spatial orientation (Miller p. 284)
# 3. -an applicative / causative placement
# 4. pe- directional motion verb (Miller p. 280-281)

directive_derivations = {
    "diata'": [
        ("endiata'", "di atas", "(at) above, on top, on"),
        ("sidiata'", "bertindan, satu di atas yang lain", "stacked one on top of the other"),
        ("diataan", "ataskan, letak di atas", "to put on top, elevate"),
        ("pediata'", "menaiki, pergi ke atas", "to move to the top, ascend"),
    ],
    "jata'": [
        ("enjata'", "di atas", "(at) above, on top (e.g. enjata' jing)"),
        ("sijata'", "bertindan, satu di atas yang lain", "stacked one on top of the other"),
        ("jataan", "ataskan, letak di atas", "to put on top, elevate"),
        ("pejata'", "menaik, pergi ke atas", "to move upward, ascend"),
    ],
    "dia'": [
        ("endia'", "di bawah", "(at) below, beneath, under"),
        ("sidia'", "berada di bawah satu sama lain", "positioned one below the other"),
        ("diaan", "bawahkan, letak di bawah", "to put beneath, lower"),
        ("pedia'", "menurun, pergi ke bawah", "to move downward, descend"),
    ],
    "diom": [
        ("endiom", "di dalam", "(at) inside, within"),
        ("sidiom", "sama-sama berada di dalam", "mutually inside together"),
        ("dioman", "masukkan ke dalam", "to put inside, insert"),
        ("pediom", "masuk ke dalam", "to go inside, enter"),
    ],
    "diam": [
        ("endiam", "di dalam", "(at) inside, within (e.g. endiam taun)"),
        ("sidiam", "sama-sama berada di dalam", "mutually inside together"),
        ("diaman", "masukkan ke dalam", "to put inside, insert"),
        ("pediam", "masuk ke dalam", "to go inside, enter"),
    ],
    "dialom": [
        ("endialom", "di dalam", "(at) inside, within"),
        ("sidialom", "sama-sama berada di dalam", "mutually inside together"),
        ("dialoman", "masukkan ke dalam", "to put inside, insert"),
        ("pedialom", "masuk ke dalam", "to go inside, enter"),
    ],
    "lua'": [
        ("melua'", "di luar", "(at) outside, exterior (native form)"),
        ("silua'", "sama-sama berada di luar", "mutually outside together"),
        ("luaan", "keluarkan, letak di luar", "to put outside, expel"),
        ("pelua'", "keluar, pergi ke luar", "to go out, emerge"),
    ],
    "sedi": [
        ("ensedi", "di tepi, di sisi", "(at) beside, by the side"),
        ("sisedi", "bersebelahan, berdampingan", "side by side, beside each other"),
        ("sedian", "tepikan, sisihkan", "to set aside, put to the side"),
        ("pesedi", "menepi, pergi ke sisi", "to move beside, step aside"),
    ],
    "tenga'": [
        ("entenga'", "di tengah, di tengah-tengah", "(at) in the middle, center (e.g. entenga'=ni)"),
        ("sitenga'", "sama-sama berada di tengah", "mutually positioned in the center"),
        ("tengaan", "tengahkan, letak di tengah", "to put in the middle, center"),
        ("petenga'", "menengah, pergi ke tengah", "to move to the middle, center"),
    ],
    "torong": [
        ("entorong", "di hujung, di tebing", "(at) the end, tip, edge"),
        ("sitorong", "bertemu hujung ke hujung", "end to end with each other"),
        ("torongan", "hujungkan, letak di hujung", "to put at the end, tip"),
        ("petorong", "menuju ke hujung", "to move toward the end, tip"),
    ],
    "dembila'": [
        ("endembila'", "di seberang, di sebelah sana", "(at) across, on the other side"),
        ("sidembila'", "berseberangan antara satu sama lain", "across from each other (Miller p. 284)"),
        ("dembilaan", "seberangkan, bawa ke seberang", "to bring across to the other side"),
        ("pedembila'", "menyeberang, pergi ke seberang", "to cross over to the other side"),
    ],
    "kuanan": [
        ("engkuanan", "di sebelah kanan", "(at) on the right side"),
        ("sikuanan", "bersebelahan di sebelah kanan", "mutually on the right side"),
        ("kuananan", "kanankan, letak di sebelah kanan", "to put to the right side"),
        ("pekuanan", "menuju ke kanan, pergi ke kanan", "to move to the right"),
    ],
    "gibang": [
        ("enggibang", "di sebelah kiri", "(at) on the left side"),
        ("sigibang", "bersebelahan di sebelah kiri", "mutually on the left side"),
        ("gibangan", "kirikan, letak di sebelah kiri", "to put to the left side"),
        ("pegibang", "menuju ke kiri, pergi ke kiri", "to move to the left"),
    ],
}

total_added = 0

for hw, affs in directive_derivations.items():
    entry = c.execute("SELECT id FROM entries WHERE headword = ?", (hw,)).fetchone()
    if not entry:
        print(f"Warning: Headword '{hw}' not found in entries table!")
        continue
    eid = entry[0]
    
    # Remove older generic affixes if any (e.g. besedi, bedembila')
    c.execute("DELETE FROM affixes WHERE entry_id = ?", (eid,))
    
    print(f"\nAdding {len(affs)} derivations for #{eid} '{hw}':")
    for term, m_ms, m_en in affs:
        c.execute("""
            INSERT INTO affixes (entry_id, term, meaning_ms, meaning_en)
            VALUES (?, ?, ?, ?)
        """, (eid, term, m_ms, m_en))
        print(f"  + {term:15} | {m_ms:35} | {m_en}")
        total_added += 1

conn.commit()
conn.close()

print(f"\nSuccessfully added {total_added} derivations across {len(directive_derivations)} directives!")
