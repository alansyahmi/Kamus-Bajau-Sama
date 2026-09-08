const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dictionary.db');
const backupPath = path.join(__dirname, '..', 'backups', `dictionary_pre_pos_reclass_${Date.now()}.db`);

// 1. Create safety backup
if (!fs.existsSync(path.join(__dirname, '..', 'backups'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'backups'), { recursive: true });
}
fs.copyFileSync(dbPath, backupPath);
console.log(`Safety backup created at: ${backupPath}`);

const db = new Database(dbPath);

// Precise reclassification map by ID and headword
const updates = [
  // --- KATA NAFI (KOTO GEGA) ---
  { id: 19100, headword: 'enggai', newPos: 'KATA NAFI', reason: 'tidak, bukan' },
  { id: 19368, headword: "nya'", newPos: 'KATA NAFI', reason: 'tidak' },
  { id: 19369, headword: 'nyaun', newPos: 'KATA NAFI', reason: 'tiada, tidak ada' },

  // --- KATA BANTU (KOTO TABANG) ---
  { id: 19030, headword: 'boi', newPos: 'KATA BANTU', reason: 'dah, sudah' },
  { id: 19031, headword: 'boi-boi', newPos: 'KATA BANTU', reason: 'pernah' },
  { id: 18978, headword: 'bai', newPos: 'KATA BANTU', reason: 'sudah, siap' },
  { id: 19149, headword: 'kakal', newPos: 'KATA BANTU', reason: 'kekal, masih' },
  { id: 19208, headword: 'koso', newPos: 'KATA BANTU', reason: 'akan' },
  { id: 19229, headword: 'lagi', newPos: 'KATA BANTU', reason: 'lagi' },
  { id: 19293, headword: 'masi', newPos: 'KATA BANTU', reason: 'masih' },
  { id: 19484, headword: 'perlu', newPos: 'KATA BANTU', reason: 'mesti, perlu' },
  { id: 18967, headword: 'arus', newPos: 'KATA BANTU', reason: 'harus' },

  // --- KATA PENEGAS / PARTIKEL (KOTO PENEGAS) ---
  { id: 19076, headword: "do'", newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'penegas perintah' },
  { id: 19142, headword: 'jo', newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'ja, saja, sahaja' },
  { id: 19205, headword: "kono'", newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'konon' },
  { id: 19308, headword: 'mimang', newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'memang' },
  { id: 19390, headword: 'pala', newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'pula' },
  { id: 19395, headword: 'pan', newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'pun, juga' },
  { id: 19522, headword: 'sab', newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'juga' },
  { id: 19602, headword: "té'", newPos: 'KATA PENEGAS (PARTIKEL)', reason: 'partikel penegas' },

  // --- KATA TANYA (KOTO TILAU) ---
  { id: 19055, headword: 'dangai', newPos: 'KATA TANYA', reason: 'berapa' },
  { id: 19101, headword: 'enggo', newPos: 'KATA TANYA', reason: 'mana satu' },
  { id: 19309, headword: 'minggo', newPos: 'KATA TANYA', reason: 'mana, di mana' },
  { id: 19493, headword: 'pian', newPos: 'KATA TANYA', reason: 'bagaimana' },

  // --- KATA GANTI NAMA TANYA (KOTO GANTI ORON TILAU) ---
  { id: 18965, headword: 'anu', newPos: 'KATA GANTI NAMA TANYA', reason: 'apa' },
  { id: 19134, headword: 'ian', newPos: 'KATA GANTI NAMA TANYA', reason: 'apa' },
  { id: 19560, headword: 'siano', newPos: 'KATA GANTI NAMA TANYA', reason: 'apa; siapa' },

  // --- KATA GANTI NAMA TUNJUK (KOTO GANTI ORON TUNDUK) ---
  { id: 19128, headword: 'itetu', newPos: 'KATA GANTI NAMA TUNJUK', reason: 'ini' },
  { id: 19129, headword: 'itu', newPos: 'KATA GANTI NAMA TUNJUK', reason: 'ini' },
  { id: 19653, headword: 'tu', newPos: 'KATA GANTI NAMA TUNJUK', reason: 'ini' },

  // --- PENJODOH BILANGAN (PENJODO BILANGAN) ---
  { id: 19156, headword: "kau'", newPos: 'PENJODOH BILANGAN', reason: 'kata penggolong haiwan/objek' },

  // --- KATA ARAH (KOTO BANTING) ---
  { id: 19069, headword: 'diam', newPos: 'KATA ARAH', reason: 'dalam' },
  { id: 19140, headword: "jata'", newPos: 'KATA ARAH', reason: 'atas / above' },
  { id: 19068, headword: "dia'", newPos: 'KATA ARAH', reason: 'bawah' },

  // --- KATA KETERANGAN (KOTO KETELAKAN) ---
  { id: 18979, headword: 'balik', newPos: 'KATA KETERANGAN', reason: 'lagi, sekali lagi' },
  { id: 19014, headword: 'begé', newPos: 'KATA KETERANGAN', reason: 'begitu' },
  { id: 19060, headword: 'dau-dau', newPos: 'KATA KETERANGAN', reason: 'dulu-dulu' },
  { id: 19073, headword: 'dilau', newPos: 'KATA KETERANGAN', reason: 'semalam' },
  { id: 19115, headword: 'gorot', newPos: 'KATA KETERANGAN', reason: 'kerap' },
  { id: 19145, headword: 'kaang', newPos: 'KATA KETERANGAN', reason: 'karang, nanti, kelak' },
  { id: 19295, headword: 'maung', newPos: 'KATA KETERANGAN', reason: 'esok' },
  { id: 19319, headword: "muda'-mudaan", newPos: 'KATA KETERANGAN', reason: 'mudah-mudahan' },
  { id: 19565, headword: "sini'", newPos: 'KATA KETERANGAN', reason: 'earlier, tadi' },
  { id: 19615, headword: 'telampau', newPos: 'KATA KETERANGAN', reason: 'terlalu, sangat, terlampau' },
  { id: 18980, headword: 'bana', newPos: 'KATA KETERANGAN', reason: 'terlalu, sangat, (kiasan) benar' },

  // --- KATA SENDI NAMA (KOTO SENDI ORON) ---
  { id: 19098, headword: 'em-', newPos: 'KATA SENDI NAMA', reason: 'kata depan lokatif: di' },
  { id: 20421, headword: "ta'", newPos: 'KATA SENDI NAMA', reason: 'kata depan lokatif: di' },
  { id: 19077, headword: "doko'", newPos: 'KATA SENDI NAMA', reason: 'macam, seperti' },
  { id: 19078, headword: 'dokon', newPos: 'KATA SENDI NAMA', reason: 'macam, seperti' },

  // --- KATA HUBUNG (KOTO UBUNG) ---
  { id: 19582, headword: 'supaya', newPos: 'KATA HUBUNG', reason: 'supaya' },

  // --- KATA KERJA PASIF (KOTO KERJO PASIP) ---
  { id: 19025, headword: 'binoo', newPos: 'KATA KERJA PASIF', reason: 'dibawa' },
  { id: 19262, headword: 'lingkapan', newPos: 'KATA KERJA PASIF', reason: 'ditutupi, diselimuti' },
  { id: 19377, headword: "pinelua'", newPos: 'KATA KERJA PASIF', reason: 'dikeluarkan, dilepaskan' },
  { id: 19497, headword: "pinene'", newPos: 'KATA KERJA PASIF', reason: 'dipilih' },
  { id: 19378, headword: 'pineteko', newPos: 'KATA KERJA PASIF', reason: 'disampaikan, dihantar' },
  { id: 19498, headword: 'pinisak-pisak', newPos: 'KATA KERJA PASIF', reason: 'dihancurkan berulang kali' },
  { id: 19627, headword: "tepelema'", newPos: 'KATA KERJA PASIF', reason: 'dilembutkan' },
  { id: 19638, headword: 'tinawar', newPos: 'KATA KERJA PASIF', reason: 'ditawar' },
  { id: 19644, headword: 'tinombol', newPos: 'KATA KERJA PASIF', reason: 'ditutup' },

  // --- KATA NAMA KHAS (KOTO ORON AS) ---
  { id: 20411, headword: 'Benadan', newPos: 'KATA NAMA KHAS', reason: '(bangsa, etnik) Ubian' },
  { id: 20414, headword: 'Gipun', newPos: 'KATA NAMA KHAS', reason: 'Jepun' },

  // --- PEMBETULAN KATEGORI LEPASAN IMPORT ---
  { id: 18983, headword: 'bangi', newPos: 'KATA NAMA', reason: 'hari' },
  { id: 19563, headword: 'sin', newPos: 'KATA NAMA', reason: 'duit / money' },
  { id: 18990, headword: 'bebagalan', newPos: 'KATA SIFAT', reason: 'berbesaran' },
  { id: 18992, headword: 'bebuusan', newPos: 'KATA KERJA', reason: 'bertumpahan' },
  { id: 19258, headword: 'limpasan', newPos: 'KATA KERJA', reason: 'berlaluan' },
  { id: 19333, headword: 'ngejomo', newPos: 'KATA KERJA', reason: 'meneman' },
  { id: 19020, headword: 'beranti', newPos: 'KATA KERJA', reason: 'berhenti' },
  { id: 19348, headword: 'ngerati', newPos: 'KATA KERJA', reason: 'tahu, kenal' },
  { id: 19675, headword: 'uun', newPos: 'KATA KERJA', reason: 'ada, wujud' },
  { id: 19613, headword: 'teketa', newPos: 'KATA KERJA', reason: 'terlintas' },
  { id: 18963, headword: 'angguk-angguk', newPos: 'KATA KERJA', reason: 'angguk kepala' },
  { id: 19169, headword: 'kedam-kedam', newPos: 'KATA KERJA', reason: 'buka dan' },
  { id: 19254, headword: 'limbo', newPos: 'KATA SIFAT', reason: 'lemas' },
  { id: 19581, headword: 'sukup', newPos: 'KATA SIFAT', reason: 'cukup' },
];

console.log(`Applying ${updates.length} POS reclassifications...`);

const updateStmt = db.prepare('UPDATE entries SET part_of_speech = ? WHERE id = ?');

const transaction = db.transaction(() => {
  for (const item of updates) {
    const current = db.prepare('SELECT part_of_speech FROM entries WHERE id = ?').get(item.id);
    if (current) {
      updateStmt.run(item.newPos, item.id);
      console.log(`[UPDATED] #${item.id} "${item.headword}": ${current.part_of_speech} -> ${item.newPos} (${item.reason})`);
    } else {
      console.warn(`[WARN] Entry #${item.id} "${item.headword}" not found!`);
    }
  }
});

transaction();

console.log('Finished applying POS reclassifications.');

// Print new breakdown
console.log('\n=== NEW POS BREAKDOWN IN dictionary.db ===');
const breakdown = db.prepare('SELECT part_of_speech, count(*) as count FROM entries GROUP BY part_of_speech ORDER BY count DESC').all();
console.table(breakdown);
