'use client';

import React from 'react';
import Link from 'next/link';
import { SearchResultItem } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface InlineSuggestionsProps {
  results: SearchResultItem[];
  query: string;
  onOpenSuggestModal: (word: string) => void;
}

export default function InlineSuggestions({ results, query, onOpenSuggestModal }: InlineSuggestionsProps) {
  const { language } = useLanguage();

  if (results.length === 0 && query.trim().length > 0) {
    return (
      <div
        onClick={() => onOpenSuggestModal(query.trim())}
        className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors min-h-[50px]"
      >
        <span className="font-heading font-bold text-[14px] text-slate-900 leading-snug">
          Tiada padanan untuk &ldquo;{query}&rdquo;
        </span>
        <span className="font-body text-[12px] font-semibold bg-rose-100 text-rose-700 border border-rose-300 px-2.5 py-1 rounded-md shrink-0">
          + Cadangkan perkataan
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full max-h-[260px] overflow-y-auto pr-1">
      {results.map((item) => {
        const displayDef = language === 'en' && item.definitionEn ? item.definitionEn : item.definitionMs;
        const isVariantMatch = !!item.matchedVariant;

        return (
          <Link
            key={item.id}
            href={`/kamus/${encodeURIComponent(item.headword)}`}
            className={`p-3 px-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 rounded-xl border hover:translate-x-0.5 transition-all text-decoration-none min-h-[50px] ${
              isVariantMatch
                ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-300'
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-[16px] text-slate-900 leading-none">{item.headword}</span>
              {isVariantMatch && (
                <span className="inline-flex items-center gap-1 font-body text-[11px] font-normal text-amber-900 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded-full">
                  <span>varian</span>
                  <span className="font-serif font-semibold">&ldquo;{item.matchedVariant?.form}&rdquo;</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
              <span className="font-body text-[13px] text-slate-600 truncate max-w-[200px] sm:max-w-[220px]">{displayDef}</span>
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded shrink-0">
                {item.partOfSpeech.split('/')[0].trim()}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
