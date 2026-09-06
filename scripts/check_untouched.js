const fs = require("fs");
const db = require("better-sqlite3")("dictionary.db");
const corrections = JSON.parse(fs.readFileSync("scripts/proposed_p_corrections.json", "utf8"));

const untouched = db.prepare(`
  SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.definition_ms, s.definition_en
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) = 'p'
`).all().filter(e => !corrections[e.id]);

console.log("Untouched count:", untouched.length);
untouched.forEach(u => {
  console.log(`[${u.id}] ${u.headword} (${u.part_of_speech}) -> MS: "${u.definition_ms}" | EN: "${u.definition_en}"`);
});
