# Kamus Bajau Samah — AGENTS.md

## 1. Project Identity

Kamus Bajau Samah is an open online dictionary and language-preservation project focused on the Bajau Samah language.

The project exists to make Bajau Samah:

- searchable
- accessible
- shareable
- documentable
- useful to speakers, learners, researchers and future generations

The website is a linguistic resource first, not a generic SaaS product.

---

# 2. Source of Truth

Before making significant changes, read:

```text
DESIGN.md
UX_SPEC.md
README.md
```

### Responsibility of each document

`DESIGN.md`
- Visual identity
- Layout
- Typography
- Components
- Responsive behaviour
- Cultural visual direction

`UX_SPEC.md`
- Product behaviour
- Search experience
- Entry experience
- Contribution flow
- Information hierarchy
- Future UX direction

`README.md`
- Project overview
- Setup
- Development instructions
- Deployment information

When implementation details conflict with these documents, preserve the documented product intent unless there is a strong technical reason not to.

---

# 3. Core Engineering Philosophy

Prefer:

> **Simple architecture + excellent UX + strong linguistic data integrity**

Do not introduce complexity merely because a more sophisticated technology exists.

For every architectural decision, ask:

1. Does the MVP actually need this?
2. Does it materially improve the user experience?
3. Does it preserve future extensibility?
4. Does it increase maintenance burden unnecessarily?

Prefer the simplest solution that satisfies the requirement.

---

# 4. Technology Stack

The default stack is:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- SQLite for local development
- SQLite FTS5 for search
- Cloudflare D1 for production
- GitHub for version control

Do not replace these technologies without a compelling reason.

Avoid adding third-party services unless the requirement genuinely cannot be solved cleanly within the existing stack.

---

# 5. MVP Scope

The MVP should provide:

- Dictionary homepage
- Word search
- Autocomplete
- Exact matching
- Prefix matching
- Normalised matching
- Basic fuzzy/approximate matching where appropriate
- Search results
- Individual lexical entry pages
- Malay meanings
- English meanings
- Part of speech
- Examples
- Source/provenance
- Locality information
- Community word submission
- Submission moderation status

The MVP should NOT include unless explicitly requested:

- Authentication
- Payments
- AI chat
- LLM-powered definitions
- Embeddings
- Semantic search
- IPA generation
- Automatic conjugation
- Text-to-speech
- Native mobile applications
- Complex analytics
- Social networking
- User profiles

Design the architecture so these can be added later.

Do not implement future features simply because the schema can support them.

---

# 6. Search Is a Priority System

Search is one of the most important parts of the product.

Treat search quality as a first-class engineering concern.

Preferred matching hierarchy:

```text
1. Exact match
2. Prefix match
3. Normalised match
4. Variant / alternative spelling
5. Substring match
6. Fuzzy match
7. Meaning/semantic match — future
```

Exact matches should always receive the strongest ranking.

Approximate matches must never silently masquerade as exact lexical matches.

When uncertain, prefer transparency over guessing.

---

# 7. Linguistic Data Integrity

This is a linguistic resource.

Data must be treated as authoritative content rather than generic application data.

### Never:

- invent a word
- invent a meaning
- invent a pronunciation
- fabricate an example sentence
- fabricate a source
- silently "correct" a contributor's lexical form
- merge distinct lexical forms without evidence
- overwrite existing lexical information without preserving provenance

### Always:

- preserve the original lexical form
- preserve source information
- distinguish uncertain information
- preserve contributor information where provided
- retain locality information where available
- treat community submissions as unverified until reviewed

When linguistic information is uncertain:

> Flag the uncertainty rather than guessing.

---

# 8. Original Headwords vs Search Normalisation

The authoritative headword must be stored exactly as intended by the source or reviewer.

Search normalisation must be stored separately.

Example:

```text
headword:
Original lexical form

search_normalized:
Search-friendly representation
```

Never replace the authoritative headword simply to make search easier.

Search normalisation exists to improve discoverability, not alter linguistic data.

---

# 9. Database Principles

Use SQLite locally.

Use Drizzle ORM for schema and queries.

Use migrations for schema changes.

Do not manually edit production database structures.

Dictionary data and community submissions must be conceptually separate.

Recommended entities include:

```text
entries
senses
examples
sources
submissions
```

Additional entities may be introduced when genuinely required.

Prefer relational integrity and explicit schemas over loosely structured JSON blobs.

Use JSON only when the data is genuinely semi-structured and relational modelling would be unnecessarily complex.

---

# 10. Dictionary Entry Model

Do not model an entry as a simple:

```text
word → translation
```

Entries must be capable of supporting multiple senses.

Conceptually:

