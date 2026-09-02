import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { entries, senses, examples, affixes, dialects } from '@/lib/db/schema';
import { normalizeQuery } from '@/lib/search/searchService';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { eq } from 'drizzle-orm';
import { EdgeTTS } from 'edge-tts-universal';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const NEURAL_VOICES = {
  fil: 'fil-PH-BlessicaNeural',
  'fil-m': 'fil-PH-AngeloNeural',
  jv: 'jv-ID-SitiNeural',
  'jv-m': 'jv-ID-DimasNeural',
  su: 'su-ID-TutiNeural',
  'su-m': 'su-ID-JajangNeural',
  id: 'id-ID-GadisNeural',
  'id-m': 'id-ID-ArdiNeural',
  ms: 'ms-MY-YasminNeural',
  'ms-m': 'ms-MY-OsmanNeural',
  ar: 'ar-EG-SalmaNeural',
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });

  try {
    const entry = db.select().from(entries).where(eq(entries.id, id)).get();
    if (!entry) return NextResponse.json({ error: 'Entri tidak dijumpai.' }, { status: 404 });

    const entrySenses = db.select().from(senses).where(eq(senses.entryId, id)).all();
    const entryAffixes = db.select().from(affixes).where(eq(affixes.entryId, id)).all();
    const entryDialects = db.select().from(dialects).where(eq(dialects.entryId, id)).all();

    const sensesWithExamples = entrySenses.map(s => {
      const senseExamples = db.select().from(examples).where(eq(examples.senseId, s.id)).all();
      return { ...s, examples: senseExamples };
    });

    return NextResponse.json({
      ...entry,
      senses: sensesWithExamples,
      affixes: entryAffixes,
      dialects: entryDialects
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json({ error: 'Gagal mendapatkan data entri.' }, { status: 500 });
  }
}

// Bake and save official audio for this entry
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });

  try {
    const body = await req.json();
    const { voiceKey = 'su', customText, rate = '-5%' } = body;

    const entry = db.select().from(entries).where(eq(entries.id, id)).get();
    if (!entry) return NextResponse.json({ error: 'Entri tidak dijumpai.' }, { status: 404 });

    const textToSynthesize = (customText || entry.headword).trim();
    const spokenText = toTtsPhoneticSpelling(textToSynthesize, entry.ipa);
    const voice = NEURAL_VOICES[voiceKey as keyof typeof NEURAL_VOICES] || NEURAL_VOICES.su;

    // Use pure asynchronous EdgeTTS directly
    const tts = new EdgeTTS(spokenText, voice, { rate, pitch: '+0Hz' });
    const res = await tts.synthesize();
    const arrayBuffer = await res.audio.arrayBuffer();

    // In local Node environment, also save to public/audio if possible
    const sanitized = entry.headword.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${entry.id}_${sanitized}.mp3`;
    try {
      const req = eval('require');
      const fs = req('fs');
      const path = req('path');
      const audioDir = path.join(process.cwd(), 'public', 'audio');
      if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
      fs.writeFileSync(path.join(audioDir, filename), Buffer.from(arrayBuffer));
    } catch {}


    const relativeAudioUrl = `/audio/${filename}?v=${Date.now()}`;

    db.update(entries)
      .set({
        audioUrl: relativeAudioUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(entries.id, entry.id))
      .run();

    return NextResponse.json({
      success: true,
      audioUrl: relativeAudioUrl,
      message: `Audio rasmi bagi "${entry.headword}" berjaya disimpan!`,
    });
  } catch (error: any) {
    console.error('Error baking entry audio:', error);
    return NextResponse.json(
      { error: 'Gagal menjana audio rasmi.', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });

  try {
    const body = await req.json();
    const { headword, partOfSpeech, ipa, audioUrl, senses: updatedSenses, affixes: updatedAffixes, dialects: updatedDialects } = body;

    if (!headword || !partOfSpeech) {
      return NextResponse.json({ error: 'Kata dasar dan golongan kata wajib diisi.' }, { status: 400 });
    }

    const searchNormalized = normalizeQuery(headword);

    // 1. Update entry headword, POS, IPA, audioUrl
    db.update(entries)
      .set({
        headword: headword.trim(),
        searchNormalized,
        partOfSpeech: partOfSpeech.trim(),
        ipa: ipa ? ipa.trim() : null,
        audioUrl: audioUrl !== undefined ? audioUrl : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(entries.id, id))
      .run();

    // 2. Update senses and examples if provided
    if (Array.isArray(updatedSenses)) {
      const existingSenseIds = db.select({ id: senses.id }).from(senses).where(eq(senses.entryId, id)).all().map(s => s.id);
      const incomingSenseIds = updatedSenses.map(s => s.id).filter(Boolean) as number[];

      // Delete senses that were removed
      const sensesToDelete = existingSenseIds.filter(sId => !incomingSenseIds.includes(sId));
      for (const sId of sensesToDelete) {
        db.delete(senses).where(eq(senses.id, sId)).run();
      }

      for (let sIdx = 0; sIdx < updatedSenses.length; sIdx++) {
        const s = updatedSenses[sIdx];
        let currentSenseId = s.id;

        if (currentSenseId) {
          db.update(senses)
            .set({
              orderIndex: sIdx + 1,
              definitionMs: s.definitionMs.trim(),
              definitionEn: s.definitionEn?.trim() || null,
            })
            .where(eq(senses.id, currentSenseId))
            .run();
        } else if (s.definitionMs?.trim()) {
          const inserted = db.insert(senses).values({
            entryId: id,
            orderIndex: sIdx + 1,
            definitionMs: s.definitionMs.trim(),
            definitionEn: s.definitionEn?.trim() || null,
          }).returning({ id: senses.id }).get();
          currentSenseId = inserted?.id;
        }

        if (currentSenseId && Array.isArray(s.examples)) {
          const existingExampleIds = db.select({ id: examples.id }).from(examples).where(eq(examples.senseId, currentSenseId)).all().map(e => e.id);
          const incomingExampleIds = (s.examples as Array<{ id?: number }>).map(e => e.id).filter(Boolean) as number[];

          // Delete removed examples
          const examplesToDelete = existingExampleIds.filter(eId => !incomingExampleIds.includes(eId));
          for (const eId of examplesToDelete) {
            db.delete(examples).where(eq(examples.id, eId)).run();
          }

          for (const ex of s.examples) {
            if (ex.id && ex.sentenceBajau?.trim() && ex.sentenceMs?.trim()) {
              db.update(examples)
                .set({
                  sentenceBajau: ex.sentenceBajau.trim(),
                  highlightWord: ex.highlightWord?.trim() || headword.trim(),
                  sentenceMs: ex.sentenceMs.trim(),
                  sentenceEn: ex.sentenceEn?.trim() || null,
                })
                .where(eq(examples.id, ex.id))
                .run();
            } else if (!ex.id && ex.sentenceBajau?.trim() && ex.sentenceMs?.trim()) {
              db.insert(examples).values({
                senseId: currentSenseId,
                sentenceBajau: ex.sentenceBajau.trim(),
                highlightWord: ex.highlightWord?.trim() || headword.trim(),
                sentenceMs: ex.sentenceMs.trim(),
                sentenceEn: ex.sentenceEn?.trim() || null,
              }).run();
            }
          }
        }
      }
    }

    // 3. Update affixes if provided
    if (Array.isArray(updatedAffixes)) {
      db.delete(affixes).where(eq(affixes.entryId, id)).run();
      for (const aff of updatedAffixes) {
        if (aff.term?.trim() && aff.meaningMs?.trim()) {
          db.insert(affixes).values({
            entryId: id,
            term: aff.term.trim(),
            meaningMs: aff.meaningMs.trim(),
            meaningEn: aff.meaningEn?.trim() || null,
          }).run();
        }
      }
    }

    // 4. Update dialects & variants if provided
    if (Array.isArray(updatedDialects)) {
      db.delete(dialects).where(eq(dialects.entryId, id)).run();
      for (const d of updatedDialects) {
        if (d.localityName?.trim() && d.dialectForm?.trim()) {
          db.insert(dialects).values({
            entryId: id,
            localityName: d.localityName.trim(),
            dialectForm: d.dialectForm.trim(),
          }).run();
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Entri berjaya dikemas kini.' });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Gagal mengemas kini entri.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });

  const searchParams = req.nextUrl.searchParams;
  const deleteAudioOnly = searchParams.get('audioOnly') === 'true';

  try {
    const entry = db.select().from(entries).where(eq(entries.id, id)).get();
    if (!entry) return NextResponse.json({ error: 'Entri tidak dijumpai.' }, { status: 404 });

    if (deleteAudioOnly) {
      if (entry.audioUrl) {
        try {
          const req = eval('require');
          const fs = req('fs');
          const path = req('path');
          const cleanPath = entry.audioUrl.split('?')[0];
          const filePath = path.join(process.cwd(), 'public', cleanPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch {}
      }

      db.update(entries).set({ audioUrl: null, updatedAt: new Date().toISOString() }).where(eq(entries.id, id)).run();
      return NextResponse.json({ success: true, message: 'Audio rasmi telah dipadam.' });
    }


    db.delete(entries).where(eq(entries.id, id)).run();
    return NextResponse.json({ success: true, message: 'Entri berjaya dipadam.' });
  } catch (error) {
    console.error('Error deleting entry/audio:', error);
    return NextResponse.json({ error: 'Gagal memproses permintaan pemadaman.' }, { status: 500 });
  }
}
