import { NextRequest, NextResponse } from 'next/server';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { EdgeTTS } from 'edge-tts-universal';

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
    const tts = new EdgeTTS(spokenText, voice, {
      rate: rate || '-5%',
      pitch: '+0Hz',
    });
    const res = await tts.synthesize();
    const arrayBuffer = await res.audio.arrayBuffer();

    return new NextResponse(arrayBuffer, {
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

