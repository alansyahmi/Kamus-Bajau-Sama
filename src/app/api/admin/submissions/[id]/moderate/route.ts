import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { submissions, entries, senses, examples, dialects, sources } from '@/lib/db/schema';
import { normalizeQuery } from '@/lib/search/searchService';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });

  try {
    const body = await req.json();
    const { action, reviewerNotes, editedWord, editedMeaning, editedPos } = body;

    const sub = db.select().from(submissions).where(eq(submissions.id, id)).get();
    if (!sub) return NextResponse.json({ error: 'Sumbangan tidak dijumpai.' }, { status: 404 });

    if (action === 'approve') {
      const finalWord = (editedWord || sub.headword).trim();
      const finalMeaning = (editedMeaning || sub.meaning).trim();
      const finalPos = (editedPos || 'KATA NAMA').trim();
      const searchNormalized = normalizeQuery(finalWord);

      // 1. Insert into entries
      const newEntry = db.insert(entries).values({
        headword: finalWord,
        searchNormalized,
        partOfSpeech: finalPos,
        ipa: `/${searchNormalized}/`,
      }).returning().get();

      // 2. Insert into senses
      const newSense = db.insert(senses).values({
        entryId: newEntry.id,
        orderIndex: 1,
        definitionMs: finalMeaning,
      }).returning().get();

      // 3. Insert example sentence if provided
      if (sub.exampleSentence) {
        db.insert(examples).values({
          senseId: newSense.id,
          sentenceBajau: sub.exampleSentence.trim(),
          highlightWord: finalWord,
          sentenceMs: `Contoh penggunaan kata ${finalWord}.`,
        }).run();
      }

      // 4. Insert locality if provided
      if (sub.locality) {
        db.insert(dialects).values({
          entryId: newEntry.id,
          localityName: sub.locality.trim(),
          dialectForm: finalWord,
        }).run();
      }

      // 5. Insert provenance source
      const contributor = sub.contributorName?.trim() || 'Sumbangan Komuniti Tanpa Nama';
      db.insert(sources).values({
        entryId: newEntry.id,
        sourceType: 'Sumbangan Komuniti',
        description: `Disumbangkan oleh ${contributor} (${sub.locality || 'Sabah'})`,
        verifiedBy: 'Pentadbir Kamus (Diluluskan)',
      }).run();

      // 6. Update submission record
      db.update(submissions)
        .set({
          status: 'approved',
          notes: reviewerNotes || 'Diluluskan dan ditambah ke pangkalan data rasmi.',
        })
        .where(eq(submissions.id, id))
        .run();

      return NextResponse.json({ success: true, message: 'Sumbangan berjaya diluluskan dan dimasukkan ke dalam kamus!' });

    } else if (action === 'reject') {
      db.update(submissions)
        .set({
          status: 'rejected',
          notes: reviewerNotes || 'Ditolak oleh pentadbir.',
        })
        .where(eq(submissions.id, id))
        .run();

      return NextResponse.json({ success: true, message: 'Sumbangan telah ditandakan sebagai ditolak.' });
    }

    return NextResponse.json({ error: 'Tindakan tidak sah (mesti approve atau reject).' }, { status: 400 });
  } catch (error) {
    console.error('Error moderating submission:', error);
    return NextResponse.json({ error: 'Gagal memproses moderasi sumbangan.' }, { status: 500 });
  }
}
