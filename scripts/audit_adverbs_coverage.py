import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('dictionary.db')
c = conn.cursor()

candidate_adverbs = [
    # Narrative
    ('terus', 'serta-merta, terus, langsung', 'straight away; immediately'),
    ('mono-mono', 'tiba-tiba, sekonyong-konyong', 'suddenly'),
    ('semono-mono', 'tiba-tiba, sekonyong-konyong', 'suddenly'),
    # Aspectual
    ('lagi', 'masih, lagi, selanjutnya', 'still, yet, further, more'),
    ('masi', 'masih', 'still'),
    ('kakal', 'masih, kekal', 'still, continuing'),
    ('balik', 'lagi, sekali lagi, semula', 'again, back'),
    ('boi-boi', 'pernah', 'ever before, once'),
    # Frequency
    ('selalu', 'selalu, lazimnya', 'always, usually'),
    ('gorot', 'kerap, sering', 'frequently, often'),
    ('bioso', 'biasanya, lazimnya', 'normally, usually'),
    ('kadang-kadang', 'kadang-kadang', 'sometimes, on occasion'),
    ('jarang', 'jarang, jarang-jarang', 'rarely, seldom'),
    ('entedo', 'sekali, satu ketika', 'once, one time'),
    ('menduo', 'dua kali', 'twice'),
    ('mentelu', 'tiga kali', 'thrice'),
    ('mempat', 'empat kali', 'four times'),
    ('mendangai', 'berapa kali', 'how many times'),
    # Manner
    ('likas', 'cepat, pantas, lekas', 'quickly, fast'),
    ('lingaw', 'cepat, lekas, pantas', 'quick, hurried'),
    ('daras', 'kuat, deras, bertenaga', 'powerfully, vigorously'),
    # Degree
    ('bana', 'sangat, benar-benar, sungguh', 'very, truly, thoroughly'),
    ('sukup', 'sangat, cukup', 'very, quite, sufficiently'),
    ('paling', 'paling', 'most, extremely'),
    ('telampau', 'terlampau, terlalu', 'too, excessively'),
    ('telampaw', 'terlampau, terlalu', 'too, excessively'),
    # Time
    ('sini\'', 'tadi, sebentar tadi', 'earlier, just now'),
    ('si\'', 'tadi, sebentar tadi', 'earlier, just now'),
    ('bau', 'baharu sahaja, baru-baru ini', 'just now, recently'),
    ('kaang', 'nanti, kelak, sekejap lagi', 'later, by and by'),
    ('betiru', 'sekarang, hari ini, kini', 'today, now, nowadays'),
    ('dau', 'dahulu, sebelum ini', 'before, previously, first'),
    ('dau-dau', 'zaman dahulu, dahulu kala', 'long ago, in the past'),
    ('dilau', 'semalam, kelmarin', 'yesterday'),
    ('dilaw', 'semalam, kelmarin', 'yesterday'),
    ('maung', 'esok', 'tomorrow'),
    ('bangi dilaw', 'kelmarin dulu', 'the day before yesterday'),
    ('suang dikau\'', 'lusa', 'the day after tomorrow'),
    ('debui\'', 'malam tadi, semalam', 'last night'),
    ('sinsaung', 'pagi, pada waktu pagi', 'in the morning'),
    ('kemuap', 'petang, pada waktu petang', 'in the afternoon'),
    ('songom', 'malam, pada waktu malam', 'at night'),
    ('langa ellaw', 'tengah hari', 'midday, noon'),
    # Sentence
    ('alap', 'mujur, untung', 'fortunately, luckily'),
    ('nasip', 'nasib baik, mujur', 'luckily, as luck would have it'),
    ('patut', 'patutlah', 'no wonder'),
    ('rupo-rupo=ni', 'rupanya, nampaknya', 'apparently, seemingly'),
    ('rupo=ni', 'rupanya, nampaknya', 'apparently, seemingly'),
    ('muda\'-mudaan', 'mudah-mudahan, semoga', 'hopefully'),
    ('mungkin', 'mungkin, barangkali', 'maybe, perhaps'),
    ('andang', 'sememangnya, semestinya', 'certainly, inherently'),
    ('andang-andang', 'sememangnya, semestinya', 'certainly, inherently'),
    ('mimang', 'memang, tentu sekali', 'certainly, surely'),
    ('kono\'', 'katanya, kononnya, khabarnya', 'hearsay, it is said'),
    # Deictic
    ('mitu', 'di sini', 'here'),
    ('me', 'di sana', 'there'),
    ('mu\'', 'di sana nun, di seberang', 'over yonder, over there'),
    ('pitu', 'ke sini', 'to here, hither'),
    ('pe', 'ke sana', 'to there, thither'),
    ('pu\'', 'ke sana nun', 'to yonder'),
    ('begé', 'begitu, seperti itu', 'like that, like this'),
    ('bege', 'begitu, seperti itu', 'like that, like this'),
]

found = []
missing = []

for word, ms, en in candidate_adverbs:
    res = c.execute("SELECT id, headword, part_of_speech FROM entries WHERE headword = ?", (word,)).fetchall()
    if res:
        found.append((word, res[0][0], res[0][2], ms, en))
    else:
        missing.append((word, ms, en))

print(f"=== FOUND IN DB ({len(found)}) ===")
for w, eid, pos, ms, en in found:
    print(f"  [#{eid}] {w} -> current POS: '{pos}' (meaning: {ms})")

print(f"\n=== MISSING IN DB ({len(missing)}) ===")
for w, ms, en in missing:
    print(f"  {w} : {ms} | {en}")
