---
name: schemap
description: AI Database Context & Schema Guardrails Skill for Schemap-managed projects.
---

# Schemap AI Database Agent Skill

Use this skill whenever reading, querying, or writing SQL queries, migrations, or database-related business code in this repository.

## Core Rules & Execution Flow

1. **Inspect Schema Context First**:
   - Before writing any SQL query or database migration, ALWAYS read the database context in `AGENTS.md` or `schemap_database_context.md`.
   - Never invent or guess table names, column names, or foreign key join paths.

2. **Enforce Verified Foreign Key Joins**:
   - Only perform multi-table JOINs using verified foreign key relationships defined in `AGENTS.md`.
   - You can run `schemap join <table1> <table2>` to auto-generate valid SQL JOIN clauses.

3. **Verify Schema Post-Migration**:
   - After writing or applying database migrations, run `schemap diff` to inspect changes.
   - Run `schemap sync` to automatically update project context files (`AGENTS.md`, `CLAUDE.md`).

4. **Flag Ambiguous Business Logic**:
   - If column descriptions or business semantics are missing or ambiguous, flag them for review or run `schemap doctor` / `schemap fix --interactive` rather than inventing semantics.
