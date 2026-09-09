'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/i18n/LanguageContext';

export interface PronounRow {
  personKey: string;
  personLabel: string;
  meaning: string;
  set1: {
    word: string;
    display: string;
    variants?: string[];
    isEnclitic: boolean;
    note?: string;
  };
  set2: {
    word: string;
    display: string;
    variants?: string[];
  };
  set3: {
    word: string;
    display: string;
    variants?: string[];
  };
}

export const PRONOUN_PARADIGM_ROWS: PronounRow[] = [
  {
    personKey: '1sg',
    personLabel: '1sg (Pertama Tunggal)',
    meaning: 'saya, aku',
    set1: { word: '-ku', display: '-ku', variants: ['ku'], isEnclitic: true },
    set2: { word: 'aku', display: 'aku' },
    set3: { word: 'maku', display: 'maku' },
  },
  {
    personKey: '1pl.incl',
    personLabel: '1pl.incl (Jamak Inklusif)',
    meaning: 'kita (termasuk pendengar)',
    set1: { word: '-ti', display: '-ti', variants: ['ti'], isEnclitic: true },
    set2: { word: 'kiti', display: 'kiti', variants: ['kitei', 'kitai'] },
    set3: { word: 'engkiti', display: 'engkiti' },
  },
  {
    personKey: '1pl.excl',
    personLabel: '1pl.excl (Jamak Eksklusif)',
    meaning: 'kami (tanpa pendengar)',
    set1: { word: 'kami', display: 'kami', isEnclitic: false, note: 'bentuk bebas' },
    set2: { word: 'kami', display: 'kami' },
    set3: { word: 'engkami', display: 'engkami' },
  },
  {
    personKey: '2sg',
    personLabel: '2sg (Kedua Tunggal)',
    meaning: 'kau, kamu, awak',
    set1: { word: '-nu', display: '-nu', variants: ['nu'], isEnclitic: true },
    set2: { word: 'kau', display: 'kau' },
    set3: { word: 'engkau', display: 'engkau' },
  },
  {
    personKey: '2pl',
    personLabel: '2pl (Kedua Jamak)',
    meaning: 'kalian, kamu semua',
    set1: { word: '-bi', display: '-bi', variants: ['bi'], isEnclitic: true },
    set2: { word: 'kaam', display: 'kaam', variants: ['kam'] },
    set3: { word: 'engkaam', display: 'engkaam' },
  },
  {
    personKey: '3sg',
    personLabel: '3sg (Ketiga Tunggal)',
    meaning: 'dia, ia',
    set1: { word: '-ni', display: '-ni', variants: ['ni'], isEnclitic: true },
    set2: { word: 'io', display: 'io', variants: ['iyo'] },
    set3: { word: 'mio', display: 'mio', variants: ['miyo'] },
  },
  {
    personKey: '3pl',
    personLabel: '3pl (Ketiga Jamak)',
    meaning: 'mereka',
    set1: { word: 'gai', display: 'gai', isEnclitic: false, note: 'bentuk bebas' },
    set2: { word: 'gai', display: 'gai' },
    set3: { word: 'enggai', display: 'enggai' },
  },
];

import { isPersonalPronounWord } from '../lib/pronouns';
export { isPersonalPronounWord };

interface PronounParadigmCardProps {
  currentHeadword: string;
}

