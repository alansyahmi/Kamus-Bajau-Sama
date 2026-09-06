const Database = require("better-sqlite3");
const fs = require("fs");
const db = new Database("dictionary.db");

const pEntries = db.prepare(`
  SELECT 
    e.id,
    e.headword,
    e.search_normalized,
    e.part_of_speech,
    e.ipa,
    s.id as sense_id,
    s.definition_ms,
    s.definition_en,
    (SELECT GROUP_CONCAT(ex.sentence_bajau || ' === ' || IFNULL(ex.sentence_ms, '') || ' === ' || IFNULL(ex.sentence_en, ''), ' ||| ') 
     FROM examples ex WHERE ex.sense_id = s.id) as examples
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) = 'p'
  ORDER BY LOWER(e.headword) ASC, e.id ASC, s.id ASC
`).all();

console.log("Found " + pEntries.length + " P entries/senses.");

// Write out full report of each entry
let report = "";
pEntries.forEach((e, i) => {
  report += `--------------------------------------------------\n`;
  report += `Index: ${i + 1} | Entry ID: ${e.id} | Sense ID: ${e.sense_id}\n`;
  report += `Headword: ${e.headword} | Normalized: ${e.search_normalized}\n`;
  report += `POS: ${e.part_of_speech} | IPA: ${e.ipa}\n`;
  report += `MS: ${e.definition_ms}\n`;
  report += `EN: ${e.definition_en}\n`;
  if (e.examples) {
    report += `Examples:\n`;
    e.examples.split(" ||| ").forEach(ex => {
      const parts = ex.split(" === ");
      report += `  - Bajau: ${parts[0]}\n    MS: ${parts[1]}\n    EN: ${parts[2]}\n`;
    });
  }
});

fs.writeFileSync("scripts/p_entries_full_audit.txt", report, "utf8");
console.log("Wrote scripts/p_entries_full_audit.txt");
