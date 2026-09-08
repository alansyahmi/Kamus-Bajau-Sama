import { cache } from 'react';
import { db } from '../db';
import { entries, senses, affixes, dialects, thesaurus, sources, categories, entryCategories } from '../db/schema';
import { eq, or, sql, like, inArray, desc } from 'drizzle-orm';
import { LexicalEntry, SearchResultItem, LexicalCategory } from '../types';

export function normalizeQuery(query: string): string {
  let q = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`\s\-_]/g, '');

  // Standardize search diphthong variants (e.g. paray -> parai, kerabaw -> kerabau)
  if (q.endsWith('ay')) {
    q = q.slice(0, -2) + 'ai';
  } else if (q.endsWith('aw')) {
    q = q.slice(0, -2) + 'au';
  }
  return q;
}

/**
 * Multi-tier search implementation adhering strictly to AGENTS.md search hierarchy:
 * 1. Exact match (headword === query) -> Score 1000
 * 2. Prefix match (headword starts with query) -> Score 800
 * 3. Normalized match (normalized headword === normalized query) -> Score 600
 * 4. Morphological affix match (matched via derived form / sipitan) -> Score 500
 * 5. Meaning match (definitions in MS/EN contain query) -> Score 400
 * 6. Substring match (headword contains query) -> Score 200
 */
export type SearchMode = 'bj' | 'ms' | 'en';

/**
 * Multi-tier search implementation:
 * - mode 'bj' (default): Searches through Bajau headwords, variants, and morphological affixes
 * - mode 'ms': Searches through Malay definitions in senses and affixes
 * - mode 'en': Searches through English definitions in senses and affixes
 */
export async function searchEntries(
  query: string,
  mode: SearchMode = 'bj',
  limit = 10
): Promise<SearchResultItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const normalized = normalizeQuery(cleanQuery);
  const scored: Array<{ item: SearchResultItem; score: number }> = [];

  if (mode === 'ms') {
    // Mode MS: Search through Malay definitions
    const matchingSenses = await db
      .select({ entryId: senses.entryId })
      .from(senses)
      .where(like(sql`LOWER(${senses.definitionMs})`, `%${cleanQuery}%`))
      .limit(80);

    const matchingAffixes = await db
      .select({ entryId: affixes.entryId })
      .from(affixes)
      .where(like(sql`LOWER(${affixes.meaningMs})`, `%${cleanQuery}%`))
      .limit(40);

    const entryIds = Array.from(
      new Set([...matchingSenses.map((s) => s.entryId), ...matchingAffixes.map((a) => a.entryId)])
    );

    if (entryIds.length === 0) return [];

    const rawResults = await db.query.entries.findMany({
      where: inArray(entries.id, entryIds),
      with: {
        senses: {
          orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
          limit: 1,
        },
        affixes: {
          limit: 4,
        },
        dialects: true,
      },
      limit: 100,
    });

    for (const entry of rawResults) {
      const primarySense = entry.senses[0];
      const defMs = primarySense?.definitionMs || '';
      const defEn = primarySense?.definitionEn || '';
      const defMsLower = defMs.toLowerCase();

      let score = 0;
      const defTokens = defMsLower.split(/[\s,;.()/]+/).filter(Boolean);
      const isExactToken = defTokens.includes(cleanQuery);

      if (defMsLower === cleanQuery) {
        score = 1000;
      } else if (isExactToken) {
        score = 900;
      } else if (defMsLower.startsWith(cleanQuery)) {
        score = 800;
      } else if (entry.affixes.some((af) => af.meaningMs.toLowerCase().split(/[\s,;.()/]+/).includes(cleanQuery))) {
        score = 700;
      } else if (defMsLower.includes(cleanQuery)) {
        score = 600;
      } else {
        score = 400;
      }

      scored.push({
        item: {
          id: entry.id,
          headword: entry.headword,
          partOfSpeech: entry.partOfSpeech,
          definitionMs: defMs,
          definitionEn: defEn,
          matchType: 'meaning',
        },
        score,
      });
    }
  } else if (mode === 'en') {
    // Mode EN: Search through English definitions
    const matchingSenses = await db
      .select({ entryId: senses.entryId })
      .from(senses)
      .where(like(sql`LOWER(${senses.definitionEn})`, `%${cleanQuery}%`))
      .limit(80);

    const matchingAffixes = await db
      .select({ entryId: affixes.entryId })
      .from(affixes)
      .where(like(sql`LOWER(${affixes.meaningEn})`, `%${cleanQuery}%`))
      .limit(40);

    const entryIds = Array.from(
      new Set([...matchingSenses.map((s) => s.entryId), ...matchingAffixes.map((a) => a.entryId)])
    );

    if (entryIds.length === 0) return [];

    const rawResults = await db.query.entries.findMany({
      where: inArray(entries.id, entryIds),
      with: {
        senses: {
          orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
          limit: 1,
        },
        affixes: {
          limit: 4,
        },
        dialects: true,
      },
      limit: 100,
    });

    for (const entry of rawResults) {
      const primarySense = entry.senses[0];
      const defMs = primarySense?.definitionMs || '';
      const defEn = primarySense?.definitionEn || '';
      const defEnLower = defEn.toLowerCase();

      let score = 0;
      const defTokens = defEnLower.split(/[\s,;.()/]+/).filter(Boolean);
      const isExactToken = defTokens.includes(cleanQuery);

      if (defEnLower === cleanQuery || defEnLower === `to ${cleanQuery}`) {
        score = 1000;
      } else if (isExactToken) {
        score = 900;
      } else if (defEnLower.startsWith(cleanQuery) || defEnLower.startsWith(`to ${cleanQuery}`)) {
        score = 800;
      } else if (entry.affixes.some((af) => (af.meaningEn || '').toLowerCase().split(/[\s,;.()/]+/).includes(cleanQuery))) {
        score = 700;
      } else if (defEnLower.includes(cleanQuery)) {
        score = 600;
      } else {
        score = 400;
      }

      scored.push({
        item: {
          id: entry.id,
          headword: entry.headword,
          partOfSpeech: entry.partOfSpeech,
          definitionMs: defMs,
          definitionEn: defEn,
          matchType: 'meaning',
        },
        score,
      });
    }
  } else {
    const matchingDialectEntries = await db
      .select({ entryId: dialects.entryId })
      .from(dialects)
      .where(
        or(
          like(sql`LOWER(${dialects.dialectForm})`, `%${cleanQuery}%`),
          like(sql`LOWER(${dialects.dialectForm})`, `%${normalized}%`),
        )
      )
      .limit(40);

    const matchingAffixEntries = await db
      .select({ entryId: affixes.entryId })
      .from(affixes)
      .where(
        or(
          like(sql`LOWER(${affixes.term})`, `%${cleanQuery}%`),
          like(sql`LOWER(${affixes.term})`, `%${normalized}%`),
        )
      )
      .limit(40);

    const extraEntryIds = Array.from(
      new Set([
        ...matchingDialectEntries.map((d) => d.entryId),
        ...matchingAffixEntries.map((a) => a.entryId),
      ])
    );

    const rawResults = await db.query.entries.findMany({
      where:
        extraEntryIds.length > 0
          ? or(
              like(entries.headword, `%${cleanQuery}%`),
              like(entries.searchNormalized, `%${normalized}%`),
              inArray(entries.id, extraEntryIds),
            )
          : or(
              like(entries.headword, `%${cleanQuery}%`),
              like(entries.searchNormalized, `%${normalized}%`),
            ),
      with: {
        senses: {
          orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
          limit: 1,
        },
        affixes: {
          limit: 4,
        },
        dialects: true,
      },
      limit: 100,
    });

    for (const entry of rawResults) {
      const headwordLower = entry.headword.toLowerCase();
      const primarySense = entry.senses[0];
      const defMs = primarySense?.definitionMs || '';
      const defEn = primarySense?.definitionEn || '';

      let score = 0;
      let matchType: SearchResultItem['matchType'] = 'substring';
      let matchedVariant: SearchResultItem['matchedVariant'] = undefined;

      const matchedDialect = entry.dialects?.find((d) => {
        const cleanDialect = d.dialectForm.toLowerCase().replace(/\s*\(piawai\)/i, '').trim();
        const normDialect = normalizeQuery(cleanDialect);
        if (cleanDialect === headwordLower || normDialect === entry.searchNormalized) {
          return false;
        }
        return cleanDialect === cleanQuery || normDialect === normalized || cleanDialect.startsWith(cleanQuery);
      });

      if (matchedDialect) {
        const isSpelling =
          matchedDialect.localityName?.toLowerCase().includes('varian') ||
          matchedDialect.localityName?.toLowerCase().includes('ejaan') ||
          matchedDialect.localityName?.toLowerCase().includes('ortografi');
        matchedVariant = {
          form: matchedDialect.dialectForm.replace(/\s*\(piawai\)/i, '').trim(),
          type: isSpelling ? 'spelling' : 'dialect',
          localityName: matchedDialect.localityName,
        };
      }

      if (headwordLower === cleanQuery) {
        score = 1000;
        matchType = 'exact';
      } else if (
        matchedDialect &&
        (matchedDialect.dialectForm.toLowerCase().replace(/\s*\(piawai\)/i, '').trim() === cleanQuery ||
          normalizeQuery(matchedDialect.dialectForm) === normalized)
      ) {
        score = matchedVariant?.type === 'spelling' ? 900 : 850;
        matchType = 'variant';
      } else if (entry.searchNormalized === normalized) {
        score = 800;
        matchType = 'normalized';
      } else if (headwordLower.startsWith(cleanQuery)) {
        score = 700;
        matchType = 'prefix';
      } else if (entry.searchNormalized.startsWith(normalized)) {
        score = 600;
        matchType = 'normalized';
      } else if (matchedDialect) {
        score = 550;
        matchType = 'variant';
      } else if (
        entry.affixes.some(
          (af) =>
            af.term.toLowerCase() === cleanQuery ||
            normalizeQuery(af.term) === normalized ||
            af.term.toLowerCase().startsWith(cleanQuery)
        )
      ) {
        score = 500;
        matchType = 'affix';
      } else if (headwordLower.includes(cleanQuery)) {
        score = 200;
        matchType = 'substring';
      }

      if (score > 0) {
        scored.push({
          item: {
            id: entry.id,
            headword: entry.headword,
            partOfSpeech: entry.partOfSpeech,
            definitionMs: defMs,
            definitionEn: defEn,
            matchType,
            matchedVariant,
          },
          score,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score || a.item.headword.localeCompare(b.item.headword) || a.item.id - b.item.id);

  // Detect homonyms and assign slugs (e.g. pu'1, pu'2)
  const headwordCounts: Record<string, number> = {};
  for (const s of scored) {
    const hw = s.item.headword.toLowerCase();
    headwordCounts[hw] = (headwordCounts[hw] || 0) + 1;
  }

  const headwordRunningIndex: Record<string, number> = {};
  for (const s of scored) {
    const hw = s.item.headword.toLowerCase();
    if (headwordCounts[hw] > 1) {
      const idx = (headwordRunningIndex[hw] || 0) + 1;
      headwordRunningIndex[hw] = idx;
      s.item.homonymIndex = idx;
      s.item.slug = `${s.item.headword}${idx}`;
    } else {
      s.item.slug = s.item.headword;
    }
  }

  return scored.slice(0, limit).map((s) => s.item);
}

/**
 * Identify potential root word candidates for a derived form.
 */
function findRootCandidates(headword: string): Array<{ root: string; pattern: string }> {
  const w = headword.toLowerCase().trim();
  const candidates: Array<{ root: string; pattern: string }> = [];

  // Prefix nge- (e.g. ngelaa' -> laa', ngeradu -> radu)
  if (w.startsWith('nge-') || (w.startsWith('nge') && w.length > 4)) {
    const stem = w.startsWith('nge-') ? w.slice(4) : w.slice(3);
    candidates.push({ root: stem, pattern: 'nge- + KATA DASAR (Ragam Pelaku)' });
  }

  // Nasal AV mutations (ng-, ny-, m-, n-)
  if (w.startsWith('ng') && w.length > 3) {
    const stem = w.slice(2);
    candidates.push({ root: 'k' + stem, pattern: 'ng- [k] (Ragam Pelaku)' });
    candidates.push({ root: 'g' + stem, pattern: 'ng- [g] (Ragam Pelaku)' });
    candidates.push({ root: stem, pattern: 'ng- + VOKAL (Ragam Pelaku)' });
  } else if (w.startsWith('ny') && w.length > 3) {
    const stem = w.slice(2);
    candidates.push({ root: 's' + stem, pattern: 'ny- [s] (Ragam Pelaku)' });
  } else if (w.startsWith('m') && w.length > 3 && !w.startsWith('ma')) {
    const stem = w.slice(1);
    candidates.push({ root: 'p' + stem, pattern: 'm- [p] (Ragam Pelaku)' });
    candidates.push({ root: 'b' + stem, pattern: 'm- [b] (Ragam Pelaku)' });
  } else if (w.startsWith('n') && w.length > 3 && !w.startsWith('na')) {
    const stem = w.slice(1);
    candidates.push({ root: 't' + stem, pattern: 'n- [t] (Ragam Pelaku)' });
    candidates.push({ root: 'd' + stem, pattern: 'n- [d] (Ragam Pelaku)' });
  }

  // Infix -in- (e.g. kineta -> keta, bineli -> beli)
  const infixMatch = w.match(/^([b-df-hj-np-tv-z])in([aeiou].*)$/);
  if (infixMatch) {
    candidates.push({ root: infixMatch[1] + infixMatch[2], pattern: '-in- (Ragam Pasif)' });
  }

  // Prefix ni- before vowel/liquid (e.g. nialap -> alap)
  if (w.startsWith('ni-') || (w.startsWith('ni') && w.length > 3)) {
    const stem = w.startsWith('ni-') ? w.slice(3) : w.slice(2);
    candidates.push({ root: stem, pattern: 'ni- (Ragam Pasif)' });
  }

  // Prefix pe- (causative) or be- (stative/having)
  if (w.startsWith('pe-') || (w.startsWith('pe') && w.length > 3)) {
    const stem = w.startsWith('pe-') ? w.slice(3) : w.slice(2);
    candidates.push({ root: stem, pattern: 'pe- (Kausatif / Sifat)' });
  }
  if (w.startsWith('be-') || (w.startsWith('be') && w.length > 3)) {
    const stem = w.startsWith('be-') ? w.slice(3) : w.slice(2);
    candidates.push({ root: stem, pattern: 'be- (Ber- / Mempunyai)' });
  }

  // Circumfix ke-...-an / ke-...-on
  if (w.startsWith('ke') && (w.endsWith('an') || w.endsWith('on'))) {
    const stem = w.slice(2, -2);
    candidates.push({ root: stem, pattern: 'ke-...-an (Keadaan / Sifat)' });
  }

  // Suffix -an / -on
  if (w.endsWith('an') || w.endsWith('on')) {
    const stem = w.slice(0, -2);
    candidates.push({ root: stem, pattern: '-an (Aplikatif / Terbitan)' });
  }

  return candidates;
}

// Concrete type matching what db.query.entries.findMany/findFirst returns with the `with` relations included
interface RawEntryWithRelations {
  id: number;
  headword: string;
  searchNormalized: string;
  partOfSpeech: string;
  ipa: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
  senses: Array<{
    id: number;
    entryId: number;
    orderIndex: number;
    definitionMs: string;
    definitionEn: string | null;
    examples: Array<{
      id: number;
      senseId: number;
      sentenceBajau: string;
      highlightWord: string | null;
      sentenceMs: string;
      sentenceEn: string | null;
    }>;
  }>;
  affixes: Array<{ id: number; entryId: number; term: string; meaningMs: string; meaningEn: string | null }>;
  dialects: Array<{ id: number; entryId: number; localityName: string; dialectForm: string }>;
  thesaurus: Array<{ id: number; entryId: number; relatedHeadword: string; relationNote: string | null }>;
  sources: Array<{ id: number; entryId: number; sourceType: string; description: string; verifiedBy: string | null }>;
  entryCategories?: Array<{
    id: number;
    entryId: number;
    categoryId: number;
    category?: {
      id: number;
      nameMs: string;
      nameEn: string | null;
      slug: string;
      description: string | null;
      icon: string | null;
    };
  }>;
}

/**
 * Private helper: enrich a raw DB entry with resolved affixes and root navigation.
 */
async function enrichEntry(entry: RawEntryWithRelations, normalized: string): Promise<LexicalEntry> {
  // 1. Cross-reference derived affixes against the entries database
  const resolvedAffixes = await Promise.all(
    entry.affixes.map(async (af) => {
      const afNorm = normalizeQuery(af.term);
      const matchedEntry = await db.query.entries.findFirst({
        where: or(eq(entries.headword, af.term.toLowerCase()), eq(entries.searchNormalized, afNorm)),
        columns: { id: true, headword: true },
      });
      const isAttested = !!matchedEntry && matchedEntry.id !== entry.id;
      return {
        ...af,
        isAttested,
        linkedHeadword: isAttested ? matchedEntry!.headword : undefined,
        isTheoretical: !isAttested,
      };
    })
  );

  // 2. Identify if this entry is a derived form and locate its root
  let rootEntry: LexicalEntry['rootEntry'] = null;
  const rootCandidates = findRootCandidates(entry.headword);
  for (const cand of rootCandidates) {
    const candNorm = normalizeQuery(cand.root);
    if (candNorm === normalized) continue;
    const matchedRoot = await db.query.entries.findFirst({
      where: or(eq(entries.headword, cand.root), eq(entries.searchNormalized, candNorm)),
      with: {
        senses: { orderBy: (senses, { asc }) => [asc(senses.orderIndex)], limit: 1 },
      },
    });
    if (matchedRoot) {
      rootEntry = {
        headword: matchedRoot.headword,
        definitionMs: matchedRoot.senses[0]?.definitionMs || '',
        definitionEn: matchedRoot.senses[0]?.definitionEn || null,
        affixPattern: cand.pattern,
      };
      break;
    }
  }

  const resolvedCategories = (entry.entryCategories || [])
    .map(ec => ec.category)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return { ...entry, affixes: resolvedAffixes, rootEntry, categories: resolvedCategories } as unknown as LexicalEntry;
}

/**
 * Fetch a complete lexical entry with smart morphological linking and bidirectional root navigation.
 * Returns the FIRST matching entry only. Use getEntriesByHeadword for homonym support.
 */
export async function getEntryByHeadword(headword: string): Promise<LexicalEntry | null> {
  const decoded = decodeURIComponent(headword).trim().toLowerCase();
  const normalized = normalizeQuery(decoded);

  const entry = await db.query.entries.findFirst({
    where: or(eq(entries.headword, decoded), eq(entries.searchNormalized, normalized)),
    with: {
      senses: { orderBy: (senses, { asc }) => [asc(senses.orderIndex)], with: { examples: true } },
      affixes: true,
      dialects: true,
      thesaurus: true,
      entryCategories: {
        with: {
          category: true,
        },
      },
      sources: true,
    },
  });

  if (!entry) return null;
  return enrichEntry(entry, normalized);
}

/**
 * Fetch ALL lexical entries matching a headword (supports homonyms).
 * Returns an array ordered by id (i.e. insertion order = homonym index ¹ ² ³).
 */
export async function getEntriesByHeadword(headword: string): Promise<LexicalEntry[]> {
  const decoded = decodeURIComponent(headword).trim().toLowerCase();
  const normalized = normalizeQuery(decoded);

  const rawEntries = await db.query.entries.findMany({
    where: or(eq(entries.headword, decoded), eq(entries.searchNormalized, normalized)),
    orderBy: (entries, { asc }) => [asc(entries.id)],
    with: {
      senses: { orderBy: (senses, { asc }) => [asc(senses.orderIndex)], with: { examples: true } },
      affixes: true,
      dialects: true,
      thesaurus: true,
      entryCategories: {
        with: {
          category: true,
        },
      },
      sources: true,
    },
  });

  if (rawEntries.length > 0) {
    const total = rawEntries.length;
    const enriched = await Promise.all(rawEntries.map(e => enrichEntry(e, normalized)));
    if (total > 1) {
      return enriched.map((e, idx) => ({
        ...e,
        homonymMeta: {
          index: idx + 1,
          total,
          baseHeadword: e.headword,
          slug: `${e.headword}${idx + 1}`,
          siblings: enriched.map((s, sIdx) => ({
            index: sIdx + 1,
            partOfSpeech: s.partOfSpeech,
            definitionMs: s.senses[0]?.definitionMs || '',
            slug: `${s.headword}${sIdx + 1}`,
          })),
        },
      }));
    }
    return enriched;
  }

  // Fallback: Check if headword has a homonym index suffix (e.g. "pu'2", "pu-2", "pu2")
  const homonymMatch = decoded.match(/^(.*?)[-_]?(\d+)$/);
  if (homonymMatch) {
    const baseWord = homonymMatch[1].trim();
    const baseNormalized = normalizeQuery(baseWord);
    const targetIdx = parseInt(homonymMatch[2], 10);

    const baseRaw = await db.query.entries.findMany({
      where: or(eq(entries.headword, baseWord), eq(entries.searchNormalized, baseNormalized)),
      orderBy: (entries, { asc }) => [asc(entries.id)],
      with: {
        senses: { orderBy: (senses, { asc }) => [asc(senses.orderIndex)], with: { examples: true } },
        affixes: true,
        dialects: true,
        thesaurus: true,
        sources: true,
      },
    });

    if (baseRaw.length > 0) {
      const total = baseRaw.length;
      const enriched = await Promise.all(baseRaw.map(e => enrichEntry(e, baseNormalized)));
      const annotated = enriched.map((e, idx) => ({
        ...e,
        homonymMeta: {
          index: idx + 1,
          total,
          baseHeadword: e.headword,
          slug: `${e.headword}${idx + 1}`,
          siblings: enriched.map((s, sIdx) => ({
            index: sIdx + 1,
            partOfSpeech: s.partOfSpeech,
            definitionMs: s.senses[0]?.definitionMs || '',
            slug: `${s.headword}${sIdx + 1}`,
          })),
        },
      }));

      if (targetIdx >= 1 && targetIdx <= annotated.length) {
        return [annotated[targetIdx - 1]];
      }
      return annotated;
    }
  }

  return [];
}

/**
 * Fetch all headwords for sitemap, glossary, or static generation.
 */
export async function getAllHeadwords(): Promise<string[]> {
  const allEntries = await db.select({ headword: entries.headword }).from(entries);
  return allEntries.map(e => e.headword);
}

/**
 * React.cache-deduplicated version of getEntriesByHeadword.
 * Ensures that generateMetadata() and EntryPage() in the same server render
 * share a single D1 query result instead of each issuing independent queries.
 */
export const getCachedEntriesByHeadword = cache(getEntriesByHeadword);

export interface AdjacentHeadword {
  headword: string;
  partOfSpeech: string;
  definitionMs?: string;
  definitionEn?: string | null;
}

/**
 * Fetch adjacent distinct headwords in alphabetical order for pagination.
 */
export async function getAdjacentHeadwords(headword: string): Promise<{
  prev: AdjacentHeadword | null;
  next: AdjacentHeadword | null;
}> {
  const decoded = decodeURIComponent(headword).trim().toLowerCase();
  const cleanBase = decoded.replace(/[-_]?\d+$/, '');

  const prevRecord = await db.query.entries.findFirst({
    where: sql`LOWER(${entries.headword}) < ${cleanBase}`,
    orderBy: (entries, { desc }) => [desc(sql`LOWER(${entries.headword})`)],
    with: {
      senses: {
        limit: 1,
        orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
      },
    },
  });

  const nextRecord = await db.query.entries.findFirst({
    where: sql`LOWER(${entries.headword}) > ${decoded}`,
    orderBy: (entries, { asc }) => [asc(sql`LOWER(${entries.headword})`)],
    with: {
      senses: {
        limit: 1,
        orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
      },
    },
  });

  return {
    prev: prevRecord
      ? {
          headword: prevRecord.headword,
          partOfSpeech: prevRecord.partOfSpeech,
          definitionMs: prevRecord.senses[0]?.definitionMs,
          definitionEn: prevRecord.senses[0]?.definitionEn,
        }
      : null,
    next: nextRecord
      ? {
          headword: nextRecord.headword,
          partOfSpeech: nextRecord.partOfSpeech,
          definitionMs: nextRecord.senses[0]?.definitionMs,
          definitionEn: nextRecord.senses[0]?.definitionEn,
        }
      : null,
  };
}

export const getCachedAdjacentHeadwords = cache(getAdjacentHeadwords);

/**
 * Find spelling suggestions / closest matches when a word is not found.
 */
export async function getSpellingSuggestions(
  query: string,
  limit = 5
): Promise<SearchResultItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Try standard search with bj mode first
  const results = await searchEntries(cleanQuery, 'bj', limit);
  if (results.length > 0) return results;

  // Also check Malay definition matches (e.g. user typed Malay word like 'makan')
  const malayMatches = await searchEntries(cleanQuery, 'ms', limit);
  if (malayMatches.length > 0) return malayMatches;

  // If still none, try prefix search with first 2 or 3 letters
  if (cleanQuery.length >= 2) {
    const prefix = cleanQuery.slice(0, Math.min(3, cleanQuery.length));
    const prefixMatches = await searchEntries(prefix, 'bj', limit);
    if (prefixMatches.length > 0) return prefixMatches;
  }

  return [];
}

/**
 * Fetch all categories with total word count.
 */
export async function getAllCategoriesWithCounts(): Promise<Array<LexicalCategory & { count: number }>> {
  const allCats = await db.select().from(categories).orderBy(categories.nameMs).all();
  const counts = await db
    .select({
      categoryId: entryCategories.categoryId,
      count: sql<number>`count(*)`,
    })
    .from(entryCategories)
    .groupBy(entryCategories.categoryId)
    .all();

  const countMap = new Map<number, number>();
  for (const c of counts) {
    countMap.set(c.categoryId, c.count);
  }

  return allCats.map(cat => ({
    id: cat.id,
    nameMs: cat.nameMs,
    nameEn: cat.nameEn,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    count: countMap.get(cat.id) || 0,
  }));
}

/**
 * Fetch a single category by slug along with all its member entries.
 */
export async function getCategoryWithEntries(slug: string): Promise<{
  category: LexicalCategory;
  entries: LexicalEntry[];
} | null> {
  const cat = await db.select().from(categories).where(eq(categories.slug, slug.trim().toLowerCase())).get();
  if (!cat) return null;

  const links = await db.select({ entryId: entryCategories.entryId }).from(entryCategories).where(eq(entryCategories.categoryId, cat.id)).all();
  if (links.length === 0) {
    return { category: cat, entries: [] };
  }

  const entryIds = links.map(l => l.entryId);
  const rawEntries = await db.query.entries.findMany({
    where: inArray(entries.id, entryIds),
    orderBy: (entries, { asc }) => [asc(entries.headword)],
    with: {
      senses: { orderBy: (senses, { asc }) => [asc(senses.orderIndex)], with: { examples: true } },
      affixes: true,
      dialects: true,
      thesaurus: true,
      entryCategories: {
        with: {
          category: true,
        },
      },
      sources: true,
    },
  });

  const enriched = await Promise.all(rawEntries.map(e => enrichEntry(e, e.searchNormalized)));
  return {
    category: cat,
    entries: enriched,
  };
}

