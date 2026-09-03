'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, HelpCircle } from 'lucide-react';
import { LexicalAffix } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function AffixList({ affixes }: { affixes: LexicalAffix[] }) {
  const { t, language } = useLanguage();

  if (!affixes || affixes.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-body text-[22px] font-medium text-slate-900 tracking-tightest">
          {t.entry_affixes}
        </h2>
        <span className="text-[12px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
          {affixes.length} bentuk
        </span>
      </div>

      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {affixes.map((item, idx) => {
          const meaning =
            language === 'en'
              ? (item.meaningEn || item.meaningMs)
              : language === 'ms'
              ? item.meaningMs
              : item.meaningEn
              ? `${item.meaningMs} (${item.meaningEn})`
              : item.meaningMs;
          const isAttested = item.isAttested;
          const displayTerm = item.isTheoretical ? `*${item.term}` : item.term;
          const linkTarget = item.linkedHeadword || item.term;

          return (
            <li
              key={item.id || idx}
              className={`p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 font-body ${
                isAttested
                  ? 'bg-amber-50/40 border-amber-200/70 hover:border-amber-300 hover:bg-amber-50'
                  : 'bg-slate-50/50 border-slate-200/60'
              }`}
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                {isAttested ? (
                  <Link
                    href={`/kamus/${encodeURIComponent(linkTarget)}`}
                    className="group inline-flex items-center gap-1 font-semibold text-slate-950 hover:text-amber-800 transition-colors"
                  >
                    <span>{displayTerm}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ) : (
                  <span
                    className="font-medium text-slate-700 font-mono"
                    title="Bentuk terbitan teoretis / produktif (mengikut rumus tatabahasa Bajau Samah)"
                  >
                    {displayTerm}
                  </span>
                )}

                <span className="text-slate-400 hidden sm:inline">–</span>
                <span className="text-slate-700 text-[15px]">{meaning}</span>
              </div>

              <div className="flex items-center gap-1 self-start sm:self-auto">
                {isAttested ? (
                  <Link
                    href={`/kamus/${encodeURIComponent(linkTarget)}`}
                    className="text-[11px] font-medium text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 hover:bg-amber-200/90 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Lihat Entri</span>
                  </Link>
                ) : (
                  <span
                    className="text-[11px] font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-help"
                    title="Bentuk morfologi produktif (belum didokumentasikan sebagai entri bertulis tersendiri)"
                  >
                    <HelpCircle className="w-3 h-3 text-slate-700" />
                    <span>Bentuk Teoretis</span>
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
