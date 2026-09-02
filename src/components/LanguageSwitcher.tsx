'use client';

import React from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LanguageCode } from '../lib/types';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const options: Array<{ code: LanguageCode; label: string }> = [
    { code: 'ms', label: 'MS' },
    { code: 'bj', label: 'BJ' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div
      className="inline-flex items-center bg-[#eff0f3] rounded-full p-[3px] gap-[2px] border border-[#e2e8f0]"
      role="group"
      aria-label="Language switcher"
    >
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLanguage(opt.code)}
          className={`font-body text-[11px] font-semibold tracking-wide py-1 px-2.5 rounded-full transition-all duration-150 leading-none ${
            language === opt.code
              ? 'bg-white text-slate-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
