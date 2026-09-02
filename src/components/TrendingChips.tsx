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
    <div className="flex items-center gap-3 mt-4 pl-1">
      <span className="font-body text-[13px] text-slate-600 font-normal">{t.trending_label}</span>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleClick(chip)}
            className="bg-white border border-slate-200/80 font-body text-[13px] font-normal text-slate-900 px-3.5 py-1 rounded-md shadow-subtle hover:border-slate-900 hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
