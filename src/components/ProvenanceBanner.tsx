'use client';

import React, { useState } from 'react';
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
      <div className="flex items-center justify-between bg-white/60 border border-slate-200 rounded-xl p-3 px-4.5 text-[12px] text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-body">
            <strong>{t.entry_source_prefix}</strong> {sourceText}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsSuggestOpen(true)}
          className="bg-white border border-slate-300 text-slate-900 font-body text-[12px] font-medium px-2.5 py-1 rounded-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex-shrink-0 ml-2"
        >
          {t.entry_suggest_btn}
        </button>
      </div>

      <SuggestWordModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        initialWord={headword}
      />
    </>
  );
}
