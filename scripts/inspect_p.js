const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database('dictionary.db');

// Sample entries from A to N to understand standard formatting
const sampleAN = db.prepare(`
  SELECT e.id, e.headword, e.search_normalized, e.part_of_speech, e.ipa,
         s.definition_ms, s.definition_en
  FROM entries e
  LEFT JOIN senses s ON s.entry_id = e.id
  WHERE e.headword GLOB '[a-nA-N]*'
  ORDER BY e.headword ASC
`).all();

// All P entries
const pEntries = db.prepare(`
  SELECT e.id, e.headword, e.search_normalized, e.part_of_speech, e.ipa,
         s.id as sense_id, s.definition_ms, s.definition_en
  FROM entries e
  LEFT JOIN senses s ON s.entry_id = e.id
  WHERE e.headword GLOB '[pP]*'
  ORDER BY e.headword ASC
`).all();

console.log(`Total A-N reference entries: ${sampleAN.length}`);
console.log(`Total P entries: ${pEntries.length}`);

fs.writeFileSync('scratch_p_entries.json', JSON.stringify({
  pCount: pEntries.length,
  pEntries,
  referenceSample: sampleAN.slice(0, 40)
}, null, 2));

console.log('Saved data to scratch_p_entries.json');
db.close();
