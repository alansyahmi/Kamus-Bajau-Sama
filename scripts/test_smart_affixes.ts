import { getEntryByHeadword } from '../src/lib/search/searchService';

async function testSmartAffixes() {
  console.log('=== Testing Smart Morphological Linking & Theoretical Forms ===\n');

  // Test 1: Root word 'laa''
  console.log('--- 1. Testing Root Entry: "laa\'" ---');
  const laaEntry = await getEntryByHeadword("laa'");
  if (laaEntry) {
    console.log(`Headword: ${laaEntry.headword} (${laaEntry.partOfSpeech}) -> MS: ${laaEntry.senses[0]?.definitionMs}`);
    console.log('Derived Affixes:');
    for (const af of laaEntry.affixes) {
      const status = af.isAttested ? `[ATTESSED LINK -> /kamus/${af.linkedHeadword}]` : `[THEORETICAL: *${af.term}]`;
      console.log(`  • ${af.term.padEnd(15)} : ${af.meaningMs.padEnd(30)} ${status}`);
    }
  }

  // Test 2: Derived form 'ngelaa''
  console.log('\n--- 2. Testing Derived Entry: "ngelaa\'" ---');
  const ngelaaEntry = await getEntryByHeadword("ngelaa'");
  if (ngelaaEntry) {
    console.log(`Headword: ${ngelaaEntry.headword} (${ngelaaEntry.partOfSpeech}) -> MS: ${ngelaaEntry.senses[0]?.definitionMs}`);
    if (ngelaaEntry.rootEntry) {
      console.log(`  >>> RESOLVED KATA DASAR: [${ngelaaEntry.rootEntry.headword}] (${ngelaaEntry.rootEntry.definitionMs})`);
      console.log(`  >>> Morphological Pattern: ${ngelaaEntry.rootEntry.affixPattern}`);
    } else {
      console.log('  (No root resolved)');
    }
  }

  // Test 3: Root word 'bagi'
  console.log('\n--- 3. Testing Root Entry: "bagi" ---');
  const bagiEntry = await getEntryByHeadword("bagi");
  if (bagiEntry) {
    console.log(`Headword: ${bagiEntry.headword} (${bagiEntry.partOfSpeech}) -> MS: ${bagiEntry.senses[0]?.definitionMs}`);
    console.log('Derived Affixes:');
    for (const af of bagiEntry.affixes) {
      const status = af.isAttested ? `[ATTESSED LINK -> /kamus/${af.linkedHeadword}]` : `[THEORETICAL: *${af.term}]`;
      console.log(`  • ${af.term.padEnd(15)} : ${af.meaningMs.padEnd(30)} ${status}`);
    }
  }

  // Test 4: Root word 'keta'
  console.log('\n--- 4. Testing Root Entry: "keta" ---');
  const ketaEntry = await getEntryByHeadword("keta");
  if (ketaEntry) {
    console.log(`Headword: ${ketaEntry.headword} (${ketaEntry.partOfSpeech}) -> MS: ${ketaEntry.senses[0]?.definitionMs}`);
    console.log('Derived Affixes:');
    for (const af of ketaEntry.affixes) {
      const status = af.isAttested ? `[ATTESSED LINK -> /kamus/${af.linkedHeadword}]` : `[THEORETICAL: *${af.term}]`;
      console.log(`  • ${af.term.padEnd(15)} : ${af.meaningMs.padEnd(30)} ${status}`);
    }
  }
}

testSmartAffixes();
