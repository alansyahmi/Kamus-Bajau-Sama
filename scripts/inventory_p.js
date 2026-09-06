const Database = require("better-sqlite3");
const fs = require("fs");
const db = new Database("dictionary.db");

// Let's get all P entries with all their fields:
// id, headword, search_normalized, part_of_speech, ipa, sense_id, definition_ms, definition_en, example count
const pRows = db.prepare(`
  SELECT 
    e.id as entry_id,
    e.headword,
    e.search_normalized,
    e.part_of_speech,
    e.ipa,
    s.id as sense_id,
    s.definition_ms,
    s.definition_en,
    (SELECT COUNT(*) FROM examples ex WHERE ex.sense_id = s.id) as example_count
  FROM entries e
  LEFT JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) = 'p'
  ORDER BY e.id ASC
`).all();

console.log(`Loaded ${pRows.length} P sense rows.`);

// Let's check which entries have multiple senses
const entrySenseCount = {};
pRows.forEach(r => {
  entrySenseCount[r.entry_id] = (entrySenseCount[r.entry_id] || 0) + 1;
});

// Let's print out all rows categorized
const output = [];
pRows.forEach(r => {
  output.push({
    id: r.entry_id,
    sense_id: r.sense_id,
    headword: r.headword,
    normalized: r.search_normalized,
    pos: r.part_of_speech,
    ipa: r.ipa,
    definition_ms: r.definition_ms,
    definition_en: r.definition_en,
    examples: r.example_count
  });
});

fs.writeFileSync("scripts/p_entries_inventory.json", JSON.stringify(output, null, 2), "utf8");
console.log("Written scripts/p_entries_inventory.json");
