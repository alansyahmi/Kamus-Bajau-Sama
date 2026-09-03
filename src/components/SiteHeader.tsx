'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, PlusCircle, Info } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SuggestWordModal from './SuggestWordModal';

interface SiteHeaderProps {
  showSearch?: boolean;
}

export default function SiteHeader({ showSearch = false }: SiteHeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Focus mobile search when toggled
  useEffect(() => {
    if (isMobileSearchExpanded) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [isMobileSearchExpanded]);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      setIsMobileSearchExpanded(false);
      setIsMobileMenuOpen(false);
      router.push(`/kamus/${encodeURIComponent(navSearchQuery.trim().toLowerCase())}`);
    }
  };

  return (
    <>
      <header className={`z-20 relative transition-all ${showSearch ? 'mb-6 md:mb-10' : 'mb-8 md:mb-16'}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo: Icon on Tab & Mobile, Text on Desktop */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center no-underline text-slate-900 whitespace-nowrap flex-shrink-0 group"
            aria-label="Kamus Bajau Sama"
          >
            {/* Tab & Mobile Version: Icon replacing text */}
            <div className="lg:hidden flex items-center">
              <Image
                src="/icon.png"
                alt="Kamus Bajau Sama"
                width={40}
                height={40}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm group-hover:scale-105 active:scale-95 transition-transform"
                priority
              />
            </div>

            {/* Desktop Version: Text title without icon */}
            <div className="hidden lg:inline-flex items-baseline gap-1.5 text-[22px]">
              <span className="font-body font-normal tracking-sans">Kamus</span>
              <span className="font-heading font-bold tracking-serif">Bajau Sama</span>
            </div>
          </Link>

          {/* Desktop Integrated Search (shown only on md+ when showSearch is true) */}
          {showSearch && (
            <form
              onSubmit={handleNavSearch}
              className="hidden md:flex relative items-center bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 w-[260px] lg:w-[320px] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.06)] transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder={t.nav_search_placeholder}
                className="bg-transparent border-none outline-none font-body text-[13px] text-slate-900 w-full placeholder:text-slate-400"
              />
            </form>
          )}

          {/* Desktop Navigation Links + Language Switcher */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => setIsSuggestOpen(true)}
              className="font-body text-[15px] lg:text-[16px] text-slate-800 hover:text-black hover:font-medium transition-colors"
            >
              {t.nav_suggest}
            </button>
            <Link
              href="/tentang"
              className="font-body text-[15px] lg:text-[16px] text-slate-800 hover:text-black hover:font-medium transition-colors"
            >
              {t.nav_about}
            </Link>

            <LanguageSwitcher />
          </nav>

          {/* Mobile Actions (Language Switcher + Search Toggle + Hamburger) */}
          <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
            {/* Inline Language Switcher on mobile */}
            <LanguageSwitcher />

            {/* Mobile Search Toggle (if on page with search enabled) */}
            {showSearch && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchExpanded(!isMobileSearchExpanded);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                  isMobileSearchExpanded
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                aria-label={isMobileSearchExpanded ? 'Tutup carian' : 'Buka carian'}
              >
                {isMobileSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            )}

            {/* Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileSearchExpanded(false);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        {showSearch && isMobileSearchExpanded && (
          <form
            onSubmit={handleNavSearch}
            className="md:hidden mt-3 flex items-center bg-white border border-slate-300 rounded-2xl px-4 py-2 shadow-card animate-in slide-in-from-top-2 duration-150"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder={t.nav_search_placeholder}
              className="bg-transparent border-none outline-none font-body text-[16px] text-slate-900 w-full placeholder:text-slate-400"
            />
            {navSearchQuery && (
              <button
                type="button"
                onClick={() => setNavSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="Padam"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        )}

        {/* Mobile Navigation Drawer / Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-dropdown border border-slate-200/80 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSuggestOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-left font-body text-[16px] text-slate-800 transition-colors"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{t.nav_suggest}</span>
            </button>

            <Link
              href="/tentang"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-left font-body text-[16px] text-slate-800 transition-colors text-decoration-none"
            >
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>{t.nav_about}</span>
            </Link>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <SuggestWordModal isOpen={isSuggestOpen} onClose={() => setIsSuggestOpen(false)} />
    </>
  );
}

