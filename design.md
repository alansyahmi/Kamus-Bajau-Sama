# Kamus Bajau Samah — Design System & Visual Direction

## 1. Design Vision

**Kamus Bajau Samah** is a digital dictionary and language-preservation project for the Bajau Samah language.

The design should communicate three things simultaneously:

> **Belonging — Trust — Discovery**

It should feel like a website that the Bajau Samah community can call its own, while also being credible enough for students, researchers, educators and linguists.

The visual identity should be distinctly Sabah/Bajau Samah without becoming stereotypical, overly decorative, or resembling a tourism or cultural-festival website.

### Design positioning

> **A contemporary digital dictionary rooted in Bajau Samah culture.**

Not:

- A generic SaaS dashboard
- A government portal
- A tourism website
- A traditional cultural museum interface
- An AI-generated "ethnic" aesthetic

---

# 2. Cultural Visual Reference

The supplied **Linangkit** references are the primary cultural visual inspiration.

Extract visual principles from the references rather than directly copying their artwork.

Look for:

- geometric structure
- repetition
- symmetry/asymmetry
- rhythm
- colour relationships
- textile-inspired motifs
- line patterns
- visual density
- traditional material character

Translate those characteristics into modern UI elements such as:

- subtle decorative motifs
- section dividers
- borders
- background patterns
- accent shapes
- visual markers
- illustrations
- small ornamental details

### Critical rule

**Cultural elements should support the interface, not dominate it.**

A visitor should first perceive:

> dictionary

and only then notice:

> Bajau Samah visual identity.

Avoid covering every card, heading and section with cultural decoration.

---

# 3. Overall Visual Character

The interface should feel:

- editorial
- calm
- warm
- intelligent
- refined
- contemporary
- human
- culturally grounded

The visual language should have enough personality to be memorable, but enough restraint to remain usable as a serious reference resource.

### Desired feeling

Imagine:

> A beautifully designed linguistic field notebook translated into a modern digital interface.

---

# 4. Colour Philosophy

The colour system should derive inspiration from the Linangkit references rather than relying on arbitrary "Sabah-themed" colours.

Use:

### Primary colour
A strong identity colour derived from the reference material.

### Secondary colours
One or two supporting colours for:

- secondary actions
- tags
- regional indicators
- decorative details

### Neutral palette
Most of the interface should remain neutral.

Use neutral surfaces for:

- page backgrounds
- entry content
- search interfaces
- forms
- documentation

### Principle

**Colour should establish identity and hierarchy, not decoration for its own sake.**

Avoid excessive multi-colour UI.

---

# 5. Typography

Typography is one of the most important parts of the identity.

Priorities:

1. Headword readability
2. Malay readability
3. English readability
4. IPA/phonetic readability
5. Long-form linguistic notes
6. Mobile legibility

The headword should have a distinctive but highly readable treatment.

### Typographic hierarchy

```text
HEADWORD
largest visual element

PRONUNCIATION
secondary but prominent

PART OF SPEECH
small categorical label

PRIMARY MEANING
strong reading priority

TRANSLATIONS
supporting information

EXAMPLES
editorial emphasis

METADATA
quietest hierarchy
```

Do not use overly decorative typography for lexical data.

---

# 6. Spacing

The interface should breathe.

Use generous spacing around:

- headwords
- major sections
- examples
- definitions
- search results

Avoid making the site feel like a spreadsheet.

Whitespace is especially important because lexical entries can eventually contain significant quantities of metadata.

---

# 7. Shape Language

Use a restrained shape system.

Prefer:

- subtle rounding
- clean rectangles
- editorial dividers
- controlled borders
- occasional motif-inspired shapes

Avoid:

- excessive pill components
- huge rounded cards
- floating "SaaS blob" interfaces
- excessive glassmorphism
- unnecessary shadows

Cards should be used when they improve grouping or comprehension, not simply because cards are fashionable.

---

# 8. Iconography

Icons should be:

- simple
- readable
- consistent
- lightweight

Prefer familiar symbols for:

- search
- audio
- copy
- back
- external/source links
- contribution
- navigation

Do not use decorative icons merely to fill empty space.

---

# 9. Homepage

The homepage's primary purpose is to get the user searching.

The hierarchy should be approximately:

```text
Brand
    ↓
"What word are you looking for?"
    ↓
SEARCH
    ↓
Short explanation of Kamus Bajau Samah
    ↓
Featured / recent words
    ↓
Community contribution
    ↓
About / preservation mission
```

