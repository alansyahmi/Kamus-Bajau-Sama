const Database = require("better-sqlite3");
const db = new Database("dictionary.db");

const badAffixes = db.prepare(`
  SELECT a.id, a.entry_id, a.term, a.meaning_ms, a.meaning_en, e.headword 
  FROM affixes a 
  JOIN entries e ON a.entry_id = e.id 
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) = 'p'
    AND (a.meaning_ms LIKE '%frog%' 
      OR a.meaning_ms LIKE '%fence%' 
      OR a.meaning_ms LIKE '%censer%' 
      OR a.meaning_ms LIKE '%currency%'
      OR a.meaning_ms LIKE '%swatter%'
      OR a.meaning_ms LIKE '%chopper%'
      OR a.meaning_ms LIKE '%container%'
      OR a.meaning_ms LIKE '%handle%'
      OR a.term LIKE '%-%')
`).all();

console.log("Bad affixes for P count:", badAffixes.length);
console.log(JSON.stringify(badAffixes, null, 2));
