import sys
import sqlite3
import re
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

print("==========================================================")
print("       COMPREHENSIVE KAMUS BAJAU SAMAH DB AUDIT           ")
print("==========================================================\n")

# 1. Check Entries
c.execute('SELECT id, headword, search_normalized, part_of_speech, ipa FROM entries')
entries = c.fetchall()
print(f"Total entries in DB: {len(entries)}")

weird_headwords = []
weird_ipa = []
pos_counts = Counter()

english_stopwords = {
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'from', 
    'with', 'by', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 
    'would', 'may', 'might', 'must', 'will', 'shall', 'not', 'no', 'yes', 
    'this', 'that', 'these', 'those', 'what', 'who', 'whom', 'whose', 
    'which', 'why', 'how', 'when', 'where', 'also', 'about', 'just', 'too'
}

grammar_abbrevs = {
    'av', 'uv', 'pv', 'iv', 'dv', 'foc', 'top', 'perf', 'cmpl', 'prog', 
    'dist', 'prox', 'sg', 'pl', '1s', '2s', '3s', '1p', '2p', '3p', 
    'nom', 'acc', 'gen', 'dat', 'obl', 'loc', 'inst', 'caus', 'appl', 
    'pass', 'act', 'hort', 'neg', 'emp', 'lig', 'lnk', 'clf', 'hab', 
    'iter', 'recp', 'refl', 'stat', 'tr', 'intr', 'adj', 'adv', 'n', 'v'
}

for e_id, hw, norm, pos, ipa in entries:
    pos_counts[pos] += 1
    
    # Check headword characters
    if not re.match(r"^[a-zA-Z\x27\-éÉ]+$", hw):
        weird_headwords.append((hw, "Mengandungi simbol / aksara tidak sah"))
    if hw.lower() in english_stopwords and hw.lower() not in ['no']:
        weird_headwords.append((hw, "Perkataan bahasa Inggeris (stopword)"))
    if hw.lower() in grammar_abbrevs:
        weird_headwords.append((hw, "Singkatan tatabahasa / glos linguistic (metalanguage)"))
    if hw.startswith('-') or hw.endswith('-') or '--' in hw:
        weird_headwords.append((hw, "Kedudukan tanda sengkang '-' janggal"))
    if len(hw) <= 1 and hw.lower() not in ['e', 'i', 'o', 'a']:
        weird_headwords.append((hw, "Satu huruf bukan partikel sah"))
        
    # Check IPA
    if not ipa or not ipa.startswith('/') or not ipa.endswith('/'):
        weird_ipa.append((hw, ipa, "IPA tidak lengkap atau tiada kurungan //"))

print(f"\n[1] Ketidaktentuan Kata Dasar (Headwords): {len(weird_headwords)}")
for hw, reason in weird_headwords:
    print(f"   • \"{hw}\": {reason}")

print(f"\n[2] Taburan Golongan Kata (Part of Speech):")
for pos, count in pos_counts.most_common():
    print(f"   • {pos:30}: {count}")

# 2. Check Senses & Definitions
c.execute('SELECT s.id, e.headword, s.definition_ms, s.definition_en FROM senses s JOIN entries e ON s.entry_id = e.id')
senses = c.fetchall()

weird_senses = []
for s_id, hw, ms, en in senses:
    if not ms or ms.strip() == '':
        weird_senses.append((hw, "Definisi Melayu kosong"))
    if '/' in ms:
        weird_senses.append((hw, f"Mengandungi simbol /: '{ms}'"))
    if ms.strip().lower() == hw.strip().lower() and len(hw) > 2:
        weird_senses.append((hw, f"Definisi Melayu sama dengan kata dasar: '{ms}'"))
    if len(ms.split()) > 15:
        weird_senses.append((hw, f"Definisi Melayu terlalu panjang: '{ms[:60]}...'"))
    
    # Check for English leakage in definition_ms
    ms_words = set(re.findall(r'[a-z]+', ms.lower()))
    leaked = ms_words.intersection(english_stopwords)
    real_leaks = leaked.intersection({'the', 'and', 'with', 'for', 'from', 'of', 'is', 'are', 'be', 'to', 'have', 'has', 'about', 'just', 'too'})
    if real_leaks:
        weird_senses.append((hw, f"Kamus Melayu mengandungi perkataan Inggeris {real_leaks} dalam: '{ms}'"))

print(f"\n[3] Ketidaktentuan Definisi (Senses & Definitions): {len(weird_senses)}")
for hw, reason in weird_senses:
    print(f"   • \"{hw}\": {reason}")

# 3. Check Examples
c.execute('SELECT ex.id, e.headword, ex.sentence_bajau, ex.sentence_ms, ex.sentence_en, ex.highlight_word FROM examples ex JOIN senses s ON ex.sense_id = s.id JOIN entries e ON s.entry_id = e.id')
examples = c.fetchall()
weird_examples = []
for ex_id, hw, bj, ms, en, hl in examples:
    if not bj or len(bj.split()) < 2:
        weird_examples.append((hw, "Ayat contoh kosong atau terlalu pendek"))
    if '   ' in bj or '  ' in bj:
        weird_examples.append((hw, f"Ruang jarak berganda dalam ayat Bajau: '{bj}'"))
    if not ms or not en:
        weird_examples.append((hw, "Tiada terjemahan Melayu / Inggeris"))

print(f"\n[4] Ketidaktentuan Ayat Contoh (Examples): {len(weird_examples)}")
for hw, reason in weird_examples:
    print(f"   • \"{hw}\": {reason}")

# 4. Check Affixes
c.execute('SELECT a.id, e.headword, a.term, a.meaning_ms FROM affixes a JOIN entries e ON a.entry_id = e.id')
affixes = c.fetchall()
weird_affixes = []
for a_id, hw, term, ms in affixes:
    if not re.match(r"^[a-zA-Z\x27\-éÉ]+$", term):
        weird_affixes.append((hw, term, "Aksara tidak sah dalam bentuk terbitan"))
    if '/' in ms:
        weird_affixes.append((hw, term, f"Mengandungi simbol / dalam maksud: '{ms}'"))
    if term.endswith('oan'):
        weird_affixes.append((hw, term, "Melanggar harmoni vokal -on (berakhir dengan -oan)"))

print(f"\n[5] Ketidaktentuan Bentuk Terbitan (Affixes): {len(weird_affixes)}")
for hw, term, reason in weird_affixes[:15]:
    print(f"   • \"{hw}\" -> \"{term}\": {reason}")

# 5. Check Thesaurus & Dialects
c.execute('SELECT count(*) FROM dialects')
dialect_count = c.fetchone()[0]
c.execute('SELECT count(*) FROM thesaurus')
thesaurus_count = c.fetchone()[0]
c.execute('SELECT count(*) FROM sources')
source_count = c.fetchone()[0]

print(f"\n[6] Statistik Entri Sokongan:")
print(f"   • Variasi Dialek  : {dialect_count}")
print(f"   • Hubungan Tesaurus : {thesaurus_count}")
print(f"   • Sumber / Rujukan : {source_count}")
print("\n==========================================================")
