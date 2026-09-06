const Database = require("better-sqlite3");
const db = new Database("dictionary.db");

const affixes = db.prepare(`
  SELECT e.id, e.headword, e.part_of_speech, s.definition_ms, s.definition_en
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE e.headword LIKE '%-%'
     OR e.part_of_speech = 'KATA TUGAS / PARTIKEL'
  ORDER BY e.headword ASC
`).all();

console.log("Affix / particle entries in database:");
affixes.forEach(a => {
  console.log(`[${a.headword}] (${a.part_of_speech}) MS: "${a.definition_ms}" | EN: "${a.definition_en}"`);
});
