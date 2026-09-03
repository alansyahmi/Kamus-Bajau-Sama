import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

function escapeSqlString(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function exportD1Seed() {
  const dbPath = path.resolve(process.cwd(), 'dictionary.db');
  if (!fs.existsSync(dbPath)) {
    console.error('dictionary.db not found.');
    process.exit(1);
  }

  const sqlite = new Database(dbPath);
  const tables = ['entries', 'senses', 'examples', 'affixes', 'dialects', 'thesaurus', 'sources', 'submissions'];

  const sqlStatements: string[] = [
    '-- Cloudflare D1 Initial Data Seed for Kamus Bajau Sama',
    'PRAGMA foreign_keys = OFF;',
  ];

  for (const table of tables) {
    try {
      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      if (rows.length === 0) continue;

      sqlStatements.push(`\n-- Table: ${table} (${rows.length} rows)`);
      const columns = Object.keys(rows[0] as object);
      const colList = columns.map((c) => `\`${c}\``).join(', ');

      // Split into batches of 50 for D1 execution efficiency
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuesList = batch
          .map((row: any) => {
            const vals = columns.map((c) => escapeSqlString(row[c])).join(', ');
            return `(${vals})`;
          })
          .join(',\n  ');

        sqlStatements.push(`INSERT OR IGNORE INTO \`${table}\` (${colList}) VALUES\n  ${valuesList};`);
      }
    } catch (e: any) {
      console.warn(`Skipping table ${table}:`, e.message);
    }
  }

  sqlStatements.push('\n-- Performance Indexes to prevent full table scans and eliminate row read limits');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `affixes_entry_id_idx` ON `affixes` (`entry_id`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `affixes_term_idx` ON `affixes` (`term`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `affixes_meaning_ms_idx` ON `affixes` (`meaning_ms`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `dialects_entry_id_idx` ON `dialects` (`entry_id`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `dialects_dialect_form_idx` ON `dialects` (`dialect_form`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `entries_headword_idx` ON `entries` (`headword`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `entries_search_normalized_idx` ON `entries` (`search_normalized`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `examples_sense_id_idx` ON `examples` (`sense_id`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `senses_entry_id_idx` ON `senses` (`entry_id`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `senses_def_ms_idx` ON `senses` (`definition_ms`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `senses_def_en_idx` ON `senses` (`definition_en`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `sources_entry_id_idx` ON `sources` (`entry_id`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `submissions_status_idx` ON `submissions` (`status`);');
  sqlStatements.push('CREATE INDEX IF NOT EXISTS `thesaurus_entry_id_idx` ON `thesaurus` (`entry_id`);');

  sqlStatements.push('\nPRAGMA foreign_keys = ON;\n');

  const outputPath = path.resolve(process.cwd(), 'd1-seed.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');
  console.log(`✅ Successfully generated D1 seed file at: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

exportD1Seed();
