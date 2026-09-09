import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { getCategoryWithEntries } from '@/lib/search/searchService';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const data = await getCategoryWithEntries(slug);
  if (!data) return { title: 'Koleksi Tidak Dijumpai' };

  return {
    title: `${data.category.icon ? `${data.category.icon} ` : ''}${data.category.nameMs} — Koleksi Tematik Kamus Bajau Sama`,
    description: data.category.description || `Senarai kosa kata bahasa Bajau Sama untuk bidang ${data.category.nameMs}.`,
  };
}

export default async function SingleKoleksiPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const data = await getCategoryWithEntries(slug);
  if (!data) notFound();

  const { category, entries: memberEntries = [] } = data;

  return (
    <main className="flex-1 flex flex-col justify-between">
      <SiteHeader />

      <div className="max-w-5xl mx-auto w-full py-6 sm:py-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/koleksi"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-700 transition"
          >
            <span>←</span> Kembali ke Semua Koleksi Tematik
          </Link>
        </div>

        {/* Collection Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl p-3.5 bg-amber-50 rounded-2xl border border-amber-200 shrink-0">
                {category.icon || '🏷️'}
              </span>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl text-slate-900 font-bold tracking-tight">
                  {category.nameMs}
                </h1>
                {category.nameEn && (
                  <p className="text-sm text-slate-400 font-medium italic mt-0.5">
                    {category.nameEn}
                  </p>
                )}
                {category.description && (
                  <p className="font-body text-xs sm:text-sm text-slate-600 mt-2 max-w-xl">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-4 py-2 bg-amber-100/80 text-amber-900 rounded-2xl text-xs font-bold">
                {memberEntries.length} perkataan direkodkan
              </span>
            </div>
          </div>
        </div>

        {/* Word Cards Grid */}
        {memberEntries.length === 0 ? (
          <div className="p-12 text-center bg-sand-50/50 rounded-3xl border border-dashed border-sand-200">
            <p className="text-sm text-stone-500">Belum ada perkataan yang dikaitkan dengan tema ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberEntries.map((entry) => {
              const primaryDef = entry.senses?.[0]?.definitionMs || '-';
              const englishDef = entry.senses?.[0]?.definitionEn;
              const pos = (entry.partOfSpeech || '').replace('KATA ', '');

              return (
                <Link
                  key={entry.id}
                  href={`/kamus/${encodeURIComponent(entry.headword)}`}
                  className="group p-5 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200/70 hover:border-amber-300 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif font-bold text-lg text-slate-900 group-hover:text-amber-800 transition">
                        {entry.headword}
                      </h2>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-sand-100 text-stone-600 rounded-md font-semibold">
                        {pos}
                      </span>
                    </div>

                    {entry.ipa && (
                      <p className="text-xs font-mono text-amber-900/80">
                        {entry.ipa}
                      </p>
                    )}

                    <p className="font-body text-xs text-slate-700 line-clamp-2 leading-relaxed">
                      {primaryDef}
                    </p>

                    {englishDef && (
                      <p className="font-body text-[11px] text-slate-400 italic line-clamp-1">
                        {englishDef}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-amber-700 group-hover:text-amber-900">
                    <span>Lihat entri penuh</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
