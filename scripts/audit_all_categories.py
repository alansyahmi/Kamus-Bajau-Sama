import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

def check_group(title, words):
    print(f"\n=== {title} ===")
    for w in words:
        rows = c.execute("""
            SELECT e.id, e.headword, e.part_of_speech, s.definition_ms 
            FROM entries e 
            LEFT JOIN senses s ON e.id = s.entry_id 
            WHERE e.headword = ?
        """, (w,)).fetchall()
        if rows:
            for r in rows:
                print(f"  FOUND #{r[0]}: '{r[1]}' [{r[2]}] -> {r[3]}")
        else:
            print(f"  MISSING: '{w}'")

# 1. Kata Perintah (Koto Soon)
check_group("1. KATA PERINTAH (Koto Soon / Imperatives)", ['dong', 'daa', "baa'", 'pasi', 'koyon', "koo'"])

# 2. Kata Seru (Koto Pauan / Interjections)
check_group("2. KATA SERU (Koto Pauan / Interjections)", ['adui', 'adoi', 'oi', 'ai', "inda'", "enda'"])

# 3. Kata Nafi (Koto Gega / Negators)
check_group("3. KATA NAFI (Koto Gega / Negators)", ["nya'", 'doh', 'dong', 'daa'])

# 4. Kata Arah (Koto Banting / Directionals)",
check_group("4. KATA ARAH (Koto Banting / Directionals)", [
    'diyata', 'dibaba', 'diaw', 'dilaut', "dembila'", 'diam', 'luar', 'tongan', 'suang', 'kuri'
])

# 5. Penjodoh Bilangan (Penjodo Bilangan / Classifiers)
check_group("5. PENJODOH BILANGAN (Classifiers)", [
    'orang', 'ekol', "dembua'", "bua'", 'kayu', 'keping', 'daun', 'puun', 'tangkai'
])

# 6. Kata Hubung (Koto Ubung / Conjunctions)
check_group("6. KATA HUBUNG (Koto Ubung / Conjunctions)", [
    "engko'", "ko'", "tapi'", 'amun', 'mun', "bo'", 'asal', 'supoyo', 'sabab'
])

# 7. Kata Sendi Nama (Koto Sendi Oron / Prepositions)
check_group("7. KATA SENDI NAMA (Prepositions)", [
    "ta'", 'lekat', "lua'", 'sampay', 'me'
])
