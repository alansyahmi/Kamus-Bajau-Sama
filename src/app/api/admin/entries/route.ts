import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { entries, senses, examples, affixes, dialects, sources } from '@/lib/db/schema';
import { normalizeQuery } from '@/lib/search/searchService';
import { eq, like, desc, sql } from 'drizzle-orm';

export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge';

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
      const entrySources = db.select().from(sources).where(eq(sources.entryId, entry.id)).all();

      const sensesWithExamples = entrySenses.map(s => {
        const senseExamples = db.select().from(examples).where(eq(examples.senseId, s.id)).all();
        return { ...s, examples: senseExamples };
      });

      return {
        ...entry,
        senses: sensesWithExamples,
        affixes: entryAffixes,
        dialects: entryDialects,
        sources: entrySources,
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
    const { 
      headword, 
      partOfSpeech, 
      ipa, 
      audioUrl,
      senses: rawSenses, 
      affixes: rawAffixes, 
      dialects: rawDialects, 
      sources: rawSources,
      // legacy fallback fields
      definitionMs, 
      definitionEn, 
      examples: rawExamples 
    } = body;

    if (!headword || !partOfSpeech) {
      return NextResponse.json({ error: 'Kata dasar dan golongan kata wajib diisi.' }, { status: 400 });
    }

    const searchNormalized = normalizeQuery(headword);

    // 1. Insert entry
    const newEntry = db.insert(entries).values({
      headword: headword.trim(),
      searchNormalized,
      partOfSpeech: partOfSpeech.trim(),
      ipa: ipa ? ipa.trim() : `/${searchNormalized}/`,
      audioUrl: audioUrl?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning().get();

    // 2. Insert senses & their examples
    const createdSenses: any[] = [];
    if (Array.isArray(rawSenses) && rawSenses.length > 0) {
      for (let i = 0; i < rawSenses.length; i++) {
        const s = rawSenses[i];
        if (!s.definitionMs && !s.definitionEn) continue;

        const insertedSense = db.insert(senses).values({
          entryId: newEntry.id,
          orderIndex: s.orderIndex || (i + 1),
          definitionMs: s.definitionMs?.trim() || '',
          definitionEn: s.definitionEn?.trim() || null,
        }).returning().get();

        const createdExamples: any[] = [];
        if (Array.isArray(s.examples)) {
          for (const ex of s.examples) {
            if (ex.sentenceBajau?.trim() || ex.sentenceMs?.trim()) {
              const insertedEx = db.insert(examples).values({
                senseId: insertedSense.id,
                sentenceBajau: ex.sentenceBajau?.trim() || '',
                highlightWord: ex.highlightWord?.trim() || headword.trim(),
                sentenceMs: ex.sentenceMs?.trim() || '',
                sentenceEn: ex.sentenceEn?.trim() || null,
                audioUrl: ex.audioUrl?.trim() || null,
              }).returning().get();
              createdExamples.push(insertedEx);
            }
          }
        }
        createdSenses.push({ ...insertedSense, examples: createdExamples });
      }
    } else if (definitionMs) {
      // Legacy fallback
      const insertedSense = db.insert(senses).values({
        entryId: newEntry.id,
        orderIndex: 1,
        definitionMs: definitionMs.trim(),
        definitionEn: definitionEn?.trim() || null,
      }).returning().get();

      const createdExamples: any[] = [];
      if (Array.isArray(rawExamples)) {
        for (const ex of rawExamples) {
          if (ex.sentenceBajau && ex.sentenceMs) {
            const insertedEx = db.insert(examples).values({
              senseId: insertedSense.id,
              sentenceBajau: ex.sentenceBajau.trim(),
              highlightWord: ex.highlightWord?.trim() || headword.trim(),
              sentenceMs: ex.sentenceMs.trim(),
              sentenceEn: ex.sentenceEn?.trim() || null,
            }).returning().get();
            createdExamples.push(insertedEx);
          }
        }
      }
      createdSenses.push({ ...insertedSense, examples: createdExamples });
    }

    // 3. Insert Affixes
    const createdAffixes: any[] = [];
    if (Array.isArray(rawAffixes)) {
      for (const af of rawAffixes) {
        if (af.term?.trim() && af.meaningMs?.trim()) {
          const insertedAf = db.insert(affixes).values({
            entryId: newEntry.id,
            term: af.term.trim(),
            meaningMs: af.meaningMs.trim(),
            meaningEn: af.meaningEn?.trim() || null,
          }).returning().get();
          createdAffixes.push(insertedAf);
        }
      }
    }

    // 4. Insert Dialects
    const createdDialects: any[] = [];
    if (Array.isArray(rawDialects)) {
      for (const d of rawDialects) {
        if (d.localityName?.trim() && d.dialectForm?.trim()) {
          const insertedD = db.insert(dialects).values({
            entryId: newEntry.id,
            localityName: d.localityName.trim(),
            dialectForm: d.dialectForm.trim(),
          }).returning().get();
          createdDialects.push(insertedD);
        }
      }
    }

    // 5. Insert Sources
    const createdSources: any[] = [];
    if (Array.isArray(rawSources) && rawSources.length > 0) {
      for (const src of rawSources) {
        if (src.sourceType?.trim() || src.description?.trim()) {
          const insertedSrc = db.insert(sources).values({
            entryId: newEntry.id,
            sourceType: src.sourceType?.trim() || 'Penyunting Pentadbir',
            description: src.description?.trim() || '',
            verifiedBy: src.verifiedBy?.trim() || null,
          }).returning().get();
          createdSources.push(insertedSrc);
        }
      }
    } else {
      // Default source
      const insertedSrc = db.insert(sources).values({
        entryId: newEntry.id,
        sourceType: 'Penyunting Pentadbir',
        description: 'Dimasukkan melalui Papan Pemuka Pentadbir Kamus Bajau Sama',
        verifiedBy: 'Pentadbir Kamus',
      }).returning().get();
      createdSources.push(insertedSrc);
    }

    const fullEntry = {
      ...newEntry,
      senses: createdSenses,
      affixes: createdAffixes,
      dialects: createdDialects,
      sources: createdSources,
    };

    return NextResponse.json({ success: true, entryId: newEntry.id, entry: fullEntry });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Gagal mencipta entri baharu.' }, { status: 500 });
  }
}
