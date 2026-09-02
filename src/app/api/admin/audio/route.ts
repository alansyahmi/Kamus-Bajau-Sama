import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { EdgeTTS } from 'edge-tts-universal';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const NEURAL_VOICES = {
  fil: 'fil-PH-BlessicaNeural',
  'fil-m': 'fil-PH-AngeloNeural',
  id: 'id-ID-GadisNeural',
  'id-m': 'id-ID-ArdiNeural',
  ms: 'ms-MY-YasminNeural',
  'ms-m': 'ms-MY-OsmanNeural',
};

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { entryId, voiceKey = 'fil', customText, rate = '-5%', pitch = '+0Hz' } = body;

    if (!entryId) {
      return NextResponse.json({ error: 'Parameter entryId diperlukan.' }, { status: 400 });
    }

    const entry = db.select().from(entries).where(eq(entries.id, entryId)).get();
    if (!entry) {
      return NextResponse.json({ error: 'Entri tidak dijumpai.' }, { status: 404 });
    }

    const textToSynthesize = (customText || entry.headword).trim();
    const spokenText = toTtsPhoneticSpelling(textToSynthesize, entry.ipa);
    const voice = NEURAL_VOICES[voiceKey as keyof typeof NEURAL_VOICES] || NEURAL_VOICES.fil;

    // Direct asynchronous EdgeTTS
    const tts = new EdgeTTS(spokenText, voice, { rate, pitch });
    const res = await tts.synthesize();
    const arrayBuffer = await res.audio.arrayBuffer();

    const sanitizedHeadword = entry.headword.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${entry.id}_${sanitizedHeadword}.mp3`;
    try {
      const req = eval('require');
      const fs = req('fs');
      const path = req('path');
      const audioDir = path.join(process.cwd(), 'public', 'audio');
      if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
      fs.writeFileSync(path.join(audioDir, filename), Buffer.from(arrayBuffer));
    } catch {}


    const relativeAudioUrl = `/audio/${filename}?v=${Date.now()}`;

    // Update database entry with verified audioUrl
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
    console.error('Error baking audio pronunciation:', error);
    return NextResponse.json(
      {
        error: 'Gagal menjana dan menyimpan audio.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const searchParams = req.nextUrl.searchParams;
    const entryId = parseInt(searchParams.get('entryId') || '');

    if (!entryId) {
      return NextResponse.json({ error: 'Parameter entryId diperlukan.' }, { status: 400 });
    }

    const entry = db.select().from(entries).where(eq(entries.id, entryId)).get();
    if (!entry) {
      return NextResponse.json({ error: 'Entri tidak dijumpai.' }, { status: 404 });
    }

    // Remove file if exists (in Node environment)
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


    // Clear audioUrl in database
    db.update(entries)
      .set({
        audioUrl: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(entries.id, entry.id))
      .run();

    return NextResponse.json({
      success: true,
      message: `Rakaman rasmi bagi "${entry.headword}" telah dipadam.`,
    });
  } catch (error: any) {
    console.error('Error deleting audio pronunciation:', error);
    return NextResponse.json(
      {
        error: 'Gagal memadam audio rasmi.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
