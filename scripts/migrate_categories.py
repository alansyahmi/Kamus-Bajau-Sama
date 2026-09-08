import sqlite3
import re

def migrate():
    conn = sqlite3.connect('dictionary.db')
    c = conn.cursor()

    # 1. Create categories table
    c.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ms TEXT NOT NULL,
        name_en TEXT,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT
    )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug)')

    # 2. Create entry_categories junction table
    c.execute('''
    CREATE TABLE IF NOT EXISTS entry_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
    )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS entry_categories_entry_id_idx ON entry_categories(entry_id)')
    c.execute('CREATE INDEX IF NOT EXISTS entry_categories_category_id_idx ON entry_categories(category_id)')

    # 3. Seed standard Bajau Sama thematic categories
    seed_cats = [
        ('Anggota Badan', 'Human Body Parts', 'anggota-badan', 'Bahagian tubuh badan manusia dalam bahasa Bajau Sama.', '👤'),
        ('Arah & Ruang', 'Directives & Spatial Terms', 'arah-ruang', 'Istilah arah, kedudukan relatif, dan hubungan ruang.', '🧭'),
        ('Haiwan & Hidupan', 'Animals & Wildlife', 'haiwan', 'Haiwan ternakan, hidupan laut, serangga dan fauna.', '🐾'),
        ('Tumbuhan & Alam', 'Plants & Nature', 'tumbuhan-alam', 'Flora, tumbuh-tumbuhan, cuaca dan unsur alam semula jadi.', '🌿'),
        ('Kekerabatan & Hubungan', 'Kinship & Family', 'kekerabatan', 'Istilah sapaan, pertalian darah, dan hubungan kekeluargaan.', '👨‍👩‍👧'),
        ('Makanan & Masakan', 'Food & Cooking', 'makanan-masakan', 'Makanan tradisi, ramuan, dan proses memasak.', '🍲'),
        ('Budaya, Tradisi & Kraf', 'Culture, Traditions & Crafts', 'budaya-tradisi', 'Warisan kesenian, pakaian, senjata, dan kraftangan Sama.', '🧵'),
        ('Nombor & Bilangan', 'Numbers & Quantifiers', 'nombor-bilangan', 'Sistem nombor asas, angka, dan kata penjodoh bilangan.', '🔢'),
        ('Warna & Sifat', 'Colors & Qualities', 'warna-sifat', 'Karakteristik visual, warna, dan kata sifat penerang.', '🎨'),
        ('Kehidupan Harian & Rumah', 'Daily Life & Household', 'kehidupan-harian', 'Peralatan rumah, perkakas dapur, dan aktiviti harian.', '🏠')
    ]

    for name_ms, name_en, slug, desc, icon in seed_cats:
        c.execute('''
        INSERT OR IGNORE INTO categories (name_ms, name_en, slug, description, icon)
        VALUES (?, ?, ?, ?, ?)
        ''', (name_ms, name_en, slug, desc, icon))

    conn.commit()

    # Get category ID lookup
    cat_map = dict(c.execute('SELECT slug, id FROM categories').fetchall())

    # 4. Auto-tag known words
    tagged_count = 0

    def tag_word(hw, cat_slug):
        nonlocal tagged_count
        cat_id = cat_map.get(cat_slug)
        if not cat_id:
            return
        entries_found = c.execute('SELECT id FROM entries WHERE LOWER(headword) = ?', (hw.lower(),)).fetchall()
        for (e_id,) in entries_found:
            # check if already tagged
            exists = c.execute('SELECT 1 FROM entry_categories WHERE entry_id = ? AND category_id = ?', (e_id, cat_id)).fetchone()
            if not exists:
                c.execute('INSERT INTO entry_categories (entry_id, category_id) VALUES (?, ?)', (e_id, cat_id))
                tagged_count += 1

    # Arah & Ruang (Directives & Spatial)
    spatial_roots = [
        'diata', "diata'", 'jata', "jata'", 'diom', 'diam', 'dialom', 'lua', "lua'", 'luar',
        'dia', "dia'", 'buli', "buli'", 'bunda', "bunda'", 'sedi', 'kuanan', 'gibang',
        'tenga', "tenga'", 'torong'
    ]
    for (e_id, hw) in c.execute("SELECT id, headword FROM entries").fetchall():
        defs = " ".join([d[0].lower() for d in c.execute("SELECT definition_ms FROM senses WHERE entry_id = ?", (e_id,)).fetchall()])
        if any(hw.lower().startswith(r.replace("'", "")) for r in spatial_roots) or any(term in defs for term in ['sebelah', 'arah', 'hadapan', 'belakang', 'bawah', 'atas', 'dalam', 'luar', 'tengah', 'kanan', 'kiri', 'penjuru']):
            tag_word(hw, 'arah-ruang')

    # Anggota Badan (Body parts)
    for (e_id, hw) in c.execute("SELECT id, headword FROM entries").fetchall():
        defs = " ".join([d[0].lower() for d in c.execute("SELECT definition_ms FROM senses WHERE entry_id = ?", (e_id,)).fetchall()])
        if any(term in defs for term in ['anggota badan', 'bahagian badan', 'tubuh', 'organ', 'tangan', 'mata', 'hidung', 'telinga', 'kaki', 'gigi', 'tulang']):
            tag_word(hw, 'anggota-badan')

    # Haiwan (Animals)
    for (e_id, hw) in c.execute("SELECT id, headword FROM entries").fetchall():
        defs = " ".join([d[0].lower() for d in c.execute("SELECT definition_ms FROM senses WHERE entry_id = ?", (e_id,)).fetchall()])
        if any(term in defs for term in ['sejenis haiwan', 'sejenis burung', 'sejenis ikan', 'sejenis serangga', 'haiwan', 'unggas', 'burung', 'kuda', 'kerbau', 'ayam', 'anjing', 'kucing']):
            tag_word(hw, 'haiwan')

    # Kekerabatan (Kinship)
    kin_words = ['anak', 'dina', "dina'an", 'uma', "uma'", 'indo', "indo'", 'embo', "embo'", 'dendo', 'lella', 'jomo', 'dinaan', 'anak bua', 'anak dinakan']
    for kw in kin_words:
        tag_word(kw, 'kekerabatan')
    for (e_id, hw) in c.execute("SELECT id, headword FROM entries").fetchall():
        defs = " ".join([d[0].lower() for d in c.execute("SELECT definition_ms FROM senses WHERE entry_id = ?", (e_id,)).fetchall()])
        if any(term in defs for term in ['saudara', 'keluarga', 'ibu', 'bapa', 'ayah', 'nenek', 'datuk', 'anak', 'sepupu', 'ipar', 'suami', 'isteri']):
            tag_word(hw, 'kekerabatan')

    # Makanan & Masakan (Food)
    for (e_id, hw) in c.execute("SELECT id, headword FROM entries").fetchall():
        defs = " ".join([d[0].lower() for d in c.execute("SELECT definition_ms FROM senses WHERE entry_id = ?", (e_id,)).fetchall()])
        if any(term in defs for term in ['makanan', 'memasak', 'minum', 'hidangan', 'lauk', 'kuih', 'makan', 'minuman']):
            tag_word(hw, 'makanan-masakan')

    # Budaya, Tradisi & Kraf
    culture_words = ['linangkit', 'lepa', 'parang']
    for cw in culture_words:
        tag_word(cw, 'budaya-tradisi')

    conn.commit()

    print("=== Migration Summary ===")
    print(f"Categories in DB: {c.execute('SELECT count(*) FROM categories').fetchone()[0]}")
    print(f"Entry-Category links in DB: {c.execute('SELECT count(*) FROM entry_categories').fetchone()[0]}")
    for cat in c.execute("SELECT c.icon, c.name_ms, count(ec.id) FROM categories c LEFT JOIN entry_categories ec ON c.id = ec.category_id GROUP BY c.id").fetchall():
        print(f"  {cat[0]} {cat[1]}: {cat[2]} perkataan")

    conn.close()

if __name__ == '__main__':
    migrate()
