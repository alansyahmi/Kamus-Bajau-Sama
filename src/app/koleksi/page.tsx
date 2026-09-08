import React from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { getAllCategoriesWithCounts } from '@/lib/search/searchService';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge';

export const metadata: Metadata = {
  title: 'Koleksi Tematik — Kamus Bajau Sama',
  description: 'Terokai kosa kata bahasa Bajau Sama mengikut kelompok bidang semantik seperti anggota badan, haiwan, arah kedudukan, makanan, dan warisan budaya.',
};

export default async function KoleksiPage() {
  const categories = await getAllCategoriesWithCounts();

  return (
    <main className="flex-1 flex flex-col justify-between">
      <SiteHeader />

      <div className="max-w-5xl mx-auto w-full py-8 sm:py-12">
        {/* Editorial Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">
            <span>🏷️</span> Bidang Semantik
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl text-slate-900 font-bold tracking-tight mb-3">
            Koleksi Tematik Bajau Sama
          </h1>
          <p className="font-body text-base sm:text-lg text-slate-600 max-w-2xl">
            Terokai kosa kata bahasa Bajau Sama mengikut bidang makna dan kehidupan masyarakat Samah — dari anggota badan dan alam sekitar, hingga istilah arah dan adat resam.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/koleksi/${cat.slug}`}
              className="group p-6 bg-white hover:bg-amber-50/40 rounded-3xl border border-slate-200/80 hover:border-amber-300 shadow-card hover:shadow-lg transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 bg-sand-50 rounded-2xl border border-sand-200 group-hover:scale-105 transition">
                    {cat.icon || '🏷️'}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                    {cat.count} perkataan
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-800 transition">
                    {cat.nameMs}
                  </h2>
                  {cat.nameEn && (
                    <p className="text-xs text-slate-400 font-medium italic mt-0.5">
                      {cat.nameEn}
                    </p>
                  )}
                </div>

                {cat.description && (
                  <p className="font-body text-xs leading-relaxed text-slate-500">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-900">
                <span>Lihat koleksi penuh</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
