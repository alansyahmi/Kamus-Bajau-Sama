const Database = require("better-sqlite3");
const db = new Database("dictionary.db");

// Let's inspect A-Ny entries across various dimensions:
// 1. Orthography: apostrophes, hyphens, accents (é?), double letters
console.log("=== CHECKING A-Ny ORTHOGRAPHY ===");

const glottalInANy = db.prepare(`
  SELECT headword, ipa FROM entries 
  WHERE LOWER(SUBSTR(headword, 1, 1)) != 'p' AND (headword LIKE '%''%' OR headword LIKE '%ʔ%' OR headword LIKE '%’%')
  LIMIT 15
`).all();
console.log("Glottal in A-Ny:", glottalInANy);

const accentsInANy = db.prepare(`
  SELECT headword, ipa FROM entries 
  WHERE LOWER(SUBSTR(headword, 1, 1)) != 'p' AND (headword LIKE '%é%' OR headword LIKE '%è%')
`).all();
console.log("Accents in A-Ny:", accentsInANy);

// 2. POS tagging in A-Ny
const posList = db.prepare(`
  SELECT DISTINCT part_of_speech, count(*) as count
  FROM entries
  WHERE LOWER(SUBSTR(headword, 1, 1)) != 'p'
  GROUP BY part_of_speech
  ORDER BY count DESC
`).all();
console.log("\nPOS in A-Ny:", posList);

// 3. Definitions style in A-Ny:
// Let's see some verbs, nouns, adjectives in A-Ny
const verbs = db.prepare(`
  SELECT e.headword, s.definition_ms, s.definition_en
  FROM entries e JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) != 'p' AND e.part_of_speech = 'KATA KERJA'
  LIMIT 15
`).all();
console.log("\nSample Verbs in A-Ny:");
console.log(verbs);

const nouns = db.prepare(`
  SELECT e.headword, s.definition_ms, s.definition_en
  FROM entries e JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) != 'p' AND e.part_of_speech = 'KATA NAMA'
  LIMIT 15
`).all();
console.log("\nSample Nouns in A-Ny:");
console.log(nouns);

const adjs = db.prepare(`
  SELECT e.headword, s.definition_ms, s.definition_en
  FROM entries e JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) != 'p' AND e.part_of_speech = 'KATA SIFAT'
  LIMIT 15
`).all();
console.log("\nSample Adjectives in A-Ny:");
console.log(adjs);