The search interface should dominate the first screen.

### Search hero

The search input should feel substantial and inviting.

Characteristics:

- large
- immediately obvious
- excellent mobile usability
- visually distinctive
- fast-feeling
- easy to focus

Avoid surrounding the hero with excessive marketing copy.

This is a dictionary, not a SaaS landing page.

---

# 10. Search Interface

Search is the primary interaction and deserves the highest UI polish.

## Search states

Design all of the following:

### Empty

```text
🔍 Search Bajau Samah...
```

### Typing

Display autocomplete suggestions.

### Exact match

Prioritise the exact lexical entry.

### Multiple results

Show concise lexical previews.

### Fuzzy match

Clearly communicate that the result is approximate.

### No result

Show:

```text
We couldn't find "mangar".

Maybe you meant:
mangan

[ Suggest this word ]
```

---

# 11. Autocomplete

Autocomplete should be compact and fast.

Suggestions should show enough information to distinguish words.

Example:

```text
mang...

mangan       kata kerja
mangah       kata sifat
manganta     kata nama
```

Limit the number of visible suggestions.

Mobile should display fewer results than desktop.

Suggestions should have strong keyboard and touch states.

---

# 12. Search Results

Search-result items should feel dictionary-like rather than like ecommerce cards.

Each item may contain:

```text
HEADWORD

part of speech

primary meaning

regional/locality indicator
```

Keep the result visually light.

The user should be able to scan many results quickly.

Exact results should have the strongest visual priority.

---

# 13. Entry Page

The entry page is the second most important screen after search.

Its design principle:

> **Dictionary first. Linguistic exploration second. Scholarship third.**

### Entry hierarchy

```text
Headword
Pronunciation
Part of speech
Primary meaning
Audio
Examples
Additional lexical information
Regional variation
Variants
Related words
Sources
Contribution
```

---

# 14. Entry Header

The headword should visually dominate.

Example:

```text
mangan

/maŋan/

KATA KERJA

makan
to eat
```

Possible audio control:

```text
▶ Dengarkan
```

Pronunciation and audio should be visually subordinate to the headword.

The header should feel authoritative.

---

# 15. Multiple Senses

Multiple senses must be visually distinct.

Example:

```text
1. makan
   to eat

   Example...

2. mengambil makanan
   to consume food

   Example...
```

Avoid collapsing multiple senses into a single paragraph.

Sense numbering should be visually obvious but not overpowering.

---

# 16. Example Sentences

Examples should receive editorial emphasis.

Example treatment:

```text
CONTOH

"Mangan oku tadi."

I ate earlier.
```

Potential controls:

- Play audio
- Copy
- Expand additional examples

Examples should never feel like secondary metadata.

They demonstrate how the language actually lives.

---

# 17. Regional Variation

Regional/locality information should receive a dedicated visual treatment.

Example:

```text
VARIASI DAERAH

Kota Belud
mangan

Papar
...

Semporna
...
```

The design should eventually support many localities without becoming a complicated map/dashboard.

A subtle locality badge or label may be appropriate.

---

# 18. Variants

Alternative forms should be visually distinct from the primary headword.

Example:

```text
VARIAN

variant A
variant B
variant C
```

Where appropriate, variants should be clickable.

Never visually imply that distinct lexical forms are identical unless the linguistic data establishes that relationship.

---

# 19. Related Words

Related words should encourage exploration.

Example:

```text
KATA BERKAITAN

→ word A
→ word B
→ word C
```

Links should feel like part of the linguistic structure rather than generic recommendation cards.

---

# 20. Sources & Provenance

The provenance section should communicate seriousness without intimidating normal users.

Example:

```text
SUMBER

Oral source
Kota Belud

Community contributor

Academic reference
Author, publication, year
```

Use a quieter visual hierarchy than the definitions.

Source information should still be easy to locate.

---

# 21. Community Contribution CTA

At the end of the entry:

```text
Tahu sesuatu yang kami terlepas?

Help improve this entry.

[ Cadangkan penambahan ]
```

The CTA should feel like community participation rather than customer support.

Avoid aggressive marketing language.

---

# 22. Contribution Form

The form should be approachable and lightweight.

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

The optional fields should be clearly labelled as optional.

The form should reassure users that linguistic knowledge from ordinary community members is valuable.

---

# 23. About Page

The About page should explain:

