CREATE INDEX IF NOT EXISTS `affixes_entry_id_idx` ON `affixes` (`entry_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `affixes_term_idx` ON `affixes` (`term`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `affixes_meaning_ms_idx` ON `affixes` (`meaning_ms`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `dialects_entry_id_idx` ON `dialects` (`entry_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `dialects_dialect_form_idx` ON `dialects` (`dialect_form`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `entries_headword_idx` ON `entries` (`headword`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `entries_search_normalized_idx` ON `entries` (`search_normalized`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `examples_sense_id_idx` ON `examples` (`sense_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `senses_entry_id_idx` ON `senses` (`entry_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `senses_def_ms_idx` ON `senses` (`definition_ms`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `senses_def_en_idx` ON `senses` (`definition_en`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sources_entry_id_idx` ON `sources` (`entry_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `submissions_status_idx` ON `submissions` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `thesaurus_entry_id_idx` ON `thesaurus` (`entry_id`);