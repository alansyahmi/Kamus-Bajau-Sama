'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { LexicalSource } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import SuggestWordModal from './SuggestWordModal';

interface ProvenanceBannerProps {
  sources: LexicalSource[];
  headword: string;
}

export default function ProvenanceBanner({ sources, headword }: ProvenanceBannerProps) {
  const { t } = useLanguage();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const primarySource = sources[0];
  const sourceText = primarySource
    ? `${primarySource.description}${primarySource.verifiedBy ? ` • Disemak oleh ${primarySource.verifiedBy}` : ''}`
    : 'Informan Lisan (Kota Belud) • Disemak oleh Penutur Jati';

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/70 border border-slate-200 rounded-2xl p-3.5 sm:px-4.5 text-[12px] sm:text-[13px] text-slate-600">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="font-body leading-relaxed">
            <strong>{t.entry_source_prefix}</strong> {sourceText}
          </span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <Link
            href={`/admin/${encodeURIComponent(headword)}`}
            target="_blank"
            title="Buka terus di editor pentadbir"
            className="hidden sm:inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 font-body text-[11px] font-medium px-2 py-1 rounded-md transition-all text-decoration-none"
          >
            <span>⚙️</span>
            <span>Sunting</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSuggestOpen(true)}
            className="bg-white border border-slate-300 text-slate-900 font-body text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all min-h-[36px]"
          >
            {t.entry_suggest_btn}
          </button>
        </div>
      </div>

      <SuggestWordModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        initialWord={headword}
      />
    </>
  );
}
