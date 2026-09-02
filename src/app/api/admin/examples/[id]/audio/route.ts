import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { examples } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';

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

    const body = await req.json();
    const { voiceKey = 'su', customText, rate = '-5%', pitch = '+0Hz' } = body;

    const textToSynthesize = (customText || ex.sentenceBajau).trim();
    const spokenText = toTtsPhoneticSpelling(textToSynthesize, null);
    const voice = NEURAL_VOICES[voiceKey] || NEURAL_VOICES.su;

    const script = `
      const { EdgeTTS } = require('edge-tts-universal');
      (async () => {
        try {
          const tts = new EdgeTTS(process.argv[1], process.argv[2], { rate: process.argv[3] || '-5%', pitch: process.argv[4] || '+0Hz' });
          const res = await tts.synthesize();
          const buf = Buffer.from(await res.audio.arrayBuffer());
          process.stdout.write(buf);
        } catch (err) {
          process.stderr.write(err?.message || String(err));
          process.exit(1);
        }
      })();
    `;

    const { stdout } = await execFileAsync(
      process.execPath,
      ['-e', script, spokenText, voice, rate, pitch],
      {
        encoding: 'buffer',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 20000,
        cwd: process.cwd(),
      }
    );

    // Save audio into public/audio/examples/
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'examples');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filename = `ex_${ex.id}.mp3`;
    const filePath = path.join(audioDir, filename);
    fs.writeFileSync(filePath, stdout);

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
      const cleanPath = ex.audioUrl.split('?')[0];
      const filePath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete audio file:', e);
        }
      }
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