- What Kamus Bajau Samah is
- Why the project exists
- Language preservation
- Community involvement
- Linguistic documentation
- Academic sources
- Long-term vision

The writing and layout should feel sincere rather than corporate.

Possible framing:

> A living digital record of the Bajau Samah language, built with speakers, families, communities and researchers.

---

# 24. Navigation

Keep navigation minimal.

Primary navigation:

```text
Kamus
Sumbang Perkataan
Tentang
```

Search should always remain easy to access.

Do not turn the site into a complex application shell.

---

# 25. Mobile-First Principles

Mobile is the primary design target.

Assume users frequently arrive from:

- Facebook
- WhatsApp
- Messenger
- search engines

### Requirements

- Search immediately accessible
- Large touch targets
- Minimal horizontal movement
- Single-column entry layout
- Clear section hierarchy
- Fast autocomplete
- Easy back navigation
- Persistent/reachable search
- Readable typography
- Efficient use of vertical space

Desktop should be an enhancement of the mobile experience, not the other way around.

---

# 26. Sharing

Every entry should look good when shared externally.

Permanent URL structure:

```text
/kamus/<word>
```

The design should account for social sharing previews.

When a word is shared, the resulting preview should communicate:

```text
Kamus Bajau Samah
[word]
[meaning]
```

---

# 27. Interaction & Motion

Motion should be subtle.

Use animation for:

- autocomplete appearance
- search state transitions
- expanding secondary information
- audio controls
- page transitions

Avoid:

- constant movement
- excessive parallax
- decorative animations
- long transitions

The dictionary should feel fast even on modest devices.

---

# 28. Accessibility

Accessibility is part of the design system rather than a later patch.

Ensure:

- strong colour contrast
- readable font sizes
- clear focus indicators
- keyboard navigation
- semantic headings
- accessible search interactions
- labelled controls
- touch-friendly targets
- reduced-motion compatibility

The lexical content itself should remain understandable without relying purely on colour or visual decoration.

---

# 29. Empty & Error States

Empty states should be useful rather than apologetic.

Examples:

### No search result

Offer spelling suggestions and a contribution action.

### No examples

```text
No example sentence has been documented yet.
```

### Missing pronunciation

```text
Pronunciation not yet available.
```

Never fabricate missing linguistic information merely to make the interface look complete.

---

# 30. Future-Proofing

The design system should accommodate future features:

- IPA
- native audio
- regional variants
- multiple senses
- etymology
- related lexical networks
- morphology
- conjugation/derivation
- semantic search
- AI-assisted linguistic exploration
- language-learning features

These should be introduced progressively without redesigning the entire interface.

---

# 31. Component Philosophy

Components should be reusable and semantically meaningful.

Examples:

```text
SearchBar
SearchSuggestion
SearchResult
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

Avoid creating one-off components when the same visual/semantic pattern will recur.

---

# 32. Design Tokens

Define reusable tokens for:

### Typography
- Display / headword
- Heading
- Body
- Caption
- Metadata
- IPA

### Spacing
- xs
- sm
- md
- lg
- xl
- section

### Radius
- subtle
- medium
- large

### Borders
- standard
- emphasis
- focus

### Motion
- fast
- standard
- slow

### Colours
- primary
- secondary
- background
- surface
- text
- muted
- border
- success
- warning
- error

Exact values should be established from the final visual exploration and implemented consistently throughout the project.

---

# 33. Design Anti-Patterns

Do not introduce:

- generic startup gradients
- excessive glassmorphism
- giant hero illustrations unrelated to language
- excessive card layouts
- decorative AI imagery
- unnecessary dashboards
- bloated navigation
- visual clutter
- excessive cultural motifs
- fake linguistic information
- UI that prioritises aesthetics over searchability

---

# 34. Design Success Criteria

The design is successful when:

### Casual visitor

Can find and understand a word in seconds.

### Bajau Samah speaker

Feels that the website represents their language respectfully.

### Language learner

Wants to explore additional words.

### Researcher

Trusts the provenance and lexical structure.

### Contributor

Feels encouraged to submit knowledge.

### Developer

Can extend the system without redesigning existing components.

---

# 35. Design North Star

> **Make the Bajau Samah language feel at home on the web.**

The website should not merely translate Bajau Samah words.

It should make the language **visible, searchable, shareable and discoverable** in a way that feels native to the community while meeting modern standards of digital usability and linguistic documentation.