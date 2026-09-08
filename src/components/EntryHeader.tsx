'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, CornerDownRight, Share2, Check, Copy } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { formatPartOfSpeech } from '../lib/i18n/translations';
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIpa, setCopiedIpa] = useState(false);

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

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `${headword} — Kamus Bajau Sama`,
          text: `Maksud perkataan "${headword}" dalam Kamus Bajau Sama`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyIpa = async () => {
    if (!ipa) return;
    try {
      await navigator.clipboard.writeText(ipa);
      setCopiedIpa(true);
      setTimeout(() => setCopiedIpa(false), 2000);
    } catch (err) {
      console.error(err);
    }
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
          {formatPartOfSpeech(partOfSpeech, language)}
        </span>

        {rootEntry && (
          <Link
            href={`/kamus/${encodeURIComponent(rootEntry.headword)}`}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-md text-[12px] font-body transition-colors group"
            title={`${t.entry_root_prefix} ${rootEntry.headword}`}
          >
            <CornerDownRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-amber-800 font-normal">{t.entry_root_prefix}</span>
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

      {/* Audio, IPA, and Quick Share bar */}
      <div className="flex items-center gap-3 mt-1 flex-wrap">
        {ipa && (
          <button
            type="button"
            onClick={handleCopyIpa}
            title={t.entry_listen_audio}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/60 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all text-left"
          >
            <span className="font-heading text-[19px] sm:text-[21px] md:text-[23px] font-normal text-slate-800 group-hover:text-amber-900">
              {ipa}
            </span>
            {copiedIpa ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-body font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{t.entry_ipa_copied}</span>
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100" />
            )}
          </button>
        )}

        {ipa && (
          <button
            type="button"
            onClick={handlePlayAudio}
            title={t.entry_listen_audio}
            aria-label={t.entry_listen_audio}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-800 hover:text-amber-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-full transition-all hover:scale-105 active:scale-95 ${
              isPlaying ? 'text-amber-600 bg-amber-100 audio-playing-pulse' : ''
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}

        {/* Share / Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          title={t.entry_share_btn}
          aria-label={t.entry_share_btn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-body text-[12px] font-medium transition-all active:scale-95"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">{t.entry_link_copied}</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.entry_share_btn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
