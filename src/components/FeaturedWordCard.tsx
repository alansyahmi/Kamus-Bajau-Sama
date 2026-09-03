'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface FeaturedWordData {
  headword: string;
  partOfSpeech: string;
  ipa?: string | null;
  definitionMs: string;
  definitionEn?: string | null;
  exampleBajau?: string;
  exampleMs?: string;
}

export default function FeaturedWordCard() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<FeaturedWordData | null>(null);

  useEffect(() => {
    fetch('/api/search?q=random')
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.headword) setData(resData);
      })
      .catch(console.error);
  }, []);

  if (!data) return null;

  const definition =
    language === 'en'
      ? (data.definitionEn || data.definitionMs)
      : language === 'ms'
      ? data.definitionMs
      : data.definitionEn
      ? `${data.definitionMs} (${data.definitionEn})`
      : data.definitionMs;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-card border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
      {/* Subtle decorative background badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-amber-600 font-body text-[11px] font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.featured_word_title}</span>
        </div>
        <span className="font-body text-[10px] font-bold tracking-wide bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">
          {data.partOfSpeech.split('/')[0].trim()}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <Link
            href={`/kamus/${encodeURIComponent(data.headword)}`}
            className="font-heading text-[28px] md:text-[32px] font-bold text-slate-900 tracking-tighter hover:text-blue-700 transition-colors text-decoration-none"
          >
            {data.headword}
          </Link>
          {data.ipa && (
            <span className="font-heading text-[16px] text-slate-500 font-normal">{data.ipa}</span>
          )}
        </div>

        <p className="font-body text-[15px] font-medium text-slate-800 mb-3 leading-snug">
          {definition}
        </p>

        {data.exampleBajau && (
          <p className="font-heading italic text-[14px] text-slate-600 border-l-2 border-slate-200 pl-2.5 mb-4 line-clamp-2">
            &ldquo;{data.exampleBajau}&rdquo;
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
        <Link
          href={`/kamus/${encodeURIComponent(data.headword)}`}
          className="inline-flex items-center gap-1.5 font-body text-[13px] font-medium text-slate-900 group-hover:text-blue-700 transition-colors"
        >
          <span>Teroka entri penuh</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
