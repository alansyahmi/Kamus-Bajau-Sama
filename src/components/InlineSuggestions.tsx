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
        className="p-2.5 flex items-center justify-between rounded-md bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
      >
        <span className="font-heading font-bold text-[14px] text-slate-900">
          Tiada padanan untuk &ldquo;{query}&rdquo;
        </span>
        <span className="font-body text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded">
          + Cadangkan perkataan
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full max-h-[220px] overflow-y-auto pr-1">
      {results.map((item) => {
        const displayDef = language === 'en' && item.definitionEn ? item.definitionEn : item.definitionMs;
        const isVariantMatch = !!item.matchedVariant;

        return (
          <Link
            key={item.id}
            href={`/kamus/${encodeURIComponent(item.headword)}`}
            className={`p-2.5 px-3 flex items-center justify-between rounded-md border hover:translate-x-0.5 transition-all text-decoration-none ${
              isVariantMatch
                ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-300'
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-[15px] text-slate-900">{item.headword}</span>
              {isVariantMatch && (
                <span className="inline-flex items-center gap-1 font-body text-[11px] font-normal text-amber-900 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded-full">
                  <span>varian</span>
                  <span className="font-serif font-semibold">&ldquo;{item.matchedVariant?.form}&rdquo;</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body text-[12px] text-slate-600 truncate max-w-[180px]">{displayDef}</span>
              <span className="font-body text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                {item.partOfSpeech.split('/')[0].trim()}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
