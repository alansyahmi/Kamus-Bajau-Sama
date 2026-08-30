# Kamus Bajau Samah — UX Specification

## 1. Product Purpose

Kamus Bajau Samah is a public online lexical resource for the Bajau Samah language.

Its primary purpose is to make Bajau Samah vocabulary:

- searchable
- understandable
- discoverable
- shareable
- documentable
- open to community contribution

The MVP focuses on **lexical collection and discovery**.

The experience should be simple enough for an ordinary speaker to use immediately while leaving enough structure for future linguistic research.

---

# 2. Primary Users

## 2.1 Bajau Samah Speaker

Likely goal:

> "I want to know what this word means."

or:

> "I know a word that isn't here."

Needs:

- fast search
- familiar language
- minimal friction
- mobile-friendly interaction
- easy contribution

---

## 2.2 Language Learner

Likely goal:

> "I want to learn Bajau Samah vocabulary."

Needs:

- clear meanings
- examples
- pronunciation
- related words
- easy exploration

Some of these features may arrive after MVP.

---

## 2.3 Researcher / Linguist

Likely goal:

> "I want to inspect how this lexical item is documented."

Needs:

- source provenance
- locality
- lexical distinctions
- variants
- multiple senses
- stable URLs

The MVP should already preserve enough structure to support future research-oriented features.

---

# 3. Primary User Journey

The dominant flow is:

```text id="qk1e3e"
Discover website
      ↓
Search for a word
      ↓
See suggestions/results
      ↓
Open lexical entry
      ↓
Understand word
      ↓
Explore related information
      ↓
Optionally contribute knowledge
```

This journey should require as little friction as possible.

---

# 4. Homepage UX

## Primary Objective

The homepage should immediately encourage searching.

The user should not have to understand the entire project before using the dictionary.

### Above the fold

Prioritise:

1. Brand
2. Search
3. Short explanation
4. Optional cultural visual identity

The search field should be the dominant interaction.

---

# 5. Global Search

Search should be available throughout the website.

Where practical:

- homepage search
- search-results search
- entry-page search

The user should be able to search for another word without manually navigating back to the homepage.

---

# 6. Search Behaviour

Search begins as soon as the user types.

Do not require the user to press a Search button for ordinary queries.

### Search input

The search field should:

- support normal typing
- retain the current query while the user is interacting with results
- be easy to clear
- support keyboard navigation
- behave naturally with mobile keyboards

---

# 7. Search Matching

Search should use a relevance hierarchy.

Recommended order:

```text id="i8z8c4"
1. Exact match
2. Prefix match
3. Normalised match
4. Known variant
5. Substring match
6. Fuzzy match
```

Future:

```text
7. Semantic/meaning match
```

The system should strongly distinguish exact matches from approximate matches.

---

# 8. Search Normalisation

Search should be more forgiving than displayed lexical data.

Store:

```text id="qcdpb7"
authoritative headword
        +
normalised searchable form
```

Search normalisation may eventually account for:

- case
- selected diacritics
- orthographic inconsistencies
- common typing differences

The exact normalisation rules should be documented and deterministic.

Do not modify the authoritative headword because of search normalisation.

---

# 9. Autocomplete

Autocomplete should appear while typing.

Example:

```text id="g9j1cl"
mang...

mangan      kata kerja
mangah      kata sifat
manganta    kata nama
```

### Behaviour

- Show only highly relevant suggestions.
- Prioritise exact/prefix matches.
- Keep results concise.
- Allow keyboard navigation.
- Allow touch selection.
- Allow "See all results" when there are additional results.

### Result limit

Desktop:

> approximately 8–10 suggestions

Mobile:

> approximately 4–8 suggestions

The exact count may vary according to available viewport space.

---

# 10. Keyboard Interaction

Desktop search must support:

```text id="0jzcxz"
↑ / ↓
Navigate suggestions

Enter
Open selected suggestion

Esc
Dismiss suggestions

Ctrl/Cmd + K
Focus search
```

Focus should remain predictable and accessible.

---

# 11. Search Submission

When the user submits a query:

### Exact match exists

Open the exact entry directly when appropriate.

### Multiple results exist

Open the search-results page.

### Approximate result exists

Show results with approximate matches clearly distinguished.

### Nothing relevant exists

Show the no-results state.

---

# 12. Search Results UX

Search results should be optimized for scanning.

Each result should contain enough information to distinguish the lexical item.

Recommended:

```text id="2w6ujm"
Headword
Part of speech
Primary meaning
Optional locality
Optional variant indicator
```

Avoid overly large result cards.

The user should be able to scan many entries quickly.

---

# 13. Exact vs Approximate Results

The UX must make search confidence visible.

