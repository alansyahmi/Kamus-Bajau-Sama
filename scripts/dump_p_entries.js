const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('dictionary.db');

const pList = db.prepare(`
  SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.id as sense_id, s.definition_ms, s.definition_en
  FROM entries e
  LEFT JOIN senses s ON s.entry_id = e.id
  WHERE e.headword GLOB '[pP]*'
  ORDER BY e.headword ASC
`).all();

let output = '';
pList.forEach((e, i) => {
  output += `${i + 1}. ID: ${e.id} | Headword: [${e.headword}] | POS: [${e.part_of_speech}] | IPA: [${e.ipa || ''}]\n   MS: "${e.definition_ms}"\n   EN: "${e.definition_en}"\n\n`;
});

fs.writeFileSync('all_p_entries.txt', output);
console.log(`Exported ${pList.length} P entries to all_p_entries.txt`);
db.close();
