'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2 } from 'lucide-react';
import { LexicalSense } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { playPhoneticSpeech } from '../lib/tts/speechService';
import { tokenizeSentence, cleanBajauWord } from '../lib/linguistics/autoLinker';

interface ExampleBoxProps {
  senses: LexicalSense[];
  currentHeadword?: string;
}

export default function ExampleBox({ senses, currentHeadword }: ExampleBoxProps) {
  const { t } = useLanguage();
  const [playingId, setPlayingId] = useState<number | null>(null);

  const allExamples = senses.flatMap((s) => s.examples || []);
  if (allExamples.length === 0) return null;

  const handlePlaySentence = (exampleId: number, sentenceText: string, audioUrl?: string | null) => {
    if (audioUrl) {
      setPlayingId(exampleId);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        // Fallback to dynamic TTS if audio failed to load
        playPhoneticSpeech(
          sentenceText,
          null,
          () => setPlayingId(exampleId),
          () => setPlayingId(null),
          0.95
        );
      };
      audio.play().catch(() => {
        playPhoneticSpeech(
          sentenceText,
          null,
          () => setPlayingId(exampleId),
          () => setPlayingId(null),
          0.95
        );
      });
      return;
    }

    playPhoneticSpeech(
      sentenceText,
      null,
      () => setPlayingId(exampleId),
      () => setPlayingId(null),
      0.95
    );
  };

  const renderSentenceWithLinks = (sentence: string, highlightWord?: string | null) => {
    const tokens = tokenizeSentence(sentence);
    const targetClean = highlightWord ? cleanBajauWord(highlightWord) : (currentHeadword ? cleanBajauWord(currentHeadword) : '');

    return tokens.map((tok, idx) => {
      // Non-word token (punctuation / spaces)
      if (/^\s+$/.test(tok) || /^[.,!?;:()"—–[\]{}]+$/.test(tok)) {
        return <span key={idx}>{tok}</span>;
      }

      const cleaned = cleanBajauWord(tok);
      const isTarget = targetClean && cleaned.toLowerCase() === targetClean.toLowerCase();

      // If it matches target headword, highlight with pill
      if (isTarget) {
        return (
          <span
            key={idx}
            className="font-bold text-amber-700 dark:text-amber-400 underline decoration-amber-400/60 underline-offset-4 decoration-2"
          >
            {tok}
          </span>
        );
      }

      // Render as subtle clickable dictionary word link
      return (
        <Link
          key={idx}
          href={`/kamus/${encodeURIComponent(cleaned)}`}
          title={`Lihat maksud "${cleaned}"`}
          className="hover:text-amber-700 dark:hover:text-amber-400 hover:underline underline-offset-2 transition-colors inline-block"
        >
          {tok}
        </Link>
      );
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-body text-[22px] font-medium text-slate-900 dark:text-stone-100 tracking-tightest">
        {t.entry_examples}
      </h2>
      <div className="flex flex-col gap-4">
        {allExamples.map((ex, idx) => {
          const isPlaying = playingId === (ex.id || idx);
          const currentId = ex.id || idx;

          return (
            <div
              key={currentId}
              className={`flex flex-col gap-1 p-3 sm:p-3.5 -mx-1 sm:-mx-3.5 rounded-2xl transition-all duration-200 ${
                isPlaying ? 'bg-amber-50/80 dark:bg-amber-950/40 ring-1 ring-amber-200 dark:ring-amber-800' : 'hover:bg-sand-50/50 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading italic text-[17px] sm:text-[18px] text-slate-900 dark:text-stone-100 mb-1 leading-snug">
                  &ldquo;{renderSentenceWithLinks(ex.sentenceBajau, ex.highlightWord)}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => handlePlaySentence(currentId, ex.sentenceBajau, ex.audioUrl)}
                  title="Dengar sebutan contoh ayat"
                  aria-label="Dengar sebutan contoh ayat"
                  className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-full transition-all hover:scale-105 active:scale-95 ${
                    isPlaying
                      ? 'text-amber-600 bg-amber-100 dark:bg-amber-900 scale-105'
                      : 'text-slate-400 hover:text-slate-700 bg-slate-100/60 hover:bg-slate-200/70'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <p className="font-body text-[15px] text-slate-800 dark:text-stone-300">{ex.sentenceMs}</p>
              {ex.sentenceEn && (
                <p className="font-body text-[14px] text-slate-400 dark:text-stone-500">{ex.sentenceEn}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