Example:

```text id="ghhv9x"
Exact match

mangan
to eat
```

versus:

```text id="2a3x2v"
Possible match

mangaan
...
```

Never visually imply that a fuzzy result is authoritative.

---

# 14. No Results UX

No-results state should attempt to recover the user's intent.

Example:

```text id="g27b6k"
We couldn't find “mangar”.

Maybe you meant:

mangan

Still can't find it?

[ Suggest this word ]
```

The contribution CTA should be directly connected to the query.

If possible, prefill the submission form with the searched term.

---

# 15. Entry Page UX

The entry page should answer:

> "What is this word?"

as quickly as possible.

Then progressively reveal more information.

Information hierarchy:

```text id="77j5vw"
Headword
 ↓
Pronunciation
 ↓
Part of speech
 ↓
Primary meaning
 ↓
Examples
 ↓
Additional lexical information
 ↓
Regional information
 ↓
Variants
 ↓
Related words
 ↓
Sources
 ↓
Contribution
```

---

# 16. Entry Header

The header should contain:

- headword
- pronunciation, when available
- part of speech
- primary meaning
- translation

Potential future feature:

- native pronunciation audio

Example:

```text id="t2lv8k"
mangan

/maŋan/

KATA KERJA

makan
to eat

▶ Dengarkan
```

The headword must be visually dominant.

---

# 17. Multiple Senses

An entry can have multiple senses.

Example:

```text id="z0swor"
mangan

1. makan
   to eat

2. mengambil makanan
   to consume food
```

Each sense should be independently addressable in the internal data structure.

A sense may contain:

- Malay definition
- English definition
- example(s)
- usage notes
- locality
- source(s)

The interface should visually distinguish senses.

---

# 18. Examples

Examples demonstrate real usage and should be treated as core lexical information.

Example:

```text id="1x1mi3"
CONTOH

"Mangan oku tadi."

I ate earlier.
```

Potential future functionality:

- audio
- copy
- additional examples

Do not fabricate examples.

---

# 19. Pronunciation

MVP may display pronunciation only when authoritative data exists.

Future design should accommodate:

- IPA
- phonetic transcription
- native recording
- playback controls

When pronunciation is unavailable:

```text id="5qxcv4"
Pronunciation not yet documented.
```

Do not generate pronunciation merely to fill an empty section.

---

# 20. Regional / Locality Information

Locality is meaningful linguistic metadata.

Possible display:

```text id="33geu4"
VARIASI DAERAH

Kota Belud
mangan

Papar
...

Semporna
...
```

Locality may eventually represent:

- where the form was collected
- where it is commonly used
- source location
- regional variation

The exact semantics must be clear in the data model.

Do not infer geographic distribution merely from a contributor's location.

---

# 21. Variants

Alternative lexical forms may be shown as:

```text id="g1cpak"
VARIAN

variant A
variant B
variant C
```

Variants may link to other entries.

The interface must not imply that variants are interchangeable unless the underlying linguistic data supports that interpretation.

---

# 22. Related Words

Related words should allow exploration.

Possible relationship types:

- synonym
- antonym
- related lexical item
- derived form
- regional variant

Example:

```text id="3o1r9g"
KATA BERKAITAN

→ word A
→ word B
→ word C
```

Relationships should be clear enough that users understand why another word is being shown.

---

# 23. Sources & Provenance

Every lexical entry should be traceable to one or more sources whenever possible.

Potential source types:

- Oral source
- Elder / family source
- Community contributor
- Academic publication
- Existing dictionary
- Blog
- Field interview
- Community/social-media source

Example:

```text id="cxa58n"
SUMBER

Oral source
Kota Belud

Community contribution

Academic publication
Author — Title — Year
```

Source information should be discoverable without overwhelming normal users.

---

# 24. Contribution UX

Contribution should feel like helping preserve the language.

Primary CTA:

> **Suggest a word**

Alternative wording may include:

> **Cadangkan perkataan**

or another final language choice established by the project.

The interaction should be lightweight.

---

# 25. Contribution Form

Fields:

### Required

- Bajau Samah word
- Meaning

### Optional

- Example sentence
- Contributor name
- Email
- District/locality
- Additional notes

Optional fields must clearly appear optional.

Do not create unnecessary account-registration friction.

---

# 26. Submission Behaviour

After submission:

1. Validate the fields.
2. Store the submission.
3. Assign a pending status.
4. Show a success message.
5. Do not immediately publish it to the dictionary.

Example:

```text id="b8bcqd"
Terima kasih!

Cadangan anda telah dihantar untuk semakan.
```

The exact copy can be finalised during localisation.

---

# 27. Moderation Model

The authoritative dictionary and user submissions are separate.

