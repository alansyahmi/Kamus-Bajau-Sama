import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getEntriesByHeadword } from '@/lib/search/searchService';
import SiteHeader from '@/components/SiteHeader';
import EntryHeader from '@/components/EntryHeader';
import AffixList from '@/components/AffixList';
import DialectList from '@/components/DialectList';
import DefinitionList from '@/components/DefinitionList';
import ExampleBox from '@/components/ExampleBox';
import ThesaurusCard from '@/components/ThesaurusCard';
import ProvenanceBanner from '@/components/ProvenanceBanner';
import SuggestWordModal from '@/components/SuggestWordModal';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface EntryPageProps {
  params: {
    word: string;
  };
}

// Superscript numerals for homonym indexing
const SUPERSCRIPTS = ['', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const word = decodeURIComponent(params.word);
  const allEntries = await getEntriesByHeadword(word);

  if (allEntries.length === 0) {
    return {
      title: `"${word}" — Kamus Bajau Sama`,
      description: `Perkataan "${word}" belum didokumentasikan dalam Kamus Bajau Sama. Cadangkan perkataan ini.`,
    };
  }

  const first = allEntries[0];
  const def = first.senses[0]?.definitionMs || '';
  const homonymNote = allEntries.length > 1 ? ` (${allEntries.length} maksud berlainan)` : '';
  return {
    title: `${first.headword}${homonymNote} — Kamus Bajau Sama`,
    description: `Maksud perkataan ${first.headword}: ${def}. Lihat sebutan IPA, terbitan imbuhan, dan variasi dialek.`,
  };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const word = decodeURIComponent(params.word);
  const allEntries = await getEntriesByHeadword(word);

  if (allEntries.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <SiteHeader showSearch={true} />

        <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-[560px] mx-auto">
          <span className="font-body text-[12px] font-bold text-rose-600 tracking-wide uppercase bg-rose-50 border border-rose-200 px-3 py-1 rounded-full mb-4">
            Perkataan Belum Dijumpai
          </span>
          <h1 className="font-heading text-[38px] font-bold text-slate-900 mb-3 tracking-tighter">
            &ldquo;{word}&rdquo;
          </h1>
          <p className="font-body text-[16px] text-slate-600 mb-8 leading-relaxed">
            Perkataan ini belum didokumentasikan dalam pangkalan data rasmi. Anda boleh menjadi orang pertama yang
            mencadangkan maksud dan sebutannya.
          </p>

          <Link
            href="/"
            className="font-body text-[14px] font-medium bg-black text-white px-8 py-3 rounded-full hover:bg-zinc-800 transition-all shadow"
          >
            ← Kembali ke Laman Utama
          </Link>
        </div>
      </div>
    );
  }

  const isHomonymous = allEntries.length > 1;

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navigation with Integrated Search */}
      <SiteHeader showSearch={true} />

      {/* Homonym navigation bar — only shown when multiple entries exist */}
      {isHomonymous && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-amber-50/60">
          <span className="text-xs font-semibold text-stone-500 mr-1">Homofon:</span>
          {allEntries.map((e, i) => (
            <a
              key={e.id}
              href={`#homonym-${i + 1}`}
              className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-white text-amber-800 font-medium hover:bg-amber-100 transition"
            >
              {e.headword}{SUPERSCRIPTS[i + 1]}
              <span className="ml-1 opacity-60 font-normal">{e.partOfSpeech.replace('KATA ', '')}</span>
            </a>
          ))}
        </div>
      )}

      {/* Render each homonym entry */}
      {allEntries.map((entry, index) => (
        <div
          key={entry.id}
          id={`homonym-${index + 1}`}
          className={index > 0 ? 'mt-12 pt-10 border-t-2 border-dashed border-slate-200' : ''}
        >
          {/* Homonym index label */}
          {isHomonymous && (
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="font-serif text-2xl font-bold text-amber-600 select-none">
                {entry.headword}{SUPERSCRIPTS[index + 1]}
              </span>
              <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                Maksud ke-{index + 1} daripada {allEntries.length}
              </span>
            </div>
          )}

          {/* Two-Column Editorial Entry Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1.2fr] gap-10 lg:gap-12 items-start mt-2">
            {/* Left Column: Headword, Pronunciation, Morphology, Dialects */}
            <div className="flex flex-col gap-8">
              <EntryHeader
                headword={entry.headword}
                partOfSpeech={entry.partOfSpeech}
                ipa={entry.ipa}
                audioUrl={entry.audioUrl}
                rootEntry={entry.rootEntry}
              />
              <AffixList affixes={entry.affixes} />
              <DialectList dialects={entry.dialects} />
            </div>

            {/* Vertical Editorial Column Divider */}
            <div className="hidden lg:block bg-slate-300 w-[1px] min-h-[480px] self-stretch" aria-hidden="true" />

            {/* Right Column: Definitions, Examples, Thesaurus, Provenance */}
            <div className="flex flex-col gap-8">
              <DefinitionList senses={entry.senses} />
              <ExampleBox senses={entry.senses} currentHeadword={entry.headword} />
              <ThesaurusCard thesaurus={entry.thesaurus} />
              <ProvenanceBanner sources={entry.sources} headword={entry.headword} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
