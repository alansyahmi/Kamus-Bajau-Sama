'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, ArrowLeft, Lightbulb } from 'lucide-react';
import SuggestWordModal from './SuggestWordModal';
import { SearchResultItem } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { formatPartOfSpeech } from '../lib/i18n/translations';

interface EntryNotFoundProps {
  word: string;
  suggestions: SearchResultItem[];
}

export default function EntryNotFound({ word, suggestions }: EntryNotFoundProps) {
  const { t, language } = useLanguage();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4 max-w-[620px] mx-auto w-full">
        {/* Status Badge */}
        <span className="font-body text-[11px] font-bold text-amber-800 tracking-wide uppercase bg-amber-50 border border-amber-200/90 px-3.5 py-1.5 rounded-full mb-4 inline-flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {t.notfound_badge}
        </span>

        {/* Not Found Headword */}
        <h1 className="font-heading text-[36px] sm:text-[46px] font-bold text-slate-900 mb-3 tracking-tighter">
          &ldquo;{word}&rdquo;
        </h1>

        <p className="font-body text-[15px] sm:text-[16px] text-slate-600 mb-8 leading-relaxed max-w-[500px]">
          {t.notfound_desc}
        </p>

        {/* Action Buttons: Direct Suggest + Back to Home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-10">
          <button
            type="button"
            onClick={() => setIsSuggestOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-body text-[14.5px] font-semibold bg-black text-white px-7 py-3.5 rounded-2xl hover:bg-zinc-800 hover:shadow-card transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>{t.notfound_suggest_btn}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-body text-[14.5px] font-medium bg-white text-slate-700 border border-slate-300 px-6 py-3.5 rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all no-underline"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>{t.notfound_home_btn}</span>
          </Link>
        </div>

        {/* Did You Mean / Spelling Suggestions */}
        {suggestions.length > 0 && (
          <div className="w-full bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle text-left">
            <div className="flex items-center gap-2 mb-3 text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-body text-[13px] font-semibold text-slate-800">
                {t.notfound_did_you_mean}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/kamus/${encodeURIComponent(item.headword)}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-slate-400 bg-slate-50/50 hover:bg-white transition-all no-underline text-slate-900 group"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-heading text-[15px] font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                      {item.headword}
                    </span>
                    {(language === 'en' && item.definitionEn ? item.definitionEn : item.definitionMs) && (
                      <span className="font-body text-[12px] text-slate-500 truncate">
                        {language === 'en' && item.definitionEn ? item.definitionEn : item.definitionMs}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                    {formatPartOfSpeech(item.partOfSpeech, language, true)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggest Word Modal Prepopulated */}
      <SuggestWordModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        initialWord={word}
      />
    </>
  );
}
