import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCachedEntriesByHeadword, getCachedAdjacentHeadwords, getSpellingSuggestions } from '@/lib/search/searchService';
import SiteHeader from '@/components/SiteHeader';
import EntryHeader from '@/components/EntryHeader';
import AffixList from '@/components/AffixList';
import DialectList from '@/components/DialectList';
import DefinitionList from '@/components/DefinitionList';
import ExampleBox from '@/components/ExampleBox';
import ThesaurusCard from '@/components/ThesaurusCard';
import PronounParadigmCard from '@/components/PronounParadigmCard';
import { isPersonalPronounWord } from '@/lib/pronouns';
import ProvenanceBanner from '@/components/ProvenanceBanner';
import EntryNotFound from '@/components/EntryNotFound';
import LexicalPagination from '@/components/LexicalPagination';

export const revalidate = 86400; // Cache at Edge for 24 hours
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
  const allEntries = await getCachedEntriesByHeadword(word);

  if (allEntries.length === 0) {
    return {
      title: `"${word}" — Kamus Bajau Sama`,
      description: `Perkataan "${word}" belum di dalam Kamus Bajau Sama. Cadangkan perkataan ini.`,
    };
  }

  const first = allEntries[0];
  const def = first.senses[0]?.definitionMs || '';
  if (first.homonymMeta && allEntries.length === 1) {
    return {
      title: `${first.headword}${SUPERSCRIPTS[first.homonymMeta.index]} (${first.partOfSpeech.replace('KATA ', '')}) — Kamus Bajau Sama`,
      description: `Maksud perkataan ${first.headword}${SUPERSCRIPTS[first.homonymMeta.index]}: ${def}. Lihat sebutan IPA, terbitan imbuhan, dan variasi dialek.`,
    };
  }
  const homonymNote = allEntries.length > 1 ? ` (${allEntries.length} maksud berlainan)` : '';
  return {
    title: `${first.headword}${homonymNote} — Kamus Bajau Sama`,
    description: `Maksud perkataan ${first.headword}: ${def}. Lihat sebutan IPA, terbitan imbuhan, dan variasi dialek.`,
  };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const word = decodeURIComponent(params.word);
  const allEntries = await getCachedEntriesByHeadword(word);

  if (allEntries.length === 0) {
    const suggestions = await getSpellingSuggestions(word);
    return (
      <div className="flex-1 flex flex-col">
        <SiteHeader showSearch={true} />
        <EntryNotFound word={word} suggestions={suggestions} />
      </div>
    );
  }

  const isHomonymous = allEntries.length > 1;
  const singleHomonym = allEntries.length === 1 ? allEntries[0].homonymMeta : null;
  const adjacent = await getCachedAdjacentHeadwords(allEntries[0].headword);

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navigation with Integrated Search */}
      <SiteHeader showSearch={true} />

      {/* Single Homonym Dedicated Banner (e.g. /kamus/pu'2) */}
      {singleHomonym && singleHomonym.total > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border border-amber-200/80 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 mb-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold text-amber-900">
              {allEntries[0].headword}{SUPERSCRIPTS[singleHomonym.index]}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 uppercase tracking-wide">
              Maksud ke-{singleHomonym.index} daripada {singleHomonym.total}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-stone-500 font-medium">Homonim lain:</span>
            {singleHomonym.siblings
              .filter((s) => s.index !== singleHomonym.index)
              .map((s) => (
                <Link
                  key={s.index}
                  href={`/kamus/${encodeURIComponent(s.slug)}`}
                  className="px-3 py-1.5 rounded-full border border-amber-300 bg-white text-amber-800 font-medium hover:bg-amber-100 hover:border-amber-400 transition inline-flex items-center gap-1.5 shadow-2xs text-decoration-none"
                >
                  <span className="font-bold">{allEntries[0].headword}{SUPERSCRIPTS[s.index]}</span>
                  <span className="opacity-70 text-[11px]">({s.partOfSpeech.replace('KATA ', '')})</span>
                </Link>
              ))}
            <Link
              href={`/kamus/${encodeURIComponent(singleHomonym.baseHeadword)}`}
              className="px-2.5 py-1 text-stone-600 hover:text-stone-900 transition underline underline-offset-2 text-decoration-none"
            >
              Lihat Semua Homonim
            </Link>
          </div>
        </div>
      )}

      {/* Multi-Homonym Navigation Bar — shown when viewing the base headword page */}
      {isHomonymous && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-amber-200/60 rounded-2xl bg-amber-50/60 overflow-x-auto no-scrollbar mb-4">
          <span className="text-xs font-semibold text-stone-500 mr-1 shrink-0">Homonim:</span>
          {allEntries.map((e, i) => (
            <Link
              key={e.id}
              href={`/kamus/${encodeURIComponent(e.homonymMeta?.slug || `${e.headword}${i + 1}`)}`}
              className="text-xs px-3 py-1.5 rounded-full border border-amber-300 bg-white text-amber-800 font-medium hover:bg-amber-100 transition shrink-0 min-h-[32px] inline-flex items-center text-decoration-none"
            >
              {e.headword}{SUPERSCRIPTS[i + 1]}
              <span className="ml-1 opacity-60 font-normal">{e.partOfSpeech.replace('KATA ', '')}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Render each homonym entry */}
      {allEntries.map((entry, index) => {
        const displayHeadword = entry.homonymMeta && isHomonymous
          ? `${entry.headword}${SUPERSCRIPTS[entry.homonymMeta.index]}`
          : entry.homonymMeta
            ? `${entry.headword}${SUPERSCRIPTS[entry.homonymMeta.index]}`
            : entry.headword;

        return (
          <div
            key={entry.id}
            id={`homonym-${index + 1}`}
            className={index > 0 ? 'mt-10 sm:mt-12 pt-8 sm:pt-10 border-t-2 border-dashed border-slate-200' : ''}
          >
            {/* Homonym index label */}
            {isHomonymous && (
              <div className="flex items-center justify-between gap-2 mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-amber-600 select-none">
                    {entry.headword}{SUPERSCRIPTS[index + 1]}
                  </span>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    Maksud ke-{index + 1} daripada {allEntries.length}
                  </span>
                </div>
                {entry.homonymMeta && (
                  <Link
                    href={`/kamus/${encodeURIComponent(entry.homonymMeta.slug)}`}
                    className="text-xs text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2"
                  >
                    Pautan Entri Khusus ↗
                  </Link>
                )}
              </div>
            )}

            {/* Two-Column Editorial Entry Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1.2fr] gap-8 lg:gap-12 items-start mt-1 sm:mt-2">
              {/* Left Column: Headword, Pronunciation, Morphology, Dialects */}
              <div className="flex flex-col gap-8">
                <EntryHeader
                  headword={entry.headword}
                  partOfSpeech={entry.partOfSpeech}
                  ipa={entry.ipa}
                  audioUrl={entry.audioUrl}
                  rootEntry={entry.rootEntry}
                />

                {/* Thematic Category Badges */}
                {entry.categories && entry.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 -mt-4">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Kategori:</span>
                    {entry.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/koleksi/${cat.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200/70 rounded-full text-xs font-medium transition shadow-2xs"
                      >
                        <span>{cat.icon || '🏷️'}</span>
                        <span>{cat.nameMs}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mobile-only: Definition positioned directly on top of Word Derivations */}
                <div className="block lg:hidden">
                  <DefinitionList senses={entry.senses} />
                </div>

                <AffixList affixes={entry.affixes} />
                <DialectList dialects={entry.dialects} />
              </div>

              {/* Vertical Editorial Column Divider */}
              <div className="hidden lg:block bg-slate-300 w-[1px] min-h-[480px] self-stretch" aria-hidden="true" />

              {/* Right Column: Definitions, Examples, Thesaurus, Provenance */}
              <div className="flex flex-col gap-8">
                {/* Desktop-only: Definition positioned at top of right editorial column */}
                <div className="hidden lg:block">
                  <DefinitionList senses={entry.senses} />
                </div>

                <ExampleBox senses={entry.senses} currentHeadword={entry.headword} />
                <ThesaurusCard thesaurus={entry.thesaurus} />
                {isPersonalPronounWord(entry.headword) && (
                  <PronounParadigmCard currentHeadword={entry.headword} />
                )}
                <ProvenanceBanner sources={entry.sources} headword={entry.headword} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Lexical Pagination: Browse Previous / Next in Alphabetical Order */}
      <LexicalPagination
        prev={adjacent.prev}
        next={adjacent.next}
        currentHeadword={allEntries[0].headword}
      />
    </div>
  );
}
