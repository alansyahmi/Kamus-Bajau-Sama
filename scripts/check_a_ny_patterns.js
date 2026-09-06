const Database = require("better-sqlite3");
const db = new Database("dictionary.db");

const hyphenatedANy = db.prepare(`
  SELECT e.headword, e.part_of_speech, s.definition_ms, s.definition_en
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) != 'p' AND e.headword LIKE '%-%'
`).all();

console.log("Hyphenated in A-Ny count:", hyphenatedANy.length);
console.log(JSON.stringify(hyphenatedANy, null, 2));

// Let's also check if any A-Ny entries have prefixes like 'be', 'ke', 'te', 'm', 'n'
const prefixesInANy = db.prepare(`
  SELECT e.headword, e.part_of_speech, s.definition_ms
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE (e.headword LIKE 'be%' OR e.headword LIKE 'te%' OR e.headword LIKE 'ke%' OR e.headword LIKE 'me%')
    AND LOWER(SUBSTR(e.headword, 1, 1)) != 'p'
  LIMIT 25
`).all();
console.log("\nSample prefixed entries in A-Ny:");
console.log(prefixesInANy);