Flow:

```text id="p5yr9j"
Community submission
        ↓
Pending review
        ↓
Review
      ↙   ↘
 Approved  Rejected
    ↓
Dictionary
```

Future admin tooling can provide:

- approve
- reject
- request clarification
- edit before approval
- merge with existing entry

---

# 28. Mobile UX

Mobile is the primary environment.

Priorities:

- search visible immediately
- large touch target
- concise autocomplete
- single-column entry
- easy scrolling
- readable lexical typography
- quick navigation back to search
- easy sharing

Avoid requiring precise tapping.

---

# 29. Persistent Search on Entry Pages

Long entry pages should allow the user to search another word without returning to the homepage.

Implementation may be:

- sticky search bar
- compact header search
- accessible search trigger

Do not allow the persistent search UI to dominate the entry content.

---

# 30. Navigation

Global navigation should remain simple.

Recommended:

```text id="mvlq7y"
Kamus
Sumbang Perkataan
Tentang
```

The dictionary should remain the central product.

Avoid unnecessary account-oriented navigation in the MVP.

---

# 31. Permanent URLs

Every entry must have a stable public URL.

Recommended:

```text id="3emfvs"
/kamus/<word>
```

Example:

```text id="1k2h4o"
/kamus/mangan
```

The URL should remain human-readable and shareable.

---

# 32. Social Sharing

Users will likely share entries through social media.

Each entry should support strong link-preview metadata.

Shared content should communicate:

- Kamus Bajau Samah
- headword
- primary meaning

The shared URL should take users directly to the entry.

---

# 33. Back Navigation

Users should be able to move naturally between:

```text id="mw98pj"
Search results
      ↕
Entry
      ↕
Related entry
```

The browser's back button must behave naturally.

Do not unexpectedly reset search state where avoidable.

---

# 34. Loading States

Search should feel immediate.

When loading is unavoidable:

- keep the existing layout
- avoid large blocking spinners
- use small contextual loading indicators
- prevent confusing layout shifts

For locally indexed search, results should appear essentially immediately.

---

# 35. Error States

Errors should clearly explain:

- what went wrong
- whether the user's data was saved
- what they can do next

Never display fake content when an API or database operation fails.

---

# 36. Empty Content

Empty sections should generally not create visual clutter.

Examples:

If an entry has no example:

> Do not necessarily display an empty "Examples" block.

If an entry has no pronunciation:

> Show a subtle missing-data message only where useful.

If no variants exist:

> Hide the variant section.

The page should adapt to the information actually available.

---

# 37. Accessibility Behaviour

The UX must support:

- keyboard navigation
- screen readers
- touch interaction
- visible focus states
- semantic headings
- meaningful labels
- accessible error messages

Search autocomplete must communicate:

- current input
- available suggestions
- currently selected suggestion
- result count where appropriate

---

# 38. Performance Behaviour

The user should perceive search as instantaneous.

Priorities:

```text id="6b8j5j"
Input
 ↓
Immediate feedback
 ↓
Relevant suggestions
 ↓
Entry
```

Avoid unnecessary server requests.

For the initial dataset, local search/indexing is preferred where practical.

---

# 39. Data Integrity Behaviour

The UX should never encourage the system to invent missing information.

Examples:

Missing pronunciation:

> "Pronunciation not yet documented."

Missing example:

> Do not invent one.

Uncertain source:

> Clearly mark uncertainty.

Unknown word:

> Encourage contribution.

This principle is essential because the website functions as a linguistic resource.

---

# 40. Future UX Expansion

The experience should eventually support:

### Linguistic

- IPA
- pronunciation audio
- multiple senses
- regional variants
- etymology
- morphology
- derivation/conjugation

### Discovery

- related words
- semantic exploration
- bilingual search
- reverse lookup

### Community

- contributor recognition
- corrections
- discussion/context
- richer submission workflows

### AI

- semantic search
- language-learning assistance
- contextual explanation
- corpus exploration

AI should augment the dictionary rather than replace authoritative lexical data.

---

# 41. UX Success Criteria

The MVP succeeds if:

### Search

A user can find a known word with minimal interaction.

### Understanding

A user can understand the primary meaning within seconds of opening an entry.

### Exploration

Users naturally discover related information and other entries.

### Contribution

A speaker who knows additional information can submit it without friction.

### Trust

Users can see where information came from.

### Mobile

The entire core experience works comfortably on a smartphone.

---

# 42. North Star UX Principle

> **Search should feel effortless. Entries should feel trustworthy. Contribution should feel meaningful.**

The product should make users feel that Bajau Samah is not merely being stored in a database.

It is being **documented, explored, shared and kept alive on the web.**