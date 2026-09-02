import { NextRequest, NextResponse } from 'next/server';
import { searchEntries } from '@/lib/search/searchService';
import { db } from '@/lib/db';
import { entries, senses, examples, dialects } from '@/lib/db/schema';
import { sql, eq, asc, like, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const letter = searchParams.get('letter') || '';

    // 1. Stats endpoint — two lightweight COUNT aggregates, no full scan
    if (query === 'stats') {
      const [entryRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(entries);

      const [localityRow] = await db
        .select({ count: sql<number>`count(distinct locality_name)` })
        .from(dialects);

      return NextResponse.json(
        {
          totalWords: Number(entryRow?.count ?? 0),
          totalLocalities: Number(localityRow?.count ?? 0) || 3,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          },
        }
      );
    }

    // 2. Random word endpoint — ORDER BY RANDOM() LIMIT 1, then fetch sense + example
    if (query === 'random') {
      const [randomEntry] = await db
        .select()
        .from(entries)
        .orderBy(sql`RANDOM()`)
        .limit(1);

      if (!randomEntry) return NextResponse.json(null);

      const [firstSense] = await db
        .select()
        .from(senses)
        .where(eq(senses.entryId, randomEntry.id))
        .orderBy(asc(senses.orderIndex))
        .limit(1);

      const [firstExample] = firstSense
        ? await db
            .select()
            .from(examples)
            .where(eq(examples.senseId, firstSense.id))
            .limit(1)
        : [null];

      return NextResponse.json(
        {
          headword: randomEntry.headword,
          partOfSpeech: randomEntry.partOfSpeech,
          ipa: randomEntry.ipa,
          definitionMs: firstSense?.definitionMs || '',
          definitionEn: firstSense?.definitionEn || '',
          exampleBajau: firstExample?.sentenceBajau || '',
          exampleMs: firstExample?.sentenceMs || '',
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=600, stale-while-revalidate=120',
          },
        }
      );
    }

    // 3. Alphabet/Letter filter endpoint — SQL WHERE clause, no full scan
    if (letter) {
      const cleanLetter = letter.trim().toLowerCase();

      const filtered = await db.query.entries.findMany({
        where: like(entries.headword, `${cleanLetter}%`),
        with: {
          senses: {
            orderBy: (s, { asc }) => [asc(s.orderIndex)],
            limit: 1,
          },
        },
      });

      return NextResponse.json(
        filtered.map((e) => ({
          headword: e.headword,
          partOfSpeech: e.partOfSpeech,
          definitionMs: e.senses[0]?.definitionMs || '',
        })),
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
          },
        }
      );
    }

    // 4. All glossary endpoint — intentional full list but cached aggressively
    if (query === 'all') {
      const allEntries = await db.query.entries.findMany({
        with: {
          senses: {
            orderBy: (s, { asc }) => [asc(s.orderIndex)],
            limit: 1,
          },
        },
      });

      return NextResponse.json(
        allEntries.map((e) => ({
          headword: e.headword,
          partOfSpeech: e.partOfSpeech,
          definitionMs: e.senses[0]?.definitionMs || '',
        })),
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
          },
        }
      );
    }

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const results = await searchEntries(query.trim());
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
