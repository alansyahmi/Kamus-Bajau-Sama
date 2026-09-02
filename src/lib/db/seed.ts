import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'dictionary.db');
const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

interface ExtractedEntry {
  headword: string;
  searchNormalized: string;
  partOfSpeech: string;
  ipa?: string;
  definition_ms: string;
  definition_en: string;
  meanings_en: string[];
  pages: number[];
  affixes?: Array<{ term: string; meaningMs: string; meaningEn: string }>;
  dialects?: Array<{ localityName: string; dialectForm: string }>;
  thesaurus?: Array<{ relatedHeadword: string; relationNote?: string }>;
  examples?: Array<{
    sentence_bajau: string;
    sentence_en: string;
    sentence_ms?: string;
    source: string;
    page?: number;
  }>;
  sources?: Array<{
    sourceType: string;
    description: string;
    verifiedBy?: string;
  }>;
}

export function initDatabase() {
  console.log('Initializing database schema and indexes...');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headword TEXT NOT NULL UNIQUE,
      search_normalized TEXT NOT NULL,
      part_of_speech TEXT NOT NULL,
      ipa TEXT,
      audio_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS senses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      order_index INTEGER DEFAULT 1 NOT NULL,
      definition_ms TEXT NOT NULL,
      definition_en TEXT
    );

    CREATE TABLE IF NOT EXISTS examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sense_id INTEGER NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
      sentence_bajau TEXT NOT NULL,
      highlight_word TEXT,
      sentence_ms TEXT NOT NULL,
      sentence_en TEXT,
      audio_url TEXT
    );


    CREATE TABLE IF NOT EXISTS affixes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      term TEXT NOT NULL,
      meaning_ms TEXT NOT NULL,
      meaning_en TEXT
    );

    CREATE TABLE IF NOT EXISTS dialects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      locality_name TEXT NOT NULL,
      dialect_form TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS thesaurus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      related_headword TEXT NOT NULL,
      relation_note TEXT
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      source_type TEXT NOT NULL,
      description TEXT NOT NULL,
      verified_by TEXT
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headword TEXT NOT NULL,
      meaning TEXT NOT NULL,
      example_sentence TEXT,
      locality TEXT,
      contributor_name TEXT,
      contributor_email TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- Create indexes for sub-millisecond lookups and full-text capability
    CREATE INDEX IF NOT EXISTS idx_entries_headword ON entries(headword);
    CREATE INDEX IF NOT EXISTS idx_entries_search_normalized ON entries(search_normalized);
    CREATE INDEX IF NOT EXISTS idx_senses_entry_id ON senses(entry_id);
    CREATE INDEX IF NOT EXISTS idx_examples_sense_id ON examples(sense_id);
    CREATE INDEX IF NOT EXISTS idx_affixes_entry_id ON affixes(entry_id);
    CREATE INDEX IF NOT EXISTS idx_dialects_entry_id ON dialects(entry_id);
    CREATE INDEX IF NOT EXISTS idx_thesaurus_entry_id ON thesaurus(entry_id);
    CREATE INDEX IF NOT EXISTS idx_sources_entry_id ON sources(entry_id);
  `);

  console.log('Database tables and indexes created.');

  // Load Extracted Linguistic Dataset
  const jsonPath = path.resolve(process.cwd(), 'src/lib/db/extracted_grammar_entries.json');
  let dataset: ExtractedEntry[] = [];

  if (fs.existsSync(jsonPath)) {
    dataset = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Loaded ${dataset.length} extracted entries from ${jsonPath}.`);
  } else {
    console.warn(`Extracted grammar JSON not found at ${jsonPath}.`);
  }

  const insertEntry = sqlite.prepare(`
    INSERT OR REPLACE INTO entries (headword, search_normalized, part_of_speech, ipa, audio_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertSense = sqlite.prepare(`
    INSERT INTO senses (entry_id, order_index, definition_ms, definition_en)
    VALUES (?, ?, ?, ?)
  `);

  const insertExample = sqlite.prepare(`
    INSERT INTO examples (sense_id, sentence_bajau, highlight_word, sentence_ms, sentence_en, audio_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);


  const insertAffix = sqlite.prepare(`
    INSERT INTO affixes (entry_id, term, meaning_ms, meaning_en)
    VALUES (?, ?, ?, ?)
  `);

  const insertDialect = sqlite.prepare(`
    INSERT INTO dialects (entry_id, locality_name, dialect_form)
    VALUES (?, ?, ?)
  `);

  const insertThesaurus = sqlite.prepare(`
    INSERT INTO thesaurus (entry_id, related_headword, relation_note)
    VALUES (?, ?, ?)
  `);

  const insertSource = sqlite.prepare(`
    INSERT INTO sources (entry_id, source_type, description, verified_by)
    VALUES (?, ?, ?, ?)
  `);

  const seedTransaction = sqlite.transaction(() => {
    // Clear existing data for clean seed
    sqlite.exec('DELETE FROM entries;');

    let totalEntries = 0;
    let totalSenses = 0;
    let totalExamples = 0;
    let totalAffixes = 0;
    let totalThesaurus = 0;
    let totalSources = 0;

    for (const item of dataset) {
      if (!item.headword) continue;

      const entryResult = insertEntry.run(
        item.headword,
        item.searchNormalized,
        item.partOfSpeech,
        item.ipa || null,
        null
      );
      const entryId = Number(entryResult.lastInsertRowid);
      totalEntries++;

      // Insert Sense
      const defMs = item.definition_ms || item.definition_en;
      const defEn = item.definition_en || item.definition_ms;
      const senseResult = insertSense.run(entryId, 1, defMs, defEn);
      const senseId = Number(senseResult.lastInsertRowid);
      totalSenses++;

      // Insert Examples
      if (item.examples && item.examples.length > 0) {
        for (const ex of item.examples) {
          insertExample.run(
            senseId,
            ex.sentence_bajau,
            item.headword,
            ex.sentence_ms || ex.sentence_en,
            ex.sentence_en,
            (ex as any).audioUrl || (ex as any).audio_url || null
          );
          totalExamples++;
        }
      }


      // Insert Affixes / Terbitan
      if (item.affixes && item.affixes.length > 0) {
        for (const af of item.affixes) {
          insertAffix.run(entryId, af.term, af.meaningMs, af.meaningEn);
          totalAffixes++;
        }
      }

      // Insert Dialects
      if (item.dialects && item.dialects.length > 0) {
        for (const d of item.dialects) {
          insertDialect.run(entryId, d.localityName, d.dialectForm);
        }
      }

      // Insert Thesaurus / Compounds
      if (item.thesaurus && item.thesaurus.length > 0) {
        for (const th of item.thesaurus) {
          insertThesaurus.run(entryId, th.relatedHeadword, th.relationNote || null);
          totalThesaurus++;
        }
      }

      // Insert Source Provenance
      if (item.sources && item.sources.length > 0) {
        for (const src of item.sources) {
          insertSource.run(entryId, src.sourceType, src.description, src.verifiedBy || null);
          totalSources++;
        }
      }
    }

    console.log(`\n=== Database Seeding Complete ===`);
    console.log(`• Entries: ${totalEntries}`);
    console.log(`• Senses: ${totalSenses}`);
    console.log(`• Examples: ${totalExamples}`);
    console.log(`• Affixes: ${totalAffixes}`);
    console.log(`• Thesaurus / Compounds: ${totalThesaurus}`);
    console.log(`• Sources: ${totalSources}`);
  });

  seedTransaction();
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}
