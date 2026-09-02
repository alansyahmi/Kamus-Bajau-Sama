'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SuggestWordModal from './SuggestWordModal';
import GlossaryModal from './GlossaryModal';

interface SiteHeaderProps {
  showSearch?: boolean;
}

export default function SiteHeader({ showSearch = false }: SiteHeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      router.push(`/kamus/${encodeURIComponent(navSearchQuery.trim().toLowerCase())}`);
    }
  };

  return (
    <>
      <header className={`flex items-center justify-between z-20 relative ${showSearch ? 'mb-10' : 'mb-16'}`}>
        {/* Brand Logo */}
        <Link href="/" className="inline-flex items-baseline gap-1.5 text-[22px] no-underline text-slate-900">
          <span className="font-body font-normal tracking-sans">Kamus</span>
          <span className="font-heading font-bold tracking-serif">Bajau Sama</span>
        </Link>

        {/* Integrated Entry Navbar Search */}
        {showSearch && (
          <form onSubmit={handleNavSearch} className="relative flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 w-[260px] md:w-[300px] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.06)] transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder={t.nav_search_placeholder}
              className="bg-transparent border-none outline-none font-body text-[13px] text-slate-900 w-full"
            />
          </form>
        )}

        {/* Navigation Links + Language Switcher */}
        <nav className="flex items-center gap-7" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setIsGlossaryOpen(true)}
            className="font-body text-[16px] text-slate-800 hover:text-black hover:font-medium transition-colors"
          >
            {t.nav_glossary}
          </button>
          <button
            type="button"
            onClick={() => setIsSuggestOpen(true)}
            className="font-body text-[16px] text-slate-800 hover:text-black hover:font-medium transition-colors"
          >
            {t.nav_suggest}
          </button>
          <Link
            href="/tentang"
            className="font-body text-[16px] text-slate-800 hover:text-black hover:font-medium transition-colors"
          >
            {t.nav_about}
          </Link>

          <LanguageSwitcher />
        </nav>
      </header>

      {/* Global Modals */}
      <SuggestWordModal isOpen={isSuggestOpen} onClose={() => setIsSuggestOpen(false)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </>
  );
}
