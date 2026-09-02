import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { examples, senses, entries } from '@/lib/db/schema';
import { eq, like, or, sql, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'has_audio' | 'no_audio' | 'no_highlight'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    // Join examples with senses and entries
    let query = db
      .select({
        id: examples.id,
        senseId: examples.senseId,
        sentenceBajau: examples.sentenceBajau,
        highlightWord: examples.highlightWord,
        sentenceMs: examples.sentenceMs,
        sentenceEn: examples.sentenceEn,
        audioUrl: examples.audioUrl,
        senseOrderIndex: senses.orderIndex,
        senseDefinitionMs: senses.definitionMs,
        entryId: entries.id,
        headword: entries.headword,
        partOfSpeech: entries.partOfSpeech,
      })
      .from(examples)
      .innerJoin(senses, eq(examples.senseId, senses.id))
      .innerJoin(entries, eq(senses.entryId, entries.id));

    // Construct WHERE conditions
    const conditions = [];

    if (q) {
      conditions.push(
        or(
          like(examples.sentenceBajau, `%${q}%`),
          like(examples.sentenceMs, `%${q}%`),
          like(examples.sentenceEn, `%${q}%`),
          like(examples.highlightWord, `%${q}%`),
          like(entries.headword, `%${q}%`)
        )
      );
    }

    if (filter === 'has_audio') {
      conditions.push(sql`${examples.audioUrl} IS NOT NULL AND ${examples.audioUrl} != ''`);
    } else if (filter === 'no_audio') {
      conditions.push(sql`${examples.audioUrl} IS NULL OR ${examples.audioUrl} = ''`);
    } else if (filter === 'no_highlight') {
      conditions.push(sql`${examples.highlightWord} IS NULL OR ${examples.highlightWord} = ''`);
    }

    let finalQuery = query;
    if (conditions.length > 0) {
      // @ts-ignore
      finalQuery = query.where(conditions.length === 1 ? conditions[0] : sql.join(conditions, sql` AND `));
    }

    // Get total count
    let countQuery = db
      .select({ total: count() })
      .from(examples)
      .innerJoin(senses, eq(examples.senseId, senses.id))
      .innerJoin(entries, eq(senses.entryId, entries.id));

    if (conditions.length > 0) {
      // @ts-ignore
      countQuery = countQuery.where(conditions.length === 1 ? conditions[0] : sql.join(conditions, sql` AND `));
    }

    const totalCountRes = countQuery.get();
    const total = totalCountRes?.total || 0;

    const items = finalQuery
      .orderBy(entries.headword, examples.id)
      .limit(limit)
      .offset(offset)
      .all();

    return NextResponse.json({
      examples: items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    console.error('Error fetching admin examples:', error);
    return NextResponse.json({ error: 'Gagal mengambil senarai ayat contoh.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { senseId, sentenceBajau, highlightWord, sentenceMs, sentenceEn } = body;

    if (!senseId || !sentenceBajau || !sentenceMs) {
      return NextResponse.json(
        { error: 'senseId, sentenceBajau, dan sentenceMs diperlukan.' },
        { status: 400 }
      );
    }

    const result = db
      .insert(examples)
      .values({
        senseId,
        sentenceBajau: sentenceBajau.trim(),
        highlightWord: highlightWord ? highlightWord.trim() : null,
        sentenceMs: sentenceMs.trim(),
        sentenceEn: sentenceEn ? sentenceEn.trim() : null,
      })
      .returning()
      .get();

    return NextResponse.json({ success: true, example: result });
  } catch (error: any) {
    console.error('Error creating example sentence:', error);
    return NextResponse.json({ error: 'Gagal mencipta ayat contoh.' }, { status: 500 });
  }
}
