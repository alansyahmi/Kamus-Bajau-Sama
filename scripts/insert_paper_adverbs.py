import sqlite3
import os
import shutil
import time

db_path = os.path.join(os.getcwd(), 'dictionary.db')
backup_path = os.path.join(os.getcwd(), 'backups', f'dictionary_pre_adverbs_{int(time.time())}.db')
shutil.copyfile(db_path, backup_path)
print(f"Safety backup saved to: {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Update existing entries to KATA KETERANGAN
existing_updates = [
    (19312, 'mono-mono', 'KATA KETERANGAN', 'tiba-tiba, sekonyong-konyong', 'suddenly'),
    (19540, 'selalu', 'KATA KETERANGAN', 'selalu, lazimnya', 'always, usually'),
    (19139, 'jarang', 'KATA KETERANGAN', 'jarang, jarang-jarang', 'rarely, seldom'),
    (19391, 'paling', 'KATA KETERANGAN', 'paling', 'most, extremely'),
    (19059, 'dau', 'KATA KETERANGAN', 'dahulu, sebelum ini', 'before, previously, first'),
    (19298, 'menduo', 'KATA KETERANGAN', 'dua kali', 'twice (frequentative adverb)'),
    (19299, 'mentelu', 'KATA KETERANGAN', 'tiga kali', 'thrice (frequentative adverb)'),
    (19296, 'mempat', 'KATA KETERANGAN', 'empat kali', 'four times (frequentative adverb)'),
]

for eid, hw, pos, def_ms, def_en in existing_updates:
    c.execute("UPDATE entries SET part_of_speech = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (pos, eid))
    c.execute("UPDATE senses SET definition_ms = ?, definition_en = ? WHERE entry_id = ? AND order_index = 1", (def_ms, def_en, eid))
    print(f"Updated existing entry #{eid} '{hw}' -> POS: {pos}")

# Helper to normalize query
def normalize_query(q):
    import unicodedata
    import re
    s = q.strip().lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = re.sub(r"['’`\s\-_]", '', s)
    if s.endswith('ay'):
        s = s[:-2] + 'ai'
    elif s.endswith('aw'):
        s = s[:-2] + 'au'
    return s

# 2. Insert new authoritative adverb entries from Mark T. Miller (2007)
new_adverbs = [
    {
        'headword': 'terus',
        'ipa': '/tə.rus/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'serta-merta, terus, langsung',
        'def_en': 'straight away, immediately (narrative adverb)',
        'sentence_bj': "Te-kito=ni jo uwa' e lulai sorop meniik, terus iyo memia te' tungan=ni tapuk.",
        'highlight': 'terus',
        'sentence_ms': 'Apabila dilihatnya anjing itu berlari mendaki, dia terus mencari tempat bersembunyi.',
        'sentence_en': 'When he saw the dog running toward him, he immediately searched for a place to hide.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 346)'
    },
    {
        'headword': 'semono-mono',
        'ipa': '/sə.mo.no.mo.no/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'tiba-tiba, sekonyong-konyong',
        'def_en': 'suddenly, all of a sudden (narrative adverb)',
        'sentence_bj': 'Rupiah pe-loot diam sumpat, semono-mono nge-raa iyo.',
        'highlight': 'semono-mono',
        'sentence_ms': 'Rupiah menyeluk ke dalam semak, tiba-tiba dia berteriak.',
        'sentence_en': 'Rupiah reached into the underbrush, and suddenly he screamed.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 346)'
    },
    {
        'headword': 'entedo',
        'ipa': '/ən.tə.do/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'sekali, suatu ketika, pada suatu masa',
        'def_en': 'once, one time (adverb of frequency)',
        'sentence_bj': "Uun entedo Hassan pu' ta' laat dembua' nuut bono'.",
        'highlight': 'entedo',
        'sentence_ms': 'Ada suatu ketika Hassan pergi ke negeri lain menyertai pertempuran.',
        'sentence_en': 'One time Hassan went yonder to another country to fight.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 120)'
    },
    {
        'headword': 'lingaw',
        'ipa': '/li.ŋaw/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'cepat, lekas, pantas',
        'def_en': 'quickly, hurried (manner adverb)',
        'sentence_bj': "Rupiah ingin mule' lingaw, tapi' Mastura noo' iyo ningkoo'.",
        'highlight': 'lingaw',
        'sentence_ms': 'Rupiah ingin pulang dengan pantas, tetapi Mastura menyuruhnya duduk.',
        'sentence_en': 'Rupiah wanted to return home quickly, but Mastura made him sit down.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 349)'
    },
    {
        'headword': 'betiru',
        'ipa': '/bə.ti.ru/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'sekarang, hari ini, kini, masa ini',
        'def_en': 'now, nowadays, today (adverb of time)',
        'sentence_bj': "Jarang bana no pan muat gula' tebu tu betiru.",
        'highlight': 'betiru',
        'sentence_ms': 'Sangat jarang orang membuat gula tebu pada masa sekarang.',
        'sentence_en': 'Very rarely do people make cane sugar nowadays.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 350)'
    },
    {
        'headword': "debui'",
        'ipa': '/də.bujʔ/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'malam tadi, kelmarin malam',
        'def_en': 'last night (adverb of time)',
        'sentence_bj': "Minggo kam boi turi debui'?",
        'highlight': "debui'",
        'sentence_ms': 'Di manakah kamu tidur malam tadi?',
        'sentence_en': 'Where did you sleep last night?',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 119)'
    },
    {
        'headword': 'sinsaung',
        'ipa': '/sin.sawŋ/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'pagi, pada waktu pagi, awal pagi',
        'def_en': 'in the morning, early morning (adverb of time)',
        'sentence_bj': "Sinsaung awal lagi iyang=ni ng-ogo ruma' rojo.",
        'highlight': 'sinsaung',
        'sentence_ms': 'Awal pagi lagi ibunya pergi menziarahi istana raja.',
        'sentence_en': 'When it was still early in the morning, his mother went to the palace.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 347)'
    },
    {
        'headword': 'rupo=ni',
        'ipa': '/ru.po.ni/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'rupanya, nampaknya, rupa-rupanya',
        'def_en': 'apparently, seemingly (sentence adverb of certainty)',
        'sentence_bj': 'Rupo-rupo=ni, kakal pala te-ingot=ni.',
        'highlight': 'rupo-rupo=ni',
        'sentence_ms': 'Rupa-rupanya dia masih ingat lagi hal itu.',
        'sentence_en': 'Apparently, she still remembered the matter.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 353)'
    },
    {
        'headword': 'mitu',
        'ipa': '/mi.tu/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'di sini',
        'def_en': 'here (deictic adverb of location)',
        'sentence_bj': 'Te-kito=ku ruun dekiit jo jamban mitu.',
        'highlight': 'mitu',
        'sentence_ms': 'Saya lihat hanya ada sedikit tandas di sini.',
        'sentence_en': 'I see that there are few toilets here.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 118)'
    },
    {
        'headword': 'me',
        'ipa': '/me/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'di sana, di situ',
        'def_en': 'there (deictic adverb of location)',
        'sentence_bj': "Aku ningkoo'-ningkoo' jo me me-luar.",
        'highlight': 'me',
        'sentence_ms': 'Saya duduk-duduk sahaja di sana di bahagian luar.',
        'sentence_en': 'I just kept sitting there outside.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 118)'
    },
    {
        'headword': "mu'",
        'ipa': '/muʔ/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'di sana nun, di seberang sana',
        'def_en': 'yonder, over there (deictic adverb of location)',
        'sentence_bj': "Bo'=ku likas ng-ogo sioko=ku dela e mu' dembila' ruma'.",
        'highlight': "mu'",
        'sentence_ms': 'Lalu aku bergegas pergi kepada abang sulungku di sana di rumah seberang.',
        'sentence_en': 'Then I quickly went to my oldest brother over yonder in the house across.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 118)'
    },
    {
        'headword': 'pitu',
        'ipa': '/pi.tu/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'ke sini',
        'def_en': 'to here, hither (deictic adverb of directed motion)',
        'sentence_bj': "Aku tu bau teko pitu eng-Kuta' Belud.",
        'highlight': 'pitu',
        'sentence_ms': 'Saya ini baru sahaja sampai ke sini di Kota Belud.',
        'sentence_en': 'I have just arrived here in Kota Belud.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 120)'
    },
    {
        'headword': 'pe',
        'ipa': '/pe/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'ke sana',
        'def_en': 'to there, thither (deictic adverb of directed motion)',
        'sentence_bj': "Somo-somo gai s-in-oo' moo endo pe ta' ruma' emma'=ni.",
        'highlight': 'pe',
        'sentence_ms': 'Bersama-sama mereka disuruh membawa isteri ke sana ke rumah bapa mereka.',
        'sentence_en': "Together they were ordered to bring their wives there to their father's house.",
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 120)'
    },
    {
        'headword': 'andang',
        'ipa': '/an.daŋ/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'sememangnya, semestinya, lazimnya, secara semula jadi',
        'def_en': 'certainly, inherently, naturally (sentence adverb)',
        'sentence_bj': 'Andang no tabiat-ni bege sejak dau lagi.',
        'highlight': 'andang',
        'sentence_ms': 'Sememangnya sudah menjadi tabiatnya begitu sejak dahulu lagi.',
        'sentence_en': 'It has certainly been his nature like that since long ago.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 353)'
    },
    {
        'headword': 'patut',
        'ipa': '/pa.tut/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'patutlah, padanlah (menandakan kesimpulan logik)',
        'def_en': 'no wonder, rightly so (sentence adverb)',
        'sentence_bj': "Patut no iyo nya' teko, ruun kerjo-ni.",
        'highlight': 'patut',
        'sentence_ms': 'Patutlah dia tidak datang, ada kerjanya.',
        'sentence_en': 'No wonder he did not come, he had work to do.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 352)'
    },
    {
        'headword': 'kadang-kadang',
        'ipa': '/ka.daŋ.ka.daŋ/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'kadang-kadang, ada kalanya',
        'def_en': 'sometimes, on occasion (adverb of frequency)',
        'sentence_bj': "Kadang-kadang iyo teko pitu ng-enda' kami.",
        'highlight': 'kadang-kadang',
        'sentence_ms': 'Kadang-kadang dia datang ke sini melihat kami.',
        'sentence_en': 'Sometimes he comes here to visit us.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 348)'
    },
    {
        'headword': 'mendangai',
        'ipa': '/mən.da.ŋaj/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'berapa kali',
        'def_en': 'how many times (frequentative adverb)',
        'sentence_bj': "Mendangai no ko boi ng-enda' wayang e?",
        'highlight': 'mendangai',
        'sentence_ms': 'Berapa kalikah kamu sudah menonton wayang itu?',
        'sentence_en': 'How many times have you watched that movie?',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 349)'
    },
    {
        'headword': 'bangi dilaw',
        'ipa': '/ba.ŋi di.law/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'kelmarin dulu, dua hari yang lalu',
        'def_en': 'the day before yesterday (adverb of time)',
        'sentence_bj': "Bangi dilaw iyo boi mule' pitu.",
        'highlight': 'bangi dilaw',
        'sentence_ms': 'Kelmarin dulu dia sudah pulang ke sini.',
        'sentence_en': 'He returned here the day before yesterday.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 351)'
    },
    {
        'headword': "suang dikau'",
        'ipa': '/su.aŋ di.kawʔ/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'lusa, hari selepas esok',
        'def_en': 'the day after tomorrow (adverb of time)',
        'sentence_bj': "Suang dikau' no kiti ketemu balik ta' Kuta' Belud.",
        'highlight': "suang dikau'",
        'sentence_ms': 'Lusa barulah kita berjumpa lagi di Kota Belud.',
        'sentence_en': 'The day after tomorrow we will meet again in Kota Belud.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 351)'
    },
    {
        'headword': 'langa ellaw',
        'ipa': '/la.ŋa əl.law/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'tengah hari, waktu tengah hari',
        'def_en': 'midday, noon (adverb of time)',
        'sentence_bj': 'Panas bana langa ellaw tu.',
        'highlight': 'langa ellaw',
        'sentence_ms': 'Sangat panas waktu tengah hari ini.',
        'sentence_en': 'It is very hot this midday.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 352)'
    },
    {
        'headword': 'mungkin',
        'ipa': '/muŋ.kin/',
        'pos': 'KATA KETERANGAN',
        'def_ms': 'mungkin, barangkali',
        'def_en': 'maybe, perhaps (sentence adverb of certainty)',
        'sentence_bj': 'Mungkin Tuhan ingin me-kito-on ke-kuasa-an=ni.',
        'highlight': 'mungkin',
        'sentence_ms': 'Mungkin Tuhan hendak memperlihatkan kekuasaan-Nya.',
        'sentence_en': 'Perhaps God wanted to show His power.',
        'source_desc': 'Penerbitan Linguistik (A Grammar of West Coast Bajau, hlm. 353)'
    },
]

