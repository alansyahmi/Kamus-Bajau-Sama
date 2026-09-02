import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { examples } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { EdgeTTS } from 'edge-tts-universal';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const NEURAL_VOICES: Record<string, string> = {
  su: 'su-ID-TutiNeural',
  'su-m': 'su-ID-JajangNeural',
  jv: 'jv-ID-SitiNeural',
  'jv-m': 'jv-ID-DimasNeural',
  fil: 'fil-PH-BlessicaNeural',
  'fil-m': 'fil-PH-AngeloNeural',
  id: 'id-ID-GadisNeural',
  'id-m': 'id-ID-ArdiNeural',
  ms: 'ms-MY-YasminNeural',
  'ms-m': 'ms-MY-OsmanNeural',
  ar: 'ar-EG-SalmaNeural',
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });
    }

    const ex = db.select().from(examples).where(eq(examples.id, id)).get();
    if (!ex) {
      return NextResponse.json({ error: 'Ayat contoh tidak dijumpai.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { voiceKey = 'su', customText, rate = '-5%', pitch = '+0Hz' } = body;

    const textToSynthesize = (customText || ex.sentenceBajau).trim();
    const spokenText = toTtsPhoneticSpelling(textToSynthesize, null);
    const voice = NEURAL_VOICES[voiceKey] || NEURAL_VOICES.su;

    // Use pure asynchronous EdgeTTS directly
    const tts = new EdgeTTS(spokenText, voice, { rate, pitch });
    const res = await tts.synthesize();
    const arrayBuffer = await res.audio.arrayBuffer();

    const filename = `ex_${ex.id}.mp3`;
    try {
      const req = eval('require');
      const fs = req('fs');
      const path = req('path');
      const audioDir = path.join(process.cwd(), 'public', 'audio', 'examples');
      if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
      fs.writeFileSync(path.join(audioDir, filename), Buffer.from(arrayBuffer));
    } catch {}


    const relativeAudioUrl = `/audio/examples/${filename}?v=${Date.now()}`;

    db.update(examples)
      .set({
        audioUrl: relativeAudioUrl,
      })
      .where(eq(examples.id, id))
      .run();

    return NextResponse.json({
      success: true,
      audioUrl: relativeAudioUrl,
      message: 'Audio sebutan ayat rasmi berjaya disimpan!',
    });
  } catch (error: any) {
    console.error('Error baking example sentence audio:', error);
    return NextResponse.json(
      {
        error: 'Gagal menjana dan menyimpan audio ayat contoh.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });
    }

    const ex = db.select().from(examples).where(eq(examples.id, id)).get();
    if (!ex) {
      return NextResponse.json({ error: 'Ayat contoh tidak dijumpai.' }, { status: 404 });
    }

    if (ex.audioUrl) {
      try {
        const req = eval('require');
        const fs = req('fs');
        const path = req('path');
        const cleanPath = ex.audioUrl.split('?')[0];
        const filePath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {}
    }


    db.update(examples)
      .set({ audioUrl: null })
      .where(eq(examples.id, id))
      .run();

    return NextResponse.json({ success: true, message: 'Audio rasmi ayat telah dipadam.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memadam audio ayat.' }, { status: 500 });
  }
}
