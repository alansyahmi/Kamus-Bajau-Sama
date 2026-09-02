'use client';

import React from 'react';
import { LexicalSense } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function DefinitionList({ senses }: { senses: LexicalSense[] }) {
  const { t } = useLanguage();

  if (!senses || senses.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-body text-[22px] font-medium text-slate-900 tracking-tightest">
        {t.entry_definition}
      </h2>
      <ol className="flex flex-col gap-2.5 list-none p-0 m-0">
        {senses.map((sense, idx) => (
          <li key={sense.id} className="flex items-baseline gap-2.5 text-[19px] text-slate-900 font-body">
            <span className="font-semibold text-slate-900">{idx + 1}.</span>
            <span className="font-medium">{sense.definitionMs}</span>
            {sense.definitionEn && (
              <span className="text-[15px] text-slate-500 font-normal">
                ({sense.definitionEn})
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
