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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-7 max-w-[560px] w-full shadow-dropdown flex flex-col gap-4 max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading text-[20px] text-slate-900 font-bold">{t.nav_glossary}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
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
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all text-decoration-none group"
              >
                <span className="font-heading font-bold text-[16px] text-slate-900 group-hover:text-black">
                  {item.headword}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-body text-[13px] text-slate-600">{item.definitionMs}</span>
                  <span className="font-body text-[10px] font-semibold tracking-wide bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
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
            className="font-body text-[14px] font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-zinc-800 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
