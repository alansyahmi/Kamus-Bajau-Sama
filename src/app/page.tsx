'use client';

import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SearchBar from '@/components/SearchBar';
import TrendingChips from '@/components/TrendingChips';
import VocabularyStats from '@/components/VocabularyStats';
import FeaturedWordCard from '@/components/FeaturedWordCard';
import AlphabetBrowser from '@/components/AlphabetBrowser';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col justify-between">
      {/* Top Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center min-h-[calc(70vh-80px)] relative">
        {/* Ambient Coral Glow */}
        <div className="ambient-glow" aria-hidden="true" />

        {/* Left Editorial Headline Column */}
        <div className="relative z-10 max-w-[540px]">
          <h1
            className="font-heading text-[34px] sm:text-[40px] md:text-[46px] font-normal leading-[1.22] text-slate-900 tracking-tighter mb-5"
            dangerouslySetInnerHTML={{ __html: t.hero_title_html }}
          />
          <p className="font-body text-[17px] md:text-[18px] leading-[1.6] text-slate-700 max-w-[460px] tracking-tightest">
            {t.hero_desc}
          </p>

          {/* Live Documented Vocabulary Counter */}
          <VocabularyStats />
        </div>

        {/* Right Search Column */}
        <div className="relative z-10 flex flex-col">
          <SearchBar />
          <TrendingChips />
        </div>
      </section>

      {/* Lower Section: Word of the Day & Alphabet Index */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 mt-12 pt-10 border-t border-slate-200/60 relative z-10 items-start">
        {/* Word of the Day (Pekataan Penean) */}
        <div>
          <FeaturedWordCard />
        </div>

        {/* A-Z Alphabet Browser (Simak Nuut Urup) */}
        <div className="mt-0">
          <AlphabetBrowser />
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="mt-16 pt-6 text-center md:text-left text-[12px] text-slate-400 font-body border-t border-slate-200/40">
        <p>© {new Date().getFullYear()} Kamus Bajau Samah — Inisiatif Pemeliharaan Warisan Bahasa Terbuka.</p>
      </footer>
    </main>
  );
}