```text
Entry
 ├── Sense 1
 │    ├── Definition
 │    ├── Example(s)
 │    └── Source(s)
 │
 ├── Sense 2
 │    ├── Definition
 │    ├── Example(s)
 │    └── Source(s)
 │
 └── Metadata
      ├── Locality
      ├── Variants
      └── Provenance
```

Do not unnecessarily expose the complexity of this structure in the UI.

---

# 11. Community Submissions

Community submissions must never directly modify authoritative dictionary entries.

Flow:

```text
User
 ↓
Submission
 ↓
Pending
 ↓
Review
 ↓
Approved / Rejected
 ↓
Dictionary
```

The submission form supports:

### Required

- Bajau Samah word
- Meaning

### Optional

- Example sentence
- Contributor name
- Email
- District/locality
- Additional notes

Email is optional and should not be required merely for submission.

Do not expose contributor email publicly unless explicitly designed and permitted.

---

# 12. Locality

Locality is meaningful linguistic metadata.

Examples may include:

- Kota Belud
- Papar
- Semporna
- Other districts/localities

Do not treat locality as merely user-profile information.

It may eventually be used to document:

- lexical variation
- regional forms
- community usage
- geographical distribution

Design the schema to retain locality information even if the MVP only displays it as simple metadata.

---

# 13. Source Provenance

Every authoritative lexical entry should have traceable provenance whenever possible.

Potential source types:

- Oral source
- Elder/grandparent
- Community contributor
- Academic publication
- Dictionary
- Blog
- Field interview
- Community/social-media source

Never fabricate citation information.

When multiple sources support an entry, preserve them rather than collapsing everything into a single source field.

---

# 14. UI Principles

Follow `DESIGN.md` strictly for visual decisions.

Follow `UX_SPEC.md` for interaction decisions.

The interface should prioritize:

1. Search
2. Understanding an entry
3. Exploration
4. Provenance
5. Contribution

Avoid turning the site into a generic dashboard.

---

# 15. Mobile-First

Design for mobile first.

Many users are expected to discover the site through social media.

Assume:

- smaller screens
- touch input
- mobile keyboards
- inconsistent network quality

Avoid layouts that only work well on desktop.

Before considering a UI task complete, verify the mobile experience.

---

# 16. Performance

The dictionary should feel instantaneous.

Priorities:

- fast initial page load
- fast search
- minimal client-side JavaScript where practical
- efficient database queries
- cached/static content where appropriate
- optimized images
- minimal unnecessary dependencies

For the initial dataset, do not introduce external search infrastructure merely to achieve performance.

SQLite/FTS5 should be sufficient.

---

# 17. Accessibility

Accessibility is mandatory.

Use:

- semantic HTML
- proper heading hierarchy
- accessible labels
- visible focus states
- keyboard navigation
- sufficient colour contrast
- accessible form validation
- appropriate ARIA only where necessary

Search autocomplete should behave like a proper accessible combobox.

Do not rely solely on colour to communicate meaning.

---

# 18. Component Architecture

Prefer reusable components with clear responsibilities.

Examples:

```text
SearchBar
SearchSuggestion
SearchResults
SearchResultItem

EntryHeader
Sense
ExampleSentence
Pronunciation
AudioButton

LocalityBadge
VariantList
RelatedWords
SourceCitation

ContributionCTA
SubmissionForm
```

Do not create massive components containing unrelated logic.

Do not prematurely abstract tiny components that have no meaningful reuse.

---

# 19. API & Data Access

Keep data access predictable.

Prefer:

```text
UI
 ↓
Server/API layer
 ↓
Data access
 ↓
Drizzle
 ↓
Database
```

Do not scatter database queries throughout UI components.

Keep validation close to boundaries.

Use Zod for validating external/user-provided data where appropriate.

---

# 20. Error Handling

Errors should be:

- understandable
- recoverable
- non-destructive
- honest

Never fabricate content to make a failed request look successful.

For missing linguistic data, say that the information is unavailable.

Example:

```text
Pronunciation not yet documented.
```

is preferable to inventing pronunciation.

---

# 21. Search Failure Handling

A search failure should still be useful.

Preferred flow:

```text
No exact match
 ↓
Potential alternative
 ↓
No suitable result
 ↓
Suggest a word
```

When users submit an unknown word, pre-populate the contribution form with their search query where possible.

---

# 22. URLs

Dictionary entries should have stable, human-readable URLs.

Preferred structure:

```text
/kamus/<word>
```

Example:

```text
/kamus/mangan
```

URLs should remain stable over time.

Avoid unnecessarily complex identifiers for public dictionary URLs.

---

# 23. SEO & Sharing

Dictionary entries are public knowledge resources.

