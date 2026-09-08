# Database Context Engine Output

## Database Overview

- **Total Tables**: 8
- **Total Columns**: 48
- **Total Foreign Key Relationships**: 6

## Schema Relationship Map

```
senses (entry_id) ──> entries (id)
examples (sense_id) ──> senses (id)
affixes (entry_id) ──> entries (id)
dialects (entry_id) ──> entries (id)
thesaurus (entry_id) ──> entries (id)
sources (entry_id) ──> entries (id)
```

## Central Tables

### `entries`
- **Connectivity Score**: 5.0 (5 connections)
- **Description**: No description available.
- **Primary Key(s)**: id

### `senses`
- **Connectivity Score**: 2.0 (2 connections)
- **Description**: No description available.
- **Primary Key(s)**: id

### `examples`
- **Connectivity Score**: 1.0 (1 connections)
- **Description**: No description available.
- **Primary Key(s)**: id

### `affixes`
- **Connectivity Score**: 1.0 (1 connections)
- **Description**: No description available.
- **Primary Key(s)**: id

### `dialects`
- **Connectivity Score**: 1.0 (1 connections)
- **Description**: No description available.
- **Primary Key(s)**: id

## Query Examples

```sql
-- Join senses with entries
SELECT *
FROM senses
JOIN entries ON senses.entry_id = entries.id;
```

```sql
-- Join examples with senses
SELECT *
FROM examples
JOIN senses ON examples.sense_id = senses.id;
```

```sql
-- Join affixes with entries
SELECT *
FROM affixes
JOIN entries ON affixes.entry_id = entries.id;
```

```sql
-- Join dialects with entries
SELECT *
FROM dialects
JOIN entries ON dialects.entry_id = entries.id;
```

```sql
-- Join thesaurus with entries
SELECT *
FROM thesaurus
JOIN entries ON thesaurus.entry_id = entries.id;
```
