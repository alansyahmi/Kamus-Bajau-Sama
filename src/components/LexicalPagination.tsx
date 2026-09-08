'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookA } from 'lucide-react';
import { AdjacentHeadword } from '../lib/search/searchService';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface LexicalPaginationProps {
  prev: AdjacentHeadword | null;
  next: AdjacentHeadword | null;
  currentHeadword: string;
}

export default function LexicalPagination({ prev, next, currentHeadword }: LexicalPaginationProps) {
  const { t, language } = useLanguage();

  if (!prev && !next) return null;

  const prevDef =
    language === 'en'
      ? (prev?.definitionEn || prev?.definitionMs)
      : prev?.definitionMs;

  const nextDef =
    language === 'en'
      ? (next?.definitionEn || next?.definitionMs)
      : next?.definitionMs;

  return (
    <nav
      aria-label="Navigasi Leksikal Kata Sebelum dan Seterusnya"
      className="mt-12 pt-8 border-t border-slate-200/80"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Previous Word Link */}
        <div className="flex-1 min-w-0">
          {prev ? (
            <Link
              href={`/kamus/${encodeURIComponent(prev.headword)}`}
              className="group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-card transition-all no-underline text-slate-800"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors flex-shrink-0">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-body text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {t.pagination_prev}
                </span>
                <span className="font-heading text-[16px] sm:text-[17px] font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                  {prev.headword}
                </span>
                {prevDef && (
                  <span className="font-body text-[12px] text-slate-500 truncate max-w-[220px]">
                    {prevDef}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs text-center sm:text-left">
              {t.pagination_start_index}
            </div>
          )}
        </div>

        {/* Middle Quick Alphabet / Browse Link */}
        <div className="flex items-center justify-center flex-shrink-0">
          <Link
            href="/#simak-abjad"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-body font-medium transition-colors no-underline"
            title={t.pagination_alphabet_index}
          >
            <BookA className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.pagination_alphabet_index}</span>
          </Link>
        </div>

        {/* Next Word Link */}
        <div className="flex-1 min-w-0">
          {next ? (
            <Link
              href={`/kamus/${encodeURIComponent(next.headword)}`}
              className="group flex items-center justify-end text-right gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-card transition-all no-underline text-slate-800"
            >
              <div className="flex flex-col min-w-0 text-right">
                <span className="font-body text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {t.pagination_next}
                </span>
                <span className="font-heading text-[16px] sm:text-[17px] font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                  {next.headword}
                </span>
                {nextDef && (
                  <span className="font-body text-[12px] text-slate-500 truncate max-w-[220px]">
                    {nextDef}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors flex-shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs text-center sm:text-right">
              {t.pagination_end_index}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
