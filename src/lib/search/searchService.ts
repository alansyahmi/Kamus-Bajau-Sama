import { cache } from 'react';
import { db } from '../db';
import { entries, senses, affixes, dialects, thesaurus, sources } from '../db/schema';
import { eq, or, sql, like, inArray } from 'drizzle-orm';
import { LexicalEntry, SearchResultItem } from '../types';

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
    // Mode BJ (default): Search through Bajau headwords, variants, and affixes
    const rawResults = await db.query.entries.findMany({
      where: or(
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

  scored.sort((a, b) => b.score - a.score || a.item.headword.localeCompare(b.item.headword));
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

  return { ...entry, affixes: resolvedAffixes, rootEntry } as unknown as LexicalEntry;
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

  const allEntries = await db.query.entries.findMany({
    where: or(eq(entries.headword, decoded), eq(entries.searchNormalized, normalized)),
    with: {
      senses: { orderBy: (senses, { asc }) => [asc(senses.orderIndex)], with: { examples: true } },
      affixes: true,
      dialects: true,
      thesaurus: true,
      sources: true,
    },
  });

  if (allEntries.length === 0) return [];
  return Promise.all(allEntries.map(e => enrichEntry(e, normalized)));
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
