import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { toTtsPhoneticSpelling } from '@/lib/tts/speechService';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

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
        timeout: 15000,
        cwd: process.cwd(),
      }
    );

    // Save audio into public/audio/
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Safe filename based on headword and entry ID to prevent collisions
    const sanitizedHeadword = entry.headword.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${entry.id}_${sanitizedHeadword}.mp3`;
    const filePath = path.join(audioDir, filename);

    fs.writeFileSync(filePath, stdout);

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

    // Remove file if exists
    if (entry.audioUrl) {
      const cleanPath = entry.audioUrl.split('?')[0];
      const filePath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
