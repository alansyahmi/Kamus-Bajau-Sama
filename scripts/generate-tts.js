const { EdgeTTS } = require('edge-tts-universal');

(async () => {
  try {
    const text = process.argv[2] || '';
    const voice = process.argv[3] || 'su-ID-TutiNeural';
    const rate = process.argv[4] || '-5%';

    if (!text) {
      process.stderr.write('Missing text parameter');
      process.exit(1);
    }

    const tts = new EdgeTTS(text, voice, { rate, pitch: '+0Hz' });
    const res = await tts.synthesize();
    const buf = Buffer.from(await res.audio.arrayBuffer());
    process.stdout.write(buf);
  } catch (err) {
    process.stderr.write(err?.message || String(err));
    process.exit(1);
  }
})();
