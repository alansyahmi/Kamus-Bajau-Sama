'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, PlusCircle, Info, Heart } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { SearchResultItem } from '../lib/types';
import LanguageSwitcher from './LanguageSwitcher';
import SuggestWordModal from './SuggestWordModal';
import SupportModal from './SupportModal';

interface SiteHeaderProps {
  showSearch?: boolean;
}

export default function SiteHeader({ showSearch = false }: SiteHeaderProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestInitialWord, setSuggestInitialWord] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search query for autocomplete suggestions (max 5)
  useEffect(() => {
    if (!showSearch) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = navSearchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SearchResultItem[] = await res.json();
          setSuggestions((data || []).slice(0, 5));
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error('Nav search suggestions failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [navSearchQuery, showSearch]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !desktopSearchContainerRef.current?.contains(target) &&
        !mobileSearchContainerRef.current?.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile search when toggled
  useEffect(() => {
    if (isMobileSearchExpanded) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [isMobileSearchExpanded]);

  const handleSelectSuggestion = (headword: string) => {
    setIsDropdownOpen(false);
    setIsMobileSearchExpanded(false);
    setNavSearchQuery('');
    router.push(`/kamus/${encodeURIComponent(headword)}`);
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = navSearchQuery.trim();
    if (trimmed) {
      setIsDropdownOpen(false);
      setIsMobileSearchExpanded(false);
      setIsMobileMenuOpen(false);
      if (suggestions.length > 0) {
        router.push(`/kamus/${encodeURIComponent(suggestions[0].headword)}`);
      } else {
        router.push(`/kamus/${encodeURIComponent(trimmed.toLowerCase())}`);
      }
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
            <div ref={desktopSearchContainerRef} className="hidden md:block relative">
              <form
                onSubmit={handleNavSearch}
                className="flex relative items-center bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 w-[260px] lg:w-[320px] focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.06)] transition-all"
              >
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={navSearchQuery}
                  onFocus={() => {
                    if (navSearchQuery.trim()) setIsDropdownOpen(true);
                  }}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  placeholder={t.nav_search_placeholder}
                  className="bg-transparent border-none outline-none font-body text-[13px] text-slate-900 w-full placeholder:text-slate-400"
                  autoComplete="off"
                />
                {navSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearchQuery('');
                      setSuggestions([]);
                      setIsDropdownOpen(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 ml-1 shrink-0"
                    aria-label="Padam"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Desktop Suggestions Dropdown (Max 5 results) */}
              {isDropdownOpen && navSearchQuery.trim() && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-[300px] lg:w-[360px] bg-white border border-slate-200/90 rounded-2xl shadow-dropdown z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {isSearching ? (
                    <div className="py-4 text-center text-slate-400 font-body text-[12.5px]">
                      Mencari cadangan...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Cadangan Carian (Maks. 5)
                      </div>
                      {suggestions.map((item) => {
                        const displayDef =
                          language === 'en'
                            ? item.definitionEn || item.definitionMs
                            : language === 'ms'
                            ? item.definitionMs
                            : item.definitionEn
                            ? `${item.definitionMs} (${item.definitionEn})`
                            : item.definitionMs;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(item.headword)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 group"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-heading font-bold text-[14px] text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                                {item.headword}
                              </span>
                              <span className="font-body text-[12px] text-slate-500 truncate">
                                {displayDef}
                              </span>
                            </div>
                            <span className="font-body text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              {item.partOfSpeech.split('/')[0].trim()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-2.5 text-left">
                      <p className="font-body text-[12.5px] text-slate-500 mb-2">
                        Tiada padanan leksikal untuk &ldquo;{navSearchQuery.trim()}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSuggestInitialWord(navSearchQuery.trim());
                          setIsSuggestOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-body text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Cadang perkataan ini</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop Navigation Links + Language Switcher */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
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

            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="font-body text-[14px] lg:text-[15px] text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 px-3 py-1 rounded-full transition-all flex items-center gap-1.5 font-medium shadow-xs"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{t.support_nav}</span>
            </button>

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
          <div ref={mobileSearchContainerRef} className="md:hidden mt-3 relative">
            <form
              onSubmit={handleNavSearch}
              className="flex items-center bg-white border border-slate-300 rounded-2xl px-4 py-2 shadow-card animate-in slide-in-from-top-2 duration-150"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={navSearchQuery}
                onFocus={() => {
                  if (navSearchQuery.trim()) setIsDropdownOpen(true);
                }}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder={t.nav_search_placeholder}
                className="bg-transparent border-none outline-none font-body text-[16px] text-slate-900 w-full placeholder:text-slate-400"
                autoComplete="off"
              />
              {navSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setNavSearchQuery('');
                    setSuggestions([]);
                    setIsDropdownOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 ml-1 shrink-0"
                  aria-label="Padam"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Mobile Suggestions Dropdown (Max 5 results) */}
            {isDropdownOpen && navSearchQuery.trim() && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200/90 rounded-2xl shadow-dropdown z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {isSearching ? (
                  <div className="py-4 text-center text-slate-400 font-body text-[13px]">
                    Mencari cadangan...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Cadangan Carian (Maks. 5)
                    </div>
                    {suggestions.map((item) => {
                      const displayDef =
                        language === 'en'
                          ? item.definitionEn || item.definitionMs
                          : language === 'ms'
                          ? item.definitionMs
                          : item.definitionEn
                          ? `${item.definitionMs} (${item.definitionEn})`
                          : item.definitionMs;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item.headword)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 group"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-heading font-bold text-[15px] text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                              {item.headword}
                            </span>
                            <span className="font-body text-[12.5px] text-slate-500 truncate">
                              {displayDef}
                            </span>
                          </div>
                          <span className="font-body text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {item.partOfSpeech.split('/')[0].trim()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-2.5 text-left">
                    <p className="font-body text-[13px] text-slate-500 mb-2">
                      Tiada padanan leksikal untuk &ldquo;{navSearchQuery.trim()}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSuggestInitialWord(navSearchQuery.trim());
                        setIsSuggestOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-body text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Cadang perkataan ini</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation Drawer / Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-dropdown border border-slate-200/80 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSuggestInitialWord('');
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

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSupportOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 text-left font-body text-[16px] text-rose-800 transition-colors"
            >
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 flex-shrink-0" />
              <span>{t.support_nav}</span>
            </button>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <SuggestWordModal
        isOpen={isSuggestOpen}
        onClose={() => {
          setIsSuggestOpen(false);
          setSuggestInitialWord('');
        }}
        initialWord={suggestInitialWord}
      />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </>
  );
}