inserted_count = 0
for adv in new_adverbs:
    # Check if already exists
    existing = c.execute("SELECT id FROM entries WHERE headword = ?", (adv['headword'],)).fetchone()
    if existing:
        print(f"Entry '{adv['headword']}' already exists (#{existing[0]}), skipping insert.")
        continue

    norm = normalize_query(adv['headword'])
    c.execute(
        "INSERT INTO entries (headword, search_normalized, part_of_speech, ipa) VALUES (?, ?, ?, ?)",
        (adv['headword'], norm, adv['pos'], adv['ipa'])
    )
    entry_id = c.lastrowid

    # Insert sense
    c.execute(
        "INSERT INTO senses (entry_id, order_index, definition_ms, definition_en) VALUES (?, 1, ?, ?)",
        (entry_id, adv['def_ms'], adv['def_en'])
    )
    sense_id = c.lastrowid

    # Insert example
    c.execute(
        "INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en) VALUES (?, ?, ?, ?, ?)",
        (sense_id, adv['sentence_bj'], adv['highlight'], adv['sentence_ms'], adv['sentence_en'])
    )

    # Insert source
    c.execute(
        "INSERT INTO sources (entry_id, source_type, description, verified_by) VALUES (?, 'Buku / Bahan Bertulis', ?, 'Penyelidikan Linguistik (Mark T. Miller, 2007)')",
        (entry_id, adv['source_desc'])
    )

    inserted_count += 1
    print(f"Inserted new entry #{entry_id}: '{adv['headword']}' ({adv['pos']})")

conn.commit()
conn.close()

print(f"\nAll operations complete. Successfully inserted {inserted_count} new adverb entries.")
