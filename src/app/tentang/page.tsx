'use client';

import React, { useState } from 'react';
import { BookOpen, ShieldCheck, MapPin } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SuggestWordModal from '@/components/SuggestWordModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col gap-10">
      <SiteHeader />

      {/* About Header Banner */}
      <div className="flex flex-col gap-4 max-w-[840px]">
        <span className="font-body text-[11px] font-normal tracking-wide text-slate-500 uppercase">
          {t.about_kicker}
        </span>
        <h1
          className="font-heading text-[32px] sm:text-[38px] md:text-[42px] font-normal leading-[1.2] text-slate-900 tracking-tighter"
          dangerouslySetInnerHTML={{ __html: t.about_title }}
        />
        <p
          className="font-body text-[17px] leading-[1.65] text-slate-700 mt-1"
          dangerouslySetInnerHTML={{ __html: t.about_lead }}
        />
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
        <div className="bg-white rounded-3xl p-7 shadow-card border border-slate-200/70 flex flex-col gap-3 hover:-translate-y-1 transition-all">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-1.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-body text-[18px] font-semibold text-slate-900 tracking-tightest">
            {t.about_pillar_1_title}
          </h2>
          <p className="font-body text-[14.5px] leading-relaxed text-slate-600">
            {t.about_pillar_1_desc}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-card border border-slate-200/70 flex flex-col gap-3 hover:-translate-y-1 transition-all">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-1.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-body text-[18px] font-semibold text-slate-900 tracking-tightest">
            {t.about_pillar_2_title}
          </h2>
          <p className="font-body text-[14.5px] leading-relaxed text-slate-600">
            {t.about_pillar_2_desc}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-card border border-slate-200/70 flex flex-col gap-3 hover:-translate-y-1 transition-all">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-1.5">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="font-body text-[18px] font-semibold text-slate-900 tracking-tightest">
            {t.about_pillar_3_title}
          </h2>
          <p className="font-body text-[14.5px] leading-relaxed text-slate-600">
            {t.about_pillar_3_desc}
          </p>
        </div>
      </div>

      {/* Editorial Methodology Section */}
      <section className="bg-white rounded-3xl p-8 md:p-9 border border-slate-200 shadow-subtle">
        <div className="flex flex-col gap-3.5 max-w-[800px]">
          <h2 className="font-heading text-[22px] font-bold text-slate-900 tracking-tighter">
            {t.about_methodology_title}
          </h2>
          <p className="font-body text-[15px] leading-relaxed text-slate-700">
            {t.about_methodology_desc}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-2">
            <span className="bg-slate-100 border border-slate-300 text-slate-800 font-body text-[12px] font-medium px-3 py-1 rounded-full">
              Sumber Lisan Penutur Jati
            </span>
            <span className="bg-slate-100 border border-slate-300 text-slate-800 font-body text-[12px] font-medium px-3 py-1 rounded-full">
              Semakan Jawatankuasa Bahasa
            </span>
            <span className="bg-slate-100 border border-slate-300 text-slate-800 font-body text-[12px] font-medium px-3 py-1 rounded-full">
              Variasi Imbuhan & Morfologi
            </span>
            <span className="bg-slate-100 border border-slate-300 text-slate-800 font-body text-[12px] font-medium px-3 py-1 rounded-full">
              Transkripsi Fonetik (IPA)
            </span>
          </div>
        </div>
      </section>

      {/* Community Contribution CTA */}
      <section className="mb-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-9 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-[0_15px_35px_-10px_rgba(15,23,42,0.3)]">
          <div className="max-w-[620px]">
            <h2 className="font-heading text-[24px] font-bold text-white mb-2 tracking-tighter">
              {t.about_cta_title}
            </h2>
            <p className="font-body text-[14.5px] leading-relaxed text-slate-300">
              {t.about_cta_desc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSuggestOpen(true)}
            className="font-body text-[14px] font-medium bg-white text-slate-900 px-7 py-3 rounded-full hover:bg-slate-100 transition-all whitespace-nowrap shadow flex-shrink-0"
          >
            {t.about_cta_btn}
          </button>
        </div>
      </section>

      <SuggestWordModal isOpen={isSuggestOpen} onClose={() => setIsSuggestOpen(false)} />
    </div>
  );
}
