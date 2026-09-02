import { NextRequest, NextResponse } from 'next/server';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

// Edge Neural Voices mapping prioritizing Austronesian & Glottal models (Tagalog, Javanese, Sundanese, Indonesian, Malay, Arabic)
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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const text = searchParams.get('text')?.trim() || '';
  const ipa = searchParams.get('ipa')?.trim() || '';
  const voiceKey = (searchParams.get('voice') || searchParams.get('lang') || 'su') as keyof typeof NEURAL_VOICES;
  const rate = searchParams.get('rate') || '-5%';

  if (!text) {
    return NextResponse.json({ error: 'Parameter text diperlukan.' }, { status: 400 });
  }

  const voice = NEURAL_VOICES[voiceKey] || NEURAL_VOICES.su;
  const spokenText = toTtsPhoneticSpelling(text, ipa);

  try {
    const script = `
      const { EdgeTTS } = require('edge-tts-universal');
      (async () => {
        try {
          const tts = new EdgeTTS(process.argv[1], process.argv[2], { rate: process.argv[3] || '-5%', pitch: '+0Hz' });
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
      ['-e', script, spokenText, voice, rate],
      {
        encoding: 'buffer',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 10000,
        cwd: process.cwd(),
      }
    );

    return new NextResponse(stdout as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error generating Edge Neural TTS audio:', error);
    return NextResponse.json(
      {
        error: 'Gagal menjana audio TTS.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
