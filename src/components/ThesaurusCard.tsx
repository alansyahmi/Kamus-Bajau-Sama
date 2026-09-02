'use client';

import React from 'react';
import Link from 'next/link';
import { LexicalThesaurus } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function ThesaurusCard({ thesaurus }: { thesaurus: LexicalThesaurus[] }) {
  const { t } = useLanguage();

  if (!thesaurus || thesaurus.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl p-5 md:p-6 shadow-card border border-slate-200/60 min-h-[140px]">
      <span className="font-body text-[11px] font-normal tracking-wide text-slate-400 uppercase block mb-3.5">
        {t.entry_thesaurus}
      </span>
      <div className="flex flex-wrap gap-2.5">
        {thesaurus.map((item) => (
          <Link
            key={item.id}
            href={`/kamus/${encodeURIComponent(item.relatedHeadword)}`}
            className="bg-slate-50 border border-slate-200 py-1.5 px-3.5 rounded-full font-body text-[13px] font-medium text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-decoration-none group"
          >
            <span>{item.relatedHeadword}</span>
            {item.relationNote && (
              <span className="text-slate-500 font-normal ml-1 group-hover:text-slate-300">
                ({item.relationNote})
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
