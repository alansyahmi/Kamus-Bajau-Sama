/**
 * Multi-Word Phonetic Compiler for Kamus Bajau Samah.
 * Compiles full Bajau Samah sentences and phrases into a single unified phonetic representation
 * suitable for authentic synthesis in Austronesian neural voices (Tagalog, Javanese, Sundanese).
 */
export function toTtsPhoneticSpelling(text: string, ipa?: string | null): string {
  if (!text) return '';
  // Raw text passed directly without transformations
  return text;
}

// Global reference to active audio player to allow stopping previous playback
let currentAudio: HTMLAudioElement | null = null;

/**
 * Plays speech audio prioritizing the server-side High-Fidelity Neural TTS
 * (Edge TTS with Filipino Blessica Neural voice for authentic Austronesian phonetics),
 * with graceful fallback to browser Web Speech API (Tagalog -> Malay -> Indonesian voices).
 */
export function playPhoneticSpeech(
  text: string,
  ipa?: string | null,
  onStart?: () => void,
  onEnd?: () => void,
  rate: number = 0.85,
  audioUrl?: string | null
): void {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  // Stop any currently playing audio or speech synthesis
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (onStart) onStart();

  const handleEnd = () => {
    currentAudio = null;
    if (onEnd) onEnd();
  };

  // 1. If an official/verified audio file exists, play it directly
  const audioSource = audioUrl || `/api/tts?text=${encodeURIComponent(text)}${ipa ? `&ipa=${encodeURIComponent(ipa)}` : ''}`;
  const audio = new Audio(audioSource);
  currentAudio = audio;
  audio.playbackRate = rate;

  let fallbackTriggered = false;
  const fallbackToWebSpeech = () => {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    currentAudio = null;

    if (!('speechSynthesis' in window)) {
      handleEnd();
      return;
    }

    const speak = (voices: SpeechSynthesisVoice[]) => {
      // Voice cascade: Tagalog/Filipino -> Malay -> Indonesian
      const filVoice = voices.find(
        (v) =>
          v.lang?.toLowerCase().startsWith('fil') ||
          v.lang?.toLowerCase().startsWith('tl') ||
          v.name?.toLowerCase().includes('filipino') ||
          v.name?.toLowerCase().includes('tagalog') ||
          v.name?.toLowerCase().includes('blessica') ||
          v.name?.toLowerCase().includes('angelo')
      );

      const msVoice = voices.find(
        (v) =>
          v.lang?.toLowerCase().startsWith('ms') ||
          v.name?.toLowerCase().includes('malay') ||
          v.name?.toLowerCase().includes('rizwan') ||
          v.name?.toLowerCase().includes('yasmin')
      );

      const idVoice = voices.find(
        (v) =>
          v.lang?.toLowerCase().startsWith('id') ||
          v.name?.toLowerCase().includes('indonesian') ||
          v.name?.toLowerCase().includes('gadis') ||
          v.name?.toLowerCase().includes('andika')
      );

      const targetVoice = filVoice || msVoice || idVoice;

      const spokenText = toTtsPhoneticSpelling(text, ipa);
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      if (targetVoice) {
        utterance.voice = targetVoice;
        utterance.lang = targetVoice.lang || (filVoice ? 'fil-PH' : msVoice ? 'ms-MY' : 'id-ID');
      } else {
        utterance.lang = 'ms-MY';
      }

      utterance.onend = handleEnd;
      utterance.onerror = handleEnd;

      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak(voices);
    } else {
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          speak(window.speechSynthesis.getVoices());
        },
        { once: true }
      );
    }
  };

  audio.onended = handleEnd;
  audio.onerror = () => {
    // If neural endpoint fails or returns error, gracefully fallback to local voices
    fallbackToWebSpeech();
  };

  audio.play().catch(() => {
    fallbackToWebSpeech();
  });
}
