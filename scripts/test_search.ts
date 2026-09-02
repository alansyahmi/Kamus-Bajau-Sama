import { searchEntries, getEntryByHeadword, getAllHeadwords } from '../src/lib/search/searchService';

async function test() {
  console.log('Testing Search Engine with real SQLite Database...');
  
  const testQueries = ['mangan', 'tilau', 'kinakan', 'sinsim', 'alap', 'kerabaw', 'air', 'makan', 'bapa', 'anjing'];
  
  for (const q of testQueries) {
    const results = await searchEntries(q, 3);
    console.log(`\nQuery: "${q}" -> ${results.length} results`);
    for (const r of results) {
      console.log(`  [${r.matchType}] ${r.headword} (${r.partOfSpeech}) -> MS: ${r.definitionMs} | EN: ${r.definitionEn}`);
    }
  }

  console.log('\nTesting complete entry lookup for "mangan":');
  const mangan = await getEntryByHeadword('mangan');
  if (mangan) {
    console.log(`Headword: ${mangan.headword} (IPA: ${mangan.ipa})`);
    console.log(`Definitions: ${mangan.senses.map(s => s.definitionMs).join(', ')}`);
    console.log(`Affixes (${mangan.affixes.length}): ${mangan.affixes.map(a => a.term).join(', ')}`);
    console.log(`Examples (${mangan.senses[0]?.examples.length || 0}):`);
    mangan.senses[0]?.examples.forEach(ex => {
      console.log(`  - ${ex.sentenceBajau} => "${ex.sentenceEn}"`);
    });
    console.log(`Sources: ${mangan.sources.map(s => s.description).join('; ')}`);
  }

  const allHw = await getAllHeadwords();
  console.log(`\nTotal headwords in DB index: ${allHw.length}`);
}

test().catch(console.error);