export default function PronounParadigmCard({ currentHeadword }: PronounParadigmCardProps) {
  const { t } = useLanguage();
  const cleanHeadword = currentHeadword.toLowerCase().trim();

  // Helper to check if a cell matches the current headword
  const isMatch = (item: { word: string; variants?: string[] }, colType?: 'set1' | 'set2' | 'set3') => {
    if (colType === 'set1' && (cleanHeadword === 'kami' || cleanHeadword === 'gai')) {
      // For kami and gai in Set I, highlight only if relevant
      return false;
    }
    if (item.word.toLowerCase() === cleanHeadword) return true;
    if (item.variants?.some((v) => v.toLowerCase() === cleanHeadword)) return true;
    return false;
  };

  return (
    <section className="bg-gradient-to-br from-amber-50/50 via-white to-amber-100/20 rounded-3xl p-5 md:p-7 shadow-card border border-amber-200/80 transition-all">
      {/* Header */}
      <div className="flex flex-col gap-1.5 mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
            <span>📚</span> {t.entry_pronoun_paradigm_kicker}
          </span>
          <span className="text-[11px] font-mono text-stone-400">Miller (2007:88)</span>
        </div>
        <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900">
          {t.entry_pronoun_paradigm_title}
        </h3>
        <p className="font-body text-xs md:text-sm text-stone-600 leading-relaxed max-w-2xl">
          {t.entry_pronoun_paradigm_desc}
        </p>
      </div>

      {/* Interactive Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-amber-200/80 shadow-2xs bg-white">
        <table className="w-full text-left text-xs border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-amber-950 text-white font-medium border-b border-amber-900">
              <th className="py-3 px-3.5 font-semibold tracking-wide text-amber-200">
                Orang &amp; Bilangan
              </th>
              <th className="py-3 px-3 font-semibold tracking-wide">
                <span className="block text-amber-100">Set I: Terikat</span>
                <span className="text-[10px] text-amber-300/80 font-normal">Pemunya / Pelaku</span>
              </th>
              <th className="py-3 px-3 font-semibold tracking-wide">
                <span className="block text-amber-100">Set II: Bebas</span>
                <span className="text-[10px] text-amber-300/80 font-normal">Subjek / Objek</span>
              </th>
              <th className="py-3 px-3 font-semibold tracking-wide">
                <span className="block text-amber-100">Set III: Oblik</span>
                <span className="text-[10px] text-amber-300/80 font-normal">em- + Set II (Sasaran)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100 text-stone-800">
            {PRONOUN_PARADIGM_ROWS.map((row) => {
              const matchSet1 = isMatch(row.set1, 'set1');
              const matchSet2 = isMatch(row.set2, 'set2');
              const matchSet3 = isMatch(row.set3, 'set3');
              const hasRowMatch = matchSet1 || matchSet2 || matchSet3;

              return (
                <tr
                  key={row.personKey}
                  className={`transition-colors ${hasRowMatch ? 'bg-amber-50/70 font-medium' : 'hover:bg-amber-50/30'
                    }`}
                >
                  {/* Person Column */}
                  <td className="py-2.5 px-3.5 border-r border-amber-100/80 bg-amber-50/40">
                    <span className="font-semibold text-stone-900 block text-[12px]">
                      {row.personLabel}
                    </span>
                    <span className="text-[11px] text-stone-500 font-normal block">
                      {row.meaning}
                    </span>
                  </td>

                  {/* Set I: Enclitic Column */}
                  <td
                    className={`py-2.5 px-3.5 border-r border-amber-100/80 transition-colors ${matchSet1 ? 'bg-amber-200/60' : ''}`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      {matchSet1 ? (
                        <span className="text-[14px] font-bold text-amber-950 tracking-tight">
                          {row.set1.display}
                        </span>
                      ) : (
                        <Link
                          href={`/kamus/${encodeURIComponent(row.set1.word)}`}
                          className="text-[13px] font-medium text-stone-800 hover:text-amber-900 hover:underline transition-colors"
                        >
                          {row.set1.display}
                        </Link>
                      )}
                      {row.set1.variants && (
                        <span className="text-[10px] text-stone-400">
                          var: {row.set1.variants.join(', ')}
                        </span>
                      )}
                      {row.set1.note && (
                        <span className="text-[10px] text-amber-700 italic">
                          ({row.set1.note})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Set II: Independent Column */}
                  <td
                    className={`py-2.5 px-3.5 border-r border-amber-100/80 transition-colors ${matchSet2 ? 'bg-amber-200/60' : ''}`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      {matchSet2 ? (
                        <span className="text-[14px] font-bold text-amber-950 tracking-tight">
                          {row.set2.display}
                        </span>
                      ) : (
                        <Link
                          href={`/kamus/${encodeURIComponent(row.set2.word)}`}
                          className="text-[13px] font-medium text-stone-800 hover:text-amber-900 hover:underline transition-colors"
                        >
                          {row.set2.display}
                        </Link>
                      )}
                      {row.set2.variants && (
                        <span className="text-[10px] text-stone-400">
                          var: {row.set2.variants.map((v) => (
                            <Link
                              key={v}
                              href={`/kamus/${encodeURIComponent(v)}`}
                              className="hover:text-amber-800 hover:underline mr-1"
                            >
                              {v}
                            </Link>
                          ))}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Set III: Oblique Column */}
                  <td
                    className={`py-2.5 px-3.5 border-r border-amber-100/80 transition-colors ${matchSet3 ? 'bg-amber-200/60' : ''}`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      {matchSet3 ? (
                        <span className="text-[14px] font-bold text-amber-950 tracking-tight">
                          {row.set3.display}
                        </span>
                      ) : (
                        <Link
                          href={`/kamus/${encodeURIComponent(row.set3.word)}`}
                          className="text-[13px] font-medium text-stone-800 hover:text-amber-900 hover:underline transition-colors"
                        >
                          {row.set3.display}
                        </Link>
                      )}
                      {row.set3.variants && (
                        <span className="text-[10px] text-stone-400">
                          var: {row.set3.variants.map((v) => (
                            <Link
                              key={v}
                              href={`/kamus/${encodeURIComponent(v)}`}
                              className="hover:text-amber-800 hover:underline mr-1"
                            >
                              {v}
                            </Link>
                          ))}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Educational Explanatory Footnotes */}
      <div className="mt-4 pt-3.5 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-stone-600 leading-relaxed">
        <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
          <span className="font-bold text-amber-900 block mb-0.5">Set I (Terikat / Enklitik)</span>
          Melekat pada hujung kata dasar. Menandakan <strong>pemunya</strong> pada kata nama (cth. <em>ruma'-ku</em>) dan <strong>pelaku</strong> pada kata kerja pasif/UV (cth. <em>tekito-ku</em>, <em>buan-nu</em>). Bentuk jamak <em>kami</em> &amp; <em>gai</em> tiada enklitik khusus.
        </div>
        <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
          <span className="font-bold text-amber-900 block mb-0.5">Set II (Bebas / Mandiri)</span>
          Berdiri sendiri tanpa perlu bersambung. Berfungsi sebagai <strong>subjek</strong> ayat aktif (AV) atau <strong>objek</strong> langsung klausa (cth. <em>Aku boi meli buas</em>, <em>Ngini kau mau aku?</em>).
        </div>
        <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
          <span className="font-bold text-amber-900 block mb-0.5">Set III (Oblik / Sasaran)</span>
          Diterbitkan melalui gabungan awalan sendi nama arah <strong>em-</strong> dengan kata ganti Set II (cth. <em>em- + aku → maku</em>). Menandakan sasaran, benefaktif, atau penerima.
        </div>
      </div>
    </section>
  );
}
