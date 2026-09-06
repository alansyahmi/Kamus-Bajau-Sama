const Database = require("better-sqlite3");
const db = new Database("dictionary.db");

console.log("=== VERIFYING P ENTRIES IN DATABASE ===");

const sampleWords = ["pulé'", "puté'", "pegontor", "pak", "pagar", "pengayam", "peturi", "pikiran"];

sampleWords.forEach(hw => {
  const row = db.prepare(`
    SELECT e.id, e.headword, e.search_normalized, e.part_of_speech, e.ipa, s.definition_ms, s.definition_en
    FROM entries e
    JOIN senses s ON e.id = s.entry_id
    WHERE e.headword = ?
  `).get(hw);
  
  if (row) {
    console.log(`✅ [${row.part_of_speech}] ${row.headword} (norm: ${row.search_normalized}, IPA: ${row.ipa})`);
    console.log(`   MS: "${row.definition_ms}" | EN: "${row.definition_en}"`);
  } else {
    console.log(`❌ NOT FOUND: ${hw}`);
  }
});

// Also test searching by normalized term
console.log("\n=== TEST NORMALIZED SEARCH ===");
["pule", "pute", "pegontor", "pak", "pagar"].forEach(term => {
  const matches = db.prepare(`
    SELECT e.headword, e.search_normalized, s.definition_ms
    FROM entries e
    JOIN senses s ON e.id = s.entry_id
    WHERE e.search_normalized = ?
  `).all(term);
  console.log(`Query "${term}" -> ${matches.length} matches:`, matches.map(m => `${m.headword} ("${m.definition_ms}")`));
});
