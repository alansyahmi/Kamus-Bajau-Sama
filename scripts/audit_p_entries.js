const Database = require('better-sqlite3');
const db = new Database('dictionary.db');

// Let's examine reference A-N entries that were edited
const refSample = db.prepare(`
  SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.definition_ms, s.definition_en
  FROM entries e
  LEFT JOIN senses s ON s.entry_id = e.id
  WHERE e.headword IN ('mangan', 'tilau', 'anak', 'dendo', 'lella', 'betong', 'kiti')
`).all();

console.log('--- USER REFERENCE CONVENTIONS (A-N) ---');
console.table(refSample);

// Find issues in P entries:
// 1. English words in definition_ms (e.g. "fence", "frog")
// 2. Non-standard characters or spellings in headword
// 3. Definitions having commas/literal artifacts like "(harfiah)"
// 4. Missing or improper IPA
const pEntries = db.prepare(`
  SELECT e.id, e.headword, e.part_of_speech, e.ipa, s.id as sense_id, s.definition_ms, s.definition_en
  FROM entries e
  LEFT JOIN senses s ON s.entry_id = e.id
  WHERE e.headword GLOB '[pP]*'
  ORDER BY e.headword ASC
`).all();

const issues = [];
pEntries.forEach(entry => {
  const defMs = entry.definition_ms || '';
  const defEn = entry.definition_en || '';
  const hw = entry.headword;
  
  const flagged = [];

  // Check if definition_ms is English (same as defEn, or known English word)
  if (defMs.toLowerCase() === defEn.toLowerCase() && defMs !== '') {
    flagged.push(`definition_ms is English copy: "${defMs}"`);
  }
  
  // Check for raw unedited English words in definition_ms
  const commonEnglish = ['fence', 'frog', 'to ', 'the ', 'a ', 'of ', 'and ', 'with ', 'for ', 'small ', 'large ', 'kind of ', 'species of ', 'type of '];
  if (commonEnglish.some(w => defMs.toLowerCase().includes(w))) {
    flagged.push(`definition_ms contains English: "${defMs}"`);
  }

  // Non-standard headword characters or patterns
  if (/[0-9_]/.test(hw)) {
    flagged.push(`headword has numbers/underscores: "${hw}"`);
  }
  if (hw.includes('  ')) {
    flagged.push(`headword has multiple spaces: "${hw}"`);
  }
  // Check glottal convention: does it use ' or ’ or ʔ?
  if (/[’`]/.test(hw)) {
    flagged.push(`headword uses curly apostrophe: "${hw}"`);
  }

  // Double check if definition_ms is empty
  if (!defMs.trim()) {
    flagged.push('empty definition_ms');
  }

  if (flagged.length > 0) {
    issues.push({
      id: entry.id,
      headword: hw,
      pos: entry.part_of_speech,
      defMs,
      defEn,
      reasons: flagged
    });
  }
});

console.log(`\nFound ${issues.length} flagged P entries out of ${pEntries.length}:`);
console.table(issues);

db.close();
