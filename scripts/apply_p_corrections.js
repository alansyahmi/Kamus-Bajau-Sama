const Database = require("better-sqlite3");
const fs = require("fs");

const db = new Database("dictionary.db");

// Helper to normalize headword
function normalizeBajau(hw) {
  return hw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: é -> e
    .replace(/[^a-z0-9]/g, "");     // strip hyphens, apostrophes
}

const corrections = JSON.parse(fs.readFileSync("scripts/proposed_p_corrections.json", "utf8"));

console.log(`Loaded ${Object.keys(corrections).length} entry corrections.`);

const updateEntryStmt = db.prepare(`
  UPDATE entries 
  SET headword = ?,
      search_normalized = ?,
      part_of_speech = ?,
      ipa = ?,
      updated_at = datetime('now')
  WHERE id = ?
`);

const updateSenseStmt = db.prepare(`
  UPDATE senses
  SET definition_ms = ?,
      definition_en = ?
  WHERE id = ? AND entry_id = ?
`);

const applyCorrections = db.transaction(() => {
  let entriesUpdated = 0;
  let sensesUpdated = 0;

  for (const [entryIdStr, data] of Object.entries(corrections)) {
    const entryId = parseInt(entryIdStr, 10);
    const normalized = normalizeBajau(data.headword);

    updateEntryStmt.run(data.headword, normalized, data.pos, data.ipa, entryId);
    entriesUpdated++;

    for (const s of data.senses) {
      updateSenseStmt.run(s.definition_ms, s.definition_en, s.id, entryId);
      sensesUpdated++;
    }
  }

  // Also clean up affixes with corrupt or hyphenated values
  console.log("Cleaning up affected affixes...");

  // 1. pak (19386)
  db.prepare(`UPDATE affixes SET meaning_ms = 'mempunyai, berkatak', meaning_en = 'having, possessing frog' WHERE entry_id = 19386 AND term = 'bepak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'tempat katak', meaning_en = 'place associated with frog' WHERE entry_id = 19386 AND term = 'pepakan'`).run();

  // 2. pagar (19384)
  db.prepare(`UPDATE affixes SET meaning_ms = 'tempat berpagar, kawasan pagar', meaning_en = 'place associated with fence' WHERE entry_id = 19384 AND term = 'pepagaran'`).run();

  // 3. penebong (19468)
  db.prepare(`UPDATE affixes SET meaning_ms = 'mempunyai parang pemotong', meaning_en = 'possessing a chopper' WHERE entry_id = 19468 AND term = 'bepenebong'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'tempat menebang / memotong', meaning_en = 'place for cutting/chopping' WHERE entry_id = 19468 AND term = 'pepenebongon'`).run();

  // 4. penepak (19469)
  db.prepare(`UPDATE affixes SET meaning_ms = 'mempunyai pemukul / penepuk', meaning_en = 'possessing a swatter' WHERE entry_id = 19469 AND term = 'bepenepak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'tempat menepuk / memukul lalat', meaning_en = 'place for swatting' WHERE entry_id = 19469 AND term = 'pepenepakan'`).run();

  // 5. peng-enda-an -> pengendaan (19470)
  db.prepare(`UPDATE affixes SET term = 'bepengendaan', meaning_ms = 'mempunyai tempat melihat', meaning_en = 'having a place for viewing' WHERE entry_id = 19470 AND term = 'bepeng-enda-an'`).run();
  db.prepare(`UPDATE affixes SET term = 'pepengendaanan', meaning_ms = 'tempat pemerhatian / pemandangan', meaning_en = 'place associated with viewing' WHERE entry_id = 19470 AND term = 'pepeng-enda-anan'`).run();

  // 6. pengennaan (19474)
  db.prepare(`UPDATE affixes SET meaning_ms = 'mempunyai bekas simpanan', meaning_en = 'possessing a container' WHERE entry_id = 19474 AND term = 'bepengennaan'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'tempat menyimpan bekas', meaning_en = 'place for containers' WHERE entry_id = 19474 AND term = 'pepengennaanan'`).run();

  // 7. pengentanan (19475)
  db.prepare(`UPDATE affixes SET meaning_ms = 'mempunyai pemegang / hulu', meaning_en = 'having a handle' WHERE entry_id = 19475 AND term = 'bepengentanan'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'tempat pemegang', meaning_en = 'place for handle' WHERE entry_id = 19475 AND term = 'pepengentananan'`).run();

  // 8. pepekar-pepekar (19481)
  db.prepare(`UPDATE affixes SET meaning_ms = 'membentang-bentang (Ragam Pelaku)', meaning_en = 'to unfurl repeatedly (actor voice)' WHERE entry_id = 19481 AND term = 'mepekar-pepekar'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'dibentang-bentangkan (Ragam Pasif)', meaning_en = 'to be repeatedly unfurled (passive voice)' WHERE entry_id = 19481 AND term = 'pinepekar-pepekar'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'membuatkan membentang (Kausatif)', meaning_en = 'to cause to unfurl repeatedly (causative)' WHERE entry_id = 19481 AND term = 'pepepekar-pepekar'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'bentang-bentangkan (Aplikatif)', meaning_en = 'to unfurl repeatedly for (applicative)' WHERE entry_id = 19481 AND term = 'pepekar-pepekaran' AND meaning_ms LIKE '%Aplikatif%'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'bentang-bentangan (Kata Nama Terbitan)', meaning_en = 'product of repeated unfurling' WHERE entry_id = 19481 AND term = 'pepekar-pepekaran' AND meaning_ms LIKE '%Kata Nama%'`).run();

  // 9. pesuk-pesuk (19488)
  db.prepare(`UPDATE affixes SET meaning_ms = 'semakin kurus (Ragam Pelaku)', meaning_en = 'to continue getting thinner (actor voice)' WHERE entry_id = 19488 AND term = 'mesuk-pesuk'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'dijadikan semakin kurus (Ragam Pasif)', meaning_en = 'to be made thinner (passive voice)' WHERE entry_id = 19488 AND term = 'pinesuk-pesuk'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'menguruskan secara berterusan (Kausatif)', meaning_en = 'to cause to get thinner (causative)' WHERE entry_id = 19488 AND term = 'pepesuk-pesuk'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'beransur kurus pada (Aplikatif)', meaning_en = 'to get thinner at (applicative)' WHERE entry_id = 19488 AND term = 'pesuk-pesukan' AND meaning_ms LIKE '%Aplikatif%'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'keadaan beransur kurus (Kata Nama Terbitan)', meaning_en = 'state of getting thinner' WHERE entry_id = 19488 AND term = 'pesuk-pesukan' AND meaning_ms LIKE '%Kata Nama%'`).run();

  // 10. pinisak-pisak (19498)
  db.prepare(`UPDATE affixes SET meaning_ms = 'melenyek-lenyek (Ragam Pelaku)', meaning_en = 'to crush repeatedly (actor voice)' WHERE entry_id = 19498 AND term = 'minisak-pisak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'dilenyek-lenyek (Ragam Pasif)', meaning_en = 'to be repeatedly crushed (passive voice)' WHERE entry_id = 19498 AND term = 'pininisak-pisak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'membuatkan dilenyek-lenyek (Kausatif)', meaning_en = 'to cause to repeatedly smash (causative)' WHERE entry_id = 19498 AND term = 'pepinisak-pisak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'lenyek-lenyekkan (Aplikatif)', meaning_en = 'to repeatedly smash for (applicative)' WHERE entry_id = 19498 AND term = 'pinisak-pisakan' AND meaning_ms LIKE '%Aplikatif%'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'hasil lenyekan (Kata Nama Terbitan)', meaning_en = 'result of repeated smashing' WHERE entry_id = 19498 AND term = 'pinisak-pisakan' AND meaning_ms LIKE '%Kata Nama%'`).run();

  // 11. pisak-pisak (19500)
  db.prepare(`UPDATE affixes SET meaning_ms = 'melenyek-lenyek (Ragam Pelaku)', meaning_en = 'to crush repeatedly (actor voice)' WHERE entry_id = 19500 AND term = 'misak-pisak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'dilenyek-lenyek (Ragam Pasif)', meaning_en = 'to be repeatedly crushed (passive voice)' WHERE entry_id = 19500 AND term = 'pinisak-pisak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'membuatkan hancur lenyek (Kausatif)', meaning_en = 'to cause to be crushed repeatedly (causative)' WHERE entry_id = 19500 AND term = 'pepisak-pisak'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'hancur-lenyekkan (Aplikatif)', meaning_en = 'to repeatedly crush for (applicative)' WHERE entry_id = 19500 AND term = 'pisak-pisakan' AND meaning_ms LIKE '%Aplikatif%'`).run();
  db.prepare(`UPDATE affixes SET meaning_ms = 'hasil hancur lenyek (Kata Nama Terbitan)', meaning_en = 'result of repeated crushing' WHERE entry_id = 19500 AND term = 'pisak-pisakan' AND meaning_ms LIKE '%Kata Nama%'`).run();

  // 12. petogor (19442)
  db.prepare(`UPDATE affixes SET term = 'pinetogor', meaning_ms = 'ditegakkan, didirikan (Ragam Pasif)', meaning_en = 'to be erected (passive voice)' WHERE entry_id = 19442 AND term = 'pine-togor'`).run();

  return { entriesUpdated, sensesUpdated };
});

const result = applyCorrections();
console.log(`Successfully updated ${result.entriesUpdated} entries and ${result.sensesUpdated} senses!`);
