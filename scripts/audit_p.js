const Database = require("better-sqlite3");
const fs = require("fs");

const db = new Database("dictionary.db");

// Look at how entries A-Ny look like in terms of pos, definitions, headwords
const sampleANy = db.prepare(`
  SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.definition_ms, s.definition_en
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) != 'p'
  ORDER BY RANDOM()
  LIMIT 25
`).all();

console.log("=== SAMPLE A-Ny ENTRIES ===");
sampleANy.forEach(e => {
  console.log(`[${e.part_of_speech || 'N/A'}] ${e.headword} (${e.ipa || '-'}) -> MS: "${e.definition_ms}" | EN: "${e.definition_en}"`);
});

// Let's also inspect how definitions are phrased across A-Ny
// POS breakdown in A-Ny
const posBreakdown = db.prepare(`
  SELECT part_of_speech, count(*) as c
  FROM entries
  WHERE LOWER(SUBSTR(headword, 1, 1)) != 'p'
  GROUP BY part_of_speech
  ORDER BY c DESC
`).all();
console.log("\n=== POS Breakdown in A-Ny ===");
console.log(posBreakdown);

// Fetch all P entries
const pEntries = db.prepare(`
  SELECT e.id, e.headword, e.search_normalized, e.part_of_speech, e.ipa, s.id as sense_id, s.definition_ms, s.definition_en
  FROM entries e
  LEFT JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) = 'p'
  ORDER BY LOWER(e.headword) ASC
`).all();

console.log("\nTotal P entries:", pEntries.length);
fs.writeFileSync("scripts/all_p_detailed.json", JSON.stringify(pEntries, null, 2), "utf8");
console.log("Wrote scripts/all_p_detailed.json");
