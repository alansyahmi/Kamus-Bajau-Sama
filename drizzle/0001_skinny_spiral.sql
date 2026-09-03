CREATE INDEX `affixes_entry_id_idx` ON `affixes` (`entry_id`);--> statement-breakpoint
CREATE INDEX `affixes_term_idx` ON `affixes` (`term`);--> statement-breakpoint
CREATE INDEX `affixes_meaning_ms_idx` ON `affixes` (`meaning_ms`);--> statement-breakpoint
CREATE INDEX `dialects_entry_id_idx` ON `dialects` (`entry_id`);--> statement-breakpoint
CREATE INDEX `dialects_dialect_form_idx` ON `dialects` (`dialect_form`);--> statement-breakpoint
CREATE INDEX `entries_headword_idx` ON `entries` (`headword`);--> statement-breakpoint
CREATE INDEX `entries_search_normalized_idx` ON `entries` (`search_normalized`);--> statement-breakpoint
CREATE INDEX `examples_sense_id_idx` ON `examples` (`sense_id`);--> statement-breakpoint
CREATE INDEX `senses_entry_id_idx` ON `senses` (`entry_id`);--> statement-breakpoint
CREATE INDEX `senses_def_ms_idx` ON `senses` (`definition_ms`);--> statement-breakpoint
CREATE INDEX `senses_def_en_idx` ON `senses` (`definition_en`);--> statement-breakpoint
CREATE INDEX `sources_entry_id_idx` ON `sources` (`entry_id`);--> statement-breakpoint
CREATE INDEX `submissions_status_idx` ON `submissions` (`status`);--> statement-breakpoint
CREATE INDEX `thesaurus_entry_id_idx` ON `thesaurus` (`entry_id`);