'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Dices, History, Trash2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { SearchResultItem } from '../lib/types';
import InlineSuggestions from './InlineSuggestions';
import SuggestWordModal from './SuggestWordModal';

interface SearchBarProps {
  initialQuery?: string;
  onSelectWord?: (word: string) => void;
}

export default function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestInitialWord, setSuggestInitialWord] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches and detect OS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.userAgent.toUpperCase().includes('MAC'));
      try {
        const saved = localStorage.getItem('kamus_recent_searches');
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Global Keyboard Shortcut: Cmd/Ctrl + K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search fetch failed', err);
      }
    }, 120);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const saveRecentSearch = (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter((w) => w !== clean)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('kamus_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('kamus_recent_searches');
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    saveRecentSearch(clean);

    if (results.length > 0) {
      router.push(`/kamus/${encodeURIComponent(results[0].headword)}`);
    } else {
      router.push(`/kamus/${encodeURIComponent(clean)}`);
    }
  };

  const handleRandomWord = async () => {
    try {
      const res = await fetch('/api/search?q=random');
      if (res.ok) {
        const data = await res.json();
        if (data && data.headword) {
          router.push(`/kamus/${encodeURIComponent(data.headword)}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSuggestModal = (word: string) => {
    setSuggestInitialWord(word);
    setIsSuggestModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-card border border-white/80 relative flex flex-col min-h-[250px]">
        {/* Header Label + Random Button */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-[11px] font-normal tracking-wide text-slate-400 uppercase">
            {t.search_label}
          </span>
          <button
            type="button"
            onClick={handleRandomWord}
            className="inline-flex items-center gap-1.5 font-body text-[12px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full transition-all"
            title="Buka perkataan rawak"
          >
            <Dices className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.random_word_btn}</span>
          </button>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-1 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all"
        >
          <Search className="w-5 h-5 text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full bg-transparent border-none outline-none font-body text-[15px] text-slate-900 py-2.5 placeholder:text-slate-400 placeholder:font-light"
            autoComplete="off"
            aria-label="Cari perkataan"
          />

          {/* Shortcut indicator when empty */}
          {!query && (
            <kbd className="hidden sm:inline-flex items-center font-mono text-[11px] text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded mr-1">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-800 p-1 transition-colors"
              aria-label="Padam teks"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Dynamic Search Content (Recent Searches / Suggestions / Hint) */}
        <div className="flex-1 flex flex-col justify-center py-4 min-h-[100px] transition-all">
          {query.trim().length > 0 ? (
            <InlineSuggestions
              results={results}
              query={query}
              onOpenSuggestModal={handleOpenSuggestModal}
            />
          ) : isInputFocused && recentSearches.length > 0 ? (
            /* Recent Searches (Pemiaan Bau-bau) */
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-body uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3" /> {t.recent_searches_title}
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="hover:text-slate-700 flex items-center gap-0.5 capitalize font-normal"
                >
                  <Trash2 className="w-3 h-3" /> {t.clear_recent_btn}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      setQuery(word);
                      saveRecentSearch(word);
                      router.push(`/kamus/${encodeURIComponent(word)}`);
                    }}
                    className="font-body text-[13px] bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1 rounded-md hover:bg-slate-100 hover:border-slate-300 transition-all"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-body text-[13.5px] text-slate-400 font-light leading-relaxed">
              {t.search_hint}
            </p>
          )}
        </div>

        {/* Card Bottom Actions */}
        <div className="flex items-center justify-end gap-4 mt-auto pt-2.5 border-t border-slate-50">
          <button
            type="button"
            onClick={handleClear}
            className="font-body text-[14px] font-medium text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t.btn_clear}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="font-body text-[14px] font-medium bg-black text-white px-7 py-2 rounded-full hover:bg-zinc-800 shadow-sm hover:shadow transition-all"
          >
            {t.btn_search}
          </button>
        </div>
      </div>

      <SuggestWordModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        initialWord={suggestInitialWord}
      />
    </>
  );
}
