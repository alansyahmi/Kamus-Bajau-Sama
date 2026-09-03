'use client';

import React from 'react';
import { LexicalSense } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function DefinitionList({ senses }: { senses: LexicalSense[] }) {
  const { t, language } = useLanguage();

  if (!senses || senses.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-body text-[22px] font-medium text-slate-900 tracking-tightest">
        {t.entry_definition}
      </h2>
      <ol className="flex flex-col gap-2.5 list-none p-0 m-0">
        {senses.map((sense, idx) => {
          const isEn = language === 'en';
          const isMs = language === 'ms';
          const showBoth = language === 'bj';

          return (
            <li key={sense.id} className="text-[17px] sm:text-[19px] text-slate-900 font-body leading-relaxed pl-6 relative">
              <span className="font-semibold text-slate-900 absolute left-0 top-0">{idx + 1}.</span>

              {isEn && (
                <span className="font-medium text-slate-900">
                  {sense.definitionEn || sense.definitionMs}
                </span>
              )}

              {isMs && (
                <span className="font-medium text-slate-900">
                  {sense.definitionMs}
                </span>
              )}

              {showBoth && (
                <>
                  <span className="font-medium text-slate-900">{sense.definitionMs}</span>
                  {sense.definitionEn && (
                    <span className="text-[14px] sm:text-[15px] text-slate-500 font-normal ml-2 inline-block">
                      ({sense.definitionEn})
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
