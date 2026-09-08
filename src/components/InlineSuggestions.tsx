'use client';

import React from 'react';
import Link from 'next/link';
import { SearchResultItem } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { formatPartOfSpeech } from '../lib/i18n/translations';

interface InlineSuggestionsProps {
  results: SearchResultItem[];
  query: string;
  searchMode?: 'bj' | 'ms' | 'en';
  onOpenSuggestModal: (word: string) => void;
}

export default function InlineSuggestions({ results, query, searchMode = 'bj', onOpenSuggestModal }: InlineSuggestionsProps) {
  const { t, language } = useLanguage();

  if (results.length === 0 && query.trim().length > 0) {
    const noMatchText =
      language === 'bj'
        ? searchMode === 'ms'
          ? `Nya' teketo reti Melayu untuk "${query}"`
          : searchMode === 'en'
          ? `Nya' teketo reti Inggeris untuk "${query}"`
          : `Nya' teketo pekotoon Bajau untuk "${query}"`
        : language === 'en'
        ? searchMode === 'ms'
          ? `No Malay meaning matching "${query}"`
          : searchMode === 'en'
          ? `No English definition matching "${query}"`
          : `No Bajau word matching "${query}"`
        : searchMode === 'ms'
        ? `Tiada padanan maksud Melayu untuk "${query}"`
        : searchMode === 'en'
        ? `Tiada definisi Inggeris untuk "${query}"`
        : `Tiada padanan kata Bajau untuk "${query}"`;

    const suggestBtnText =
      language === 'bj'
        ? `+ ${t.nav_suggest} pekotoon`
        : language === 'en'
        ? '+ Suggest word'
        : '+ Cadangkan perkataan';

    return (
      <div
        onClick={() => onOpenSuggestModal(query.trim())}
        className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors min-h-[50px]"
      >
        <span className="font-heading font-bold text-[14px] text-slate-900 leading-snug">
          {noMatchText}
        </span>
        <span className="font-body text-[12px] font-semibold bg-rose-100 text-rose-700 border border-rose-300 px-2.5 py-1 rounded-md shrink-0">
          {suggestBtnText}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full max-h-[260px] overflow-y-auto pr-1">
      {results.map((item) => {
        const displayDef =
          language === 'en'
            ? (item.definitionEn || item.definitionMs)
            : language === 'ms'
            ? item.definitionMs
            : item.definitionEn
            ? `${item.definitionMs} (${item.definitionEn})`
            : item.definitionMs;
        const isVariantMatch = !!item.matchedVariant;
        const isMeaningMatch = item.matchType === 'meaning';

        const SUPERSCRIPTS = ['', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
        const displayHeadword = item.homonymIndex ? `${item.headword}${SUPERSCRIPTS[item.homonymIndex] || ''}` : item.headword;

        return (
          <Link
            key={item.id}
            href={`/kamus/${encodeURIComponent(item.slug || item.headword)}`}
            className={`p-3 px-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 rounded-xl border hover:translate-x-0.5 transition-all text-decoration-none min-h-[50px] ${
              isVariantMatch
                ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-300'
                : isMeaningMatch
                ? 'bg-sky-50/60 border-sky-200/70 hover:bg-sky-100/70 hover:border-sky-300'
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-[16px] text-slate-900 leading-none">{displayHeadword}</span>
              {isVariantMatch && (
                <span className="inline-flex items-center gap-1 font-body text-[11px] font-normal text-amber-900 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded-full">
                  <span>varian</span>
                  <span className="font-serif font-semibold">&ldquo;{item.matchedVariant?.form}&rdquo;</span>
                </span>
              )}
              {isMeaningMatch && (
                <span className="inline-flex items-center font-body text-[10px] font-medium text-sky-800 bg-sky-100/90 border border-sky-300/80 px-2 py-0.5 rounded-full">
                  {searchMode === 'en' ? 'meaning' : 'maksud'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
              <span className="font-body text-[13px] text-slate-600 truncate max-w-[200px] sm:max-w-[220px]">{displayDef}</span>
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded shrink-0">
                {formatPartOfSpeech(item.partOfSpeech, language, true)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
