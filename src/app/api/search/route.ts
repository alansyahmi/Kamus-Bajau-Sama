import { NextRequest, NextResponse } from 'next/server';
import { searchEntries } from '@/lib/search/searchService';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const letter = searchParams.get('letter') || '';

    // 1. Stats endpoint
    if (query === 'stats') {
      const allEntries = await db.query.entries.findMany({
        with: {
          dialects: true,
        },
      });

      const uniqueLocalities = new Set<string>();
      allEntries.forEach((e) => {
        e.dialects.forEach((d) => uniqueLocalities.add(d.localityName));
      });

      return NextResponse.json({
        totalWords: allEntries.length,
        totalLocalities: uniqueLocalities.size || 3,
      });
    }

    // 2. Random word endpoint
    if (query === 'random') {
      const allEntries = await db.query.entries.findMany({
        with: {
          senses: {
            orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
            limit: 1,
            with: {
              examples: { limit: 1 },
            },
          },
        },
      });

      if (allEntries.length === 0) return NextResponse.json(null);
      const randomIndex = Math.floor(Math.random() * allEntries.length);
      const chosen = allEntries[randomIndex];

      return NextResponse.json({
        headword: chosen.headword,
        partOfSpeech: chosen.partOfSpeech,
        ipa: chosen.ipa,
        definitionMs: chosen.senses[0]?.definitionMs || '',
        definitionEn: chosen.senses[0]?.definitionEn || '',
        exampleBajau: chosen.senses[0]?.examples[0]?.sentenceBajau || '',
        exampleMs: chosen.senses[0]?.examples[0]?.sentenceMs || '',
      });
    }

    // 3. Alphabet/Letter filter endpoint
    if (letter) {
      const cleanLetter = letter.trim().toLowerCase();
      const allEntries = await db.query.entries.findMany({
        with: {
          senses: {
            orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
            limit: 1,
          },
        },
      });

      const filtered = allEntries
        .filter((e) => e.headword.toLowerCase().startsWith(cleanLetter))
        .map((e) => ({
          headword: e.headword,
          partOfSpeech: e.partOfSpeech,
          definitionMs: e.senses[0]?.definitionMs || '',
        }));

      return NextResponse.json(filtered);
    }

    // 4. All glossary endpoint
    if (query === 'all') {
      const entries = await db.query.entries.findMany({
        with: {
          senses: {
            orderBy: (senses, { asc }) => [asc(senses.orderIndex)],
            limit: 1,
          },
        },
      });

      const formatted = entries.map((e) => ({
        headword: e.headword,
        partOfSpeech: e.partOfSpeech,
        definitionMs: e.senses[0]?.definitionMs || '',
      }));

      return NextResponse.json(formatted);
    }

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const results = await searchEntries(query.trim());
    return NextResponse.json(results);
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
