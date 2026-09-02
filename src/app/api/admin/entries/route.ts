import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { entries, senses, examples, affixes, dialects, sources } from '@/lib/db/schema';
import { normalizeQuery } from '@/lib/search/searchService';
import { eq, like, desc, sql } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get('q')?.trim() || '';
  const letter = searchParams.get('letter')?.trim().toLowerCase() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
  const offset = (page - 1) * limit;

  try {
    let entriesList;
    let total = 0;

    if (q) {
      const norm = normalizeQuery(q);
      const condition = like(entries.searchNormalized, `%${norm}%`);
      entriesList = db.select().from(entries)
        .where(condition)
        .orderBy(entries.headword)
        .limit(limit)
        .offset(offset)
        .all();
      const countRes = db.select({ count: sql<number>`count(*)` }).from(entries).where(condition).get();
      total = countRes?.count || 0;
    } else if (letter) {
      const condition = like(entries.searchNormalized, `${letter}%`);
      entriesList = db.select().from(entries)
        .where(condition)
        .orderBy(entries.headword)
        .limit(limit)
        .offset(offset)
        .all();
      const countRes = db.select({ count: sql<number>`count(*)` }).from(entries).where(condition).get();
      total = countRes?.count || 0;
    } else {
      entriesList = db.select().from(entries)
        .orderBy(entries.headword)
        .limit(limit)
        .offset(offset)
        .all();
      const countRes = db.select({ count: sql<number>`count(*)` }).from(entries).get();
      total = countRes?.count || 0;
    }

    // Fetch senses for the returned entries
    const enriched = entriesList.map(entry => {
      const entrySenses = db.select().from(senses).where(eq(senses.entryId, entry.id)).all();
      const entryAffixes = db.select().from(affixes).where(eq(affixes.entryId, entry.id)).all();
      const entryDialects = db.select().from(dialects).where(eq(dialects.entryId, entry.id)).all();
      
      const sensesWithExamples = entrySenses.map(s => {
        const senseExamples = db.select().from(examples).where(eq(examples.senseId, s.id)).all();
        return { ...s, examples: senseExamples };
      });

      return {
        ...entry,
        senses: sensesWithExamples,
        affixes: entryAffixes,
        dialects: entryDialects,
      };
    });

    return NextResponse.json({
      entries: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin entries:', error);
    return NextResponse.json({ error: 'Gagal mendapatkan senarai entri.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { headword, partOfSpeech, ipa, definitionMs, definitionEn, examples: rawExamples } = body;

    if (!headword || !partOfSpeech || !definitionMs) {
      return NextResponse.json({ error: 'Kata dasar, golongan kata, dan definisi Melayu wajib diisi.' }, { status: 400 });
    }

    const searchNormalized = normalizeQuery(headword);

    // Insert entry
    const newEntry = db.insert(entries).values({
      headword: headword.trim(),
      searchNormalized,
      partOfSpeech: partOfSpeech.trim(),
      ipa: ipa ? ipa.trim() : `/${searchNormalized}/`,
    }).returning().get();

    // Insert sense
    const newSense = db.insert(senses).values({
      entryId: newEntry.id,
      orderIndex: 1,
      definitionMs: definitionMs.trim(),
      definitionEn: definitionEn?.trim() || null,
    }).returning().get();

    // Insert examples if provided
    if (Array.isArray(rawExamples)) {
      for (const ex of rawExamples) {
        if (ex.sentenceBajau && ex.sentenceMs) {
          db.insert(examples).values({
            senseId: newSense.id,
            sentenceBajau: ex.sentenceBajau.trim(),
            highlightWord: ex.highlightWord?.trim() || headword.trim(),
            sentenceMs: ex.sentenceMs.trim(),
            sentenceEn: ex.sentenceEn?.trim() || null,
          }).run();
        }
      }
    }

    // Default source
    db.insert(sources).values({
      entryId: newEntry.id,
      sourceType: 'Penyunting Pentadbir',
      description: 'Dimasukkan melalui Papan Pemuka Pentadbir Kamus Bajau Samah',
      verifiedBy: 'Pentadbir Kamus',
    }).run();

    return NextResponse.json({ success: true, entryId: newEntry.id });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Gagal mencipta entri baharu.' }, { status: 500 });
  }
}
