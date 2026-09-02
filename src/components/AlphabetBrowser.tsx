'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookA, X } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

const LETTERS = ['A', 'B', 'D', 'G', 'I', 'K', 'L', 'M', 'N', 'NG', 'O', 'P', 'R', 'S', 'T', 'U', 'W', 'Y'];

interface LetterWordItem {
  headword: string;
  partOfSpeech: string;
  definitionMs: string;
}

export default function AlphabetBrowser() {
  const { t } = useLanguage();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [letterWords, setLetterWords] = useState<LetterWordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectLetter = async (letter: string) => {
    setSelectedLetter(letter);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?letter=${encodeURIComponent(letter.toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        setLetterWords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="mt-8 bg-white/70 backdrop-blur-xs rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <BookA className="w-4 h-4 text-slate-500" />
          <span className="font-body text-[12px] font-bold tracking-wide uppercase text-slate-500">
            {t.browse_by_letter}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => handleSelectLetter(letter)}
              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-heading text-[13px] font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:-translate-y-0.5 transition-all shadow-2xs"
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {/* Letter words popup modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-7 max-w-[520px] w-full shadow-dropdown flex flex-col gap-4 max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-[24px] font-bold text-slate-900">{selectedLetter}</span>
                <span className="font-body text-[13px] text-slate-500">({letterWords.length} entri)</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLetter(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-2 max-h-[380px] pr-1">
              {isLoading ? (
                <p className="font-body text-[14px] text-slate-400 py-8 text-center">Memuatkan...</p>
              ) : letterWords.length === 0 ? (
                <p className="font-body text-[14px] text-slate-400 py-8 text-center">
                  Tiada perkataan bermula dengan huruf &ldquo;{selectedLetter}&rdquo; didokumentasikan lagi.
                </p>
              ) : (
                letterWords.map((item) => (
                  <Link
                    key={item.headword}
                    href={`/kamus/${encodeURIComponent(item.headword)}`}
                    onClick={() => setSelectedLetter(null)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all text-decoration-none group"
                  >
                    <span className="font-heading font-bold text-[16px] text-slate-900 group-hover:text-black">
                      {item.headword}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[13px] text-slate-600 truncate max-w-[180px]">
                        {item.definitionMs}
                      </span>
                      <span className="font-body text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                        {item.partOfSpeech.split('/')[0].trim()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLetter(null)}
                className="font-body text-[13px] font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-zinc-800 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
