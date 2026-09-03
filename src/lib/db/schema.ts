import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// Authoritative Lexical Entries
export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  headword: text('headword').notNull(),
  searchNormalized: text('search_normalized').notNull(),
  partOfSpeech: text('part_of_speech').notNull(),
  ipa: text('ipa'),
  audioUrl: text('audio_url'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => ({
  headwordIdx: index('entries_headword_idx').on(table.headword),
  searchNormalizedIdx: index('entries_search_normalized_idx').on(table.searchNormalized),
}));

// Senses / Definitions (supporting multi-sense entries)
export const senses = sqliteTable('senses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').default(1).notNull(),
  definitionMs: text('definition_ms').notNull(),
  definitionEn: text('definition_en'),
}, (table) => ({
  entryIdIdx: index('senses_entry_id_idx').on(table.entryId),
  defMsIdx: index('senses_def_ms_idx').on(table.definitionMs),
  defEnIdx: index('senses_def_en_idx').on(table.definitionEn),
}));

// Example Sentences
export const examples = sqliteTable('examples', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senseId: integer('sense_id').notNull().references(() => senses.id, { onDelete: 'cascade' }),
  sentenceBajau: text('sentence_bajau').notNull(),
  highlightWord: text('highlight_word'),
  sentenceMs: text('sentence_ms').notNull(),
  sentenceEn: text('sentence_en'),
  audioUrl: text('audio_url'),
}, (table) => ({
  senseIdIdx: index('examples_sense_id_idx').on(table.senseId),
}));

// Morphological Affixes & Derivations (Turunan Sipitan / Terbitan Imbuhan)
export const affixes = sqliteTable('affixes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  term: text('term').notNull(),
  meaningMs: text('meaning_ms').notNull(),
  meaningEn: text('meaning_en'),
}, (table) => ({
  entryIdIdx: index('affixes_entry_id_idx').on(table.entryId),
  termIdx: index('affixes_term_idx').on(table.term),
  meaningMsIdx: index('affixes_meaning_ms_idx').on(table.meaningMs),
}));

// Dialect / Regional Variations (Kota Belud, Tuaran, Papar, Kawang, Semporna, etc.)
export const dialects = sqliteTable('dialects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  localityName: text('locality_name').notNull(),
  dialectForm: text('dialect_form').notNull(),
}, (table) => ({
  entryIdIdx: index('dialects_entry_id_idx').on(table.entryId),
  dialectFormIdx: index('dialects_dialect_form_idx').on(table.dialectForm),
}));

// Thesaurus / Related Words
export const thesaurus = sqliteTable('thesaurus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  relatedHeadword: text('related_headword').notNull(),
  relationNote: text('relation_note'),
}, (table) => ({
  entryIdIdx: index('thesaurus_entry_id_idx').on(table.entryId),
}));

// Linguistic Source & Provenance
export const sources = sqliteTable('sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  sourceType: text('source_type').notNull(),
  description: text('description').notNull(),
  verifiedBy: text('verified_by'),
}, (table) => ({
  entryIdIdx: index('sources_entry_id_idx').on(table.entryId),
}));

// Community Word Submissions
export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  headword: text('headword').notNull(),
  meaning: text('meaning').notNull(),
  exampleSentence: text('example_sentence'),
  locality: text('locality'),
  contributorName: text('contributor_name'),
  contributorEmail: text('contributor_email'),
  notes: text('notes'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => ({
  statusIdx: index('submissions_status_idx').on(table.status),
}));

// Relations setup
export const entriesRelations = relations(entries, ({ many }) => ({
  senses: many(senses),
  affixes: many(affixes),
  dialects: many(dialects),
  thesaurus: many(thesaurus),
  sources: many(sources),
}));

export const sensesRelations = relations(senses, ({ one, many }) => ({
  entry: one(entries, {
    fields: [senses.entryId],
    references: [entries.id],
  }),
  examples: many(examples),
}));

export const examplesRelations = relations(examples, ({ one }) => ({
  sense: one(senses, {
    fields: [examples.senseId],
    references: [senses.id],
  }),
}));

export const affixesRelations = relations(affixes, ({ one }) => ({
  entry: one(entries, {
    fields: [affixes.entryId],
    references: [entries.id],
  }),
}));

export const dialectsRelations = relations(dialects, ({ one }) => ({
  entry: one(entries, {
    fields: [dialects.entryId],
    references: [entries.id],
  }),
}));

export const thesaurusRelations = relations(thesaurus, ({ one }) => ({
  entry: one(entries, {
    fields: [thesaurus.entryId],
    references: [entries.id],
  }),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  entry: one(entries, {
    fields: [sources.entryId],
    references: [entries.id],
  }),
}));
