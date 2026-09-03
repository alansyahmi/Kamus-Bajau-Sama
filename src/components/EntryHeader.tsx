'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, CornerDownRight } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { playPhoneticSpeech } from '../lib/tts/speechService';

interface EntryHeaderProps {
  headword: string;
  partOfSpeech: string;
  ipa?: string | null;
  audioUrl?: string | null;
  rootEntry?: {
    headword: string;
    definitionMs: string;
    definitionEn?: string | null;
    affixPattern?: string;
  } | null;
}

export default function EntryHeader({ headword, partOfSpeech, ipa, audioUrl, rootEntry }: EntryHeaderProps) {
  const { t, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    playPhoneticSpeech(
      headword,
      ipa,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      0.85,
      audioUrl
    );
  };

  const rootDefinition =
    language === 'en'
      ? (rootEntry?.definitionEn || rootEntry?.definitionMs)
      : language === 'ms'
      ? rootEntry?.definitionMs
      : rootEntry?.definitionEn
      ? `${rootEntry.definitionMs} (${rootEntry.definitionEn})`
      : rootEntry?.definitionMs;

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="bg-black text-white font-body text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md uppercase">
          {partOfSpeech}
        </span>

        {rootEntry && (
          <Link
            href={`/kamus/${encodeURIComponent(rootEntry.headword)}`}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-md text-[12px] font-body transition-colors group"
            title={`Berasal daripada kata dasar '${rootEntry.headword}'`}
          >
            <CornerDownRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-amber-800 font-normal">Kata Dasar:</span>
            <span className="font-semibold text-amber-950 underline decoration-amber-300 underline-offset-2">
              {rootEntry.headword}
            </span>
            {rootDefinition && (
              <span className="text-amber-800 text-[11px]">({rootDefinition})</span>
            )}
          </Link>
        )}
      </div>

      <h1 className="font-heading text-[36px] sm:text-[48px] md:text-[68px] font-bold text-black leading-[1.1] tracking-tighter mb-2 break-words max-w-full">
        {headword}
      </h1>

      {ipa && (
        <div className="flex items-center gap-3 mt-1">
          <span className="font-heading text-[20px] sm:text-[22px] md:text-[24px] font-normal text-slate-800">
            {ipa}
          </span>
          <button
            type="button"
            onClick={handlePlayAudio}
            title={t.entry_listen_audio}
            aria-label={t.entry_listen_audio}
            className={`w-11 h-11 flex items-center justify-center text-slate-800 hover:text-amber-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-full transition-all hover:scale-105 active:scale-95 ${
              isPlaying ? 'text-amber-600 bg-amber-100 audio-playing-pulse' : ''
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
