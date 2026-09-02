'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface TrendingChipsProps {
  onSelectWord?: (word: string) => void;
}

export default function TrendingChips({ onSelectWord }: TrendingChipsProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const chips = ['mangan', 'tilau', 'oron', "boe'"];

  const handleClick = (word: string) => {
    if (onSelectWord) {
      onSelectWord(word);
    } else {
      router.push(`/kamus/${encodeURIComponent(word)}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 pl-0.5">
      <span className="font-body text-[11px] sm:text-[13px] text-slate-500 font-medium uppercase tracking-wide shrink-0">
        {t.trending_label}
      </span>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:overflow-visible sm:flex-wrap sm:pb-0">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleClick(chip)}
            className="bg-white border border-slate-200/90 font-body text-[13px] font-medium text-slate-900 px-3.5 py-1.5 rounded-xl shadow-subtle hover:border-slate-900 hover:bg-slate-50 hover:-translate-y-0.5 transition-all shrink-0 min-h-[36px]"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