Design pages so they can eventually be indexed by search engines.

Use:

- meaningful page titles
- proper metadata
- semantic content
- stable URLs
- social sharing metadata

Each entry should be suitable for sharing through:

- Facebook
- WhatsApp
- Messenger
- direct links
- academic references

---

# 24. Cultural Authenticity

Cultural references must be used respectfully.

Use the provided Linangkit references as inspiration for visual identity.

Do not:

- fabricate cultural symbolism
- claim a motif has a meaning without evidence
- overuse ethnic imagery
- turn the interface into a tourism aesthetic
- introduce arbitrary "tribal" decoration

When the cultural meaning of an element is unknown, treat it as a visual reference rather than making a factual cultural claim.

---

# 25. AI Usage

AI tools are encouraged for development.

However:

> **AI must assist implementation, not invent linguistic authority.**

AI may be used for:

- code generation
- refactoring
- test generation
- documentation
- UI implementation
- accessibility checks
- debugging
- query optimisation
- development tooling

AI must NOT independently decide:

- whether a word exists
- what a word means
- which spelling is authoritative
- what a pronunciation should be
- what a linguistic source says

unless the information is explicitly grounded in project data and the result is still treated as machine-generated assistance requiring appropriate validation.

---

# 26. Antigravity Workflow

When working in Antigravity:

### Before coding

1. Read relevant project documentation.
2. Inspect the existing code.
3. Understand the current architecture.
4. Produce a concise implementation plan for non-trivial tasks.

### During implementation

- Make incremental changes.
- Prefer small, understandable commits of work.
- Do not rewrite unrelated code.
- Preserve existing behaviour unless the task requires changing it.

### After implementation

Run appropriate:

```text
tests
lint
typecheck
build
```

For UI tasks, verify the result in the browser.

Do not declare a feature complete merely because the code compiles.

---

# 27. Browser Verification

For user-facing UI changes, verify:

### Desktop

- layout
- spacing
- hierarchy
- interactions

### Mobile

- responsive layout
- touch targets
- search keyboard interaction
- scrolling
- entry readability

Important flows to verify include:

```text
Homepage
 ↓
Search
 ↓
Autocomplete
 ↓
Entry
 ↓
Contribution
```

and:

```text
Unknown search
 ↓
Suggested result / no result
 ↓
Suggest word
 ↓
Submission
```

---

# 28. Testing Philosophy

Test the things that can damage the integrity of the dictionary.

Priority areas:

### Search

- exact matching
- prefix matching
- normalisation
- ranking
- no-result behaviour
- fuzzy matching boundaries

### Data

- required fields
- invalid submissions
- source preservation
- multiple senses
- locality

### UI

- keyboard navigation
- mobile interactions
- form validation
- accessible labels

Do not chase arbitrary percentage coverage merely for the number.

---

# 29. Security & Privacy

Treat contributor data responsibly.

Especially:

- email addresses
- names
- locality
- submission metadata

Do not expose private submission information publicly.

Validate and sanitise user input.

Do not trust browser-provided values.

Protect moderation functionality appropriately if an admin interface is introduced later.

---

# 30. Dependency Discipline

Before adding a dependency, consider:

1. Can the requirement be solved with the existing stack?
2. Is the dependency actively maintained?
3. Does it significantly improve the product?
4. Does it introduce unnecessary complexity?

Avoid dependency sprawl.

---

# 31. Future Features

The architecture should remain extensible for:

- IPA
- native pronunciation audio
- regional variants
- multiple senses
- etymology
- lexical relationships
- morphology
- conjugation/derivation
- semantic search
- AI-assisted exploration
- language-learning tools
- public APIs

However:

> **Do not implement future features prematurely.**

Future-proof the structure, not the entire application.

---

# 32. When Requirements Are Ambiguous

Do not silently make a major architectural decision based on an assumption.

For small implementation details, use the simplest reasonable interpretation.

For decisions affecting:

- database structure
- linguistic semantics
- public data
- authentication
- deployment
- search behaviour
- public UX

follow the existing documentation and choose the least irreversible solution.

---

# 33. Definition of Done

A task is complete when:

- requested functionality works
- existing functionality remains intact
- types pass
- lint passes
- relevant tests pass
- UI is browser-verified where applicable
- mobile behaviour is checked
- no fabricated linguistic data has been introduced
- documentation is updated when architecture or behaviour changes

Do not stop at scaffolding.

A feature should be functional, integrated and usable.

---

# 34. North Star

> **Make Bajau Samah feel at home on the web.**

Build the simplest technology necessary to achieve that goal.

Put the engineering effort where users actually feel it:

> **search quality, entry quality, linguistic integrity and community contribution.**