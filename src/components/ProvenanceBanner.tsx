'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Info, BookOpen, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { LexicalSource } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { findReferenceByText, ReferenceItem } from '../lib/data/references';
import SuggestWordModal from './SuggestWordModal';

interface ProvenanceBannerProps {
  sources: LexicalSource[];
  headword: string;
}

export default function ProvenanceBanner({ sources, headword }: ProvenanceBannerProps) {
  const { t } = useLanguage();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const primarySource = sources[0];
  const rawDescription = primarySource?.description || 'Informan Lisan (Kota Belud) • Disemak oleh Penutur Jati';
  const verifiedBy = primarySource?.verifiedBy;

  // Match reference from references database
  const reference: ReferenceItem | null = findReferenceByText(rawDescription);

  // Extract page or note from LSA string, e.g. "Miller (2007:111)" -> "111"
  const lsaPageMatch = rawDescription.match(/Miller\s*\((?:2007:?)([^)]*)\)/i);
  const extractedPages = lsaPageMatch ? lsaPageMatch[1].trim() : null;

  // Additional note after semicolon, e.g. "; kata pinjaman Melayu"
  const semicolonParts = rawDescription.split(';');
  const extraNote = semicolonParts.length > 1 ? semicolonParts.slice(1).join(';').trim() : null;

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPopoverOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPopoverOpen]);

  return (
    <>
      <div className="relative bg-white/80 backdrop-blur-xs border border-slate-200/90 rounded-2xl p-3.5 sm:px-4.5 text-[12px] sm:text-[13px] text-slate-700 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Source Information Line */}
          <div className="flex items-start sm:items-center gap-2.5 flex-wrap">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="font-medium text-slate-500">{t.entry_source_prefix}</span>

            {/* Interactive LSA Citation Trigger */}
            {reference ? (
              <div className="relative inline-block">
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-serif font-bold text-[12.5px] transition shadow-2xs hover:border-amber-400 group cursor-pointer"
                  title="Klik untuk melihat rujukan penuh bibliografi LSA"
                  aria-expanded={isPopoverOpen}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
                  <span>
                    {extractedPages && reference.shortCite.endsWith(')')
                      ? reference.shortCite.replace(/\)$/, `:${extractedPages})`)
                      : `${reference.shortCite}${extractedPages ? `:${extractedPages}` : ''}`}
                  </span>
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded font-sans uppercase font-bold tracking-wider">
                    LSA
                  </span>
                </button>

                {/* Rich Bibliographic Popover */}
                {isPopoverOpen && (
                  <div
                    ref={popoverRef}
                    className="absolute left-0 top-full mt-2.5 z-50 w-[310px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-amber-200/90 p-4 animate-in fade-in-0 zoom-in-95 duration-150 text-slate-800"
                    role="dialog"
                    aria-label="Rujukan Penuh Bibliografi LSA"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-amber-100">
                      <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[12px]">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        <span>Rujukan Bibliografi (Format LSA)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPopoverOpen(false)}
                        className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label="Tutup"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Full LSA Citation */}
                    <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 font-serif text-[12.5px] sm:text-[13px] leading-relaxed text-slate-900">
                      {reference.fullLsaCitation}
                    </div>

                    {/* Page & Note Details */}
                    {extractedPages && (
                      <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-slate-600">
                        <span className="font-semibold text-amber-950">Halaman Dinukil:</span>
                        <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-slate-800">
                          hlm. {extractedPages}
                        </span>
                      </div>
                    )}

                    {extraNote && (
                      <div className="mt-2 text-[12px] bg-slate-50 border border-slate-200/70 rounded-lg p-2 text-slate-700">
                        <span className="font-semibold text-slate-900">Catatan:</span> {extraNote}
                      </div>
                    )}

                    {/* Description */}
                    <p className="mt-2.5 text-[12px] leading-relaxed text-slate-600">
                      {reference.descriptionMs}
                    </p>

                    {/* Footer Actions */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500 font-medium">
                        {reference.locality || 'Sabah'}
                      </span>
                      <Link
                        href={`/rujukan#${reference.id}`}
                        onClick={() => setIsPopoverOpen(false)}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                      >
                        <span>Halaman Bibliografi Penuh</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="font-body text-slate-800 font-medium">{rawDescription}</span>
            )}

            {/* Verified By Badge */}
            {verifiedBy && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{verifiedBy}</span>
              </span>
            )}
          </div>

          {/* Action: Suggest Edit / New Word */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsSuggestOpen(true)}
              className="bg-white border border-slate-300 text-slate-900 font-body text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all min-h-[36px]"
            >
              {t.entry_suggest_btn}
            </button>
          </div>
        </div>
      </div>

      <SuggestWordModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        initialWord={headword}
      />
    </>
  );
}
