'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryEntry {
  headword: string;
  partOfSpeech: string;
  definitionMs: string;
}

export default function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/search?q=all')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setEntries(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 max-w-[560px] w-full shadow-dropdown flex flex-col gap-4 max-h-[88vh] sm:max-h-[85vh] pb-safe sm:pb-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading text-[20px] text-slate-900 font-bold">{t.nav_glossary}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col gap-2 pr-1">
          {isLoading ? (
            <p className="font-body text-[14px] text-slate-400 py-6 text-center">Memuatkan senarai...</p>
          ) : entries.length === 0 ? (
            <p className="font-body text-[14px] text-slate-400 py-6 text-center">Tiada entri.</p>
          ) : (
            entries.map((item) => (
              <Link
                key={item.headword}
                href={`/kamus/${encodeURIComponent(item.headword)}`}
                onClick={onClose}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all text-decoration-none group min-h-[50px]"
              >
                <span className="font-heading font-bold text-[16px] text-slate-900 group-hover:text-black">
                  {item.headword}
                </span>
                <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
                  <span className="font-body text-[13px] text-slate-600 truncate max-w-[200px] sm:max-w-[240px]">{item.definitionMs}</span>
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded shrink-0">
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
            onClick={onClose}
            className="font-body text-[14px] font-medium bg-black text-white px-7 py-2.5 rounded-full hover:bg-zinc-800 transition-all min-h-[44px]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
