import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ExternalLink, MapPin, Tag, ShieldCheck, FileText, Users, ArrowLeft } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import { CORPUS_REFERENCES, ReferenceItem } from '@/lib/data/references';

export const metadata: Metadata = {
  title: 'Rujukan & Bibliografi Korpus — Kamus Bajau Sama',
  description: 'Senarai karya akademik, terbitan deskriptif bahasa, dan sumber lisan penutur jati yang menjadi landasan pendokumentasian Kamus Bajau Sama mengikut format LSA (Linguistic Society of America).',
};

export default function ReferencesPage() {
  return (
    <div className="flex-1 flex flex-col gap-8 sm:gap-10">
      <SiteHeader showSearch={true} />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-stone-900 transition-colors">
          Laman Utama
        </Link>
        <span>/</span>
        <span className="text-amber-900 font-semibold">Rujukan & Bibliografi</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="flex flex-col gap-4 max-w-[860px]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold uppercase tracking-wider w-fit">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>Piawaian Leksikografi & Format LSA</span>
        </div>
        <h1 className="font-heading text-[32px] sm:text-[40px] md:text-[44px] font-normal leading-[1.15] text-slate-900 tracking-tight">
          Rujukan &amp; Bibliografi Korpus
        </h1>
        <p className="font-body text-[16px] sm:text-[17px] leading-[1.65] text-slate-700">
          Setiap entri leksikal dalam Kamus Bajau Sama bersandarkan sumber yang berwibawa dan dapat disahkan jejaknya.
          Karya penyelidikan dan rujukan akademik dinukil mengikut piawaian format sitasi{' '}
          <strong>LSA (Linguistic Society of America)</strong> dengan nombor halaman bercetak sebenar (<em>in-paper pages</em>).
        </p>
      </div>

      {/* LSA Citation Standard Primer Card */}
      <div className="bg-gradient-to-br from-amber-50/90 via-stone-50 to-orange-50/60 border border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-900">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-[17px] sm:text-[18px] font-bold text-amber-950">
                Format Sitasi LSA (Linguistic Society of America)
              </h2>
              <p className="text-xs text-amber-800/90">
                Piawaian rasmi tatacara penulisan sitasi leksikal dalam kamus ini
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium px-3 py-1 bg-white border border-amber-300 rounded-full text-amber-900">
            Author (Year:Page)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs sm:text-[13px] text-slate-700">
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200/50 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900">Sitasi Dalam Teks (In-Text Citation):</span>
            <code className="font-mono text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60 block text-[12px]">
              Miller (2007:111), Miller (2007:109–110)
            </code>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Digunakan pada lencana sumber di setiap halaman perkataan untuk rujukan pantas pengarang, tahun terbitan, dan halaman.
            </p>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200/50 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900">Ketepatan Halaman (In-Paper Pagination):</span>
            <code className="font-mono text-emerald-900 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 block text-[12px]">
              Tepat mengikut nombor halaman bercetak buku, BUKAN ofset pembaca fail digital.
            </code>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Memastikan penyelidik, pelajar, dan penutur dapat menyemak sumber asal terus pada naskhah bercetak atau arkib secara tepat.
            </p>
          </div>
        </div>
      </div>

      {/* Corpus Reference Cards Grid */}
      <section className="flex flex-col gap-6" aria-label="Senarai Karya Korpus">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-heading text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight">
            Senarai Sumber &amp; Korpus Terperinci
          </h2>
          <span className="text-xs text-stone-500">
            {CORPUS_REFERENCES.length} sumber berdokumen
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {CORPUS_REFERENCES.map((ref) => {
            const isAcademic = ref.publicationType === 'dissertation' || ref.publicationType === 'book' || ref.publicationType === 'article';
            const isFieldwork = ref.publicationType === 'fieldwork';
            const isCommunity = ref.publicationType === 'community';

            return (
              <article
                key={ref.id}
                id={ref.id}
                className="scroll-mt-24 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-card hover:border-amber-300/80 transition-all flex flex-col gap-4"
              >
                {/* Top Reference Meta Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-serif font-bold text-base sm:text-lg text-amber-950">
                      {ref.shortCite}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/70">
                      {isAcademic ? 'Penerbitan Akademik' : isFieldwork ? 'Kajian Lapangan Lisan' : 'Sumbangan Komuniti'}
                    </span>
                    {ref.locality && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{ref.locality}</span>
                      </span>
                    )}
                  </div>

                  {ref.externalUrl && (
                    <a
                      href={ref.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                    >
                      <span>Lihat Repositori Asal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Full LSA Bibliographic Citation Box */}
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 font-serif text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate-900 italic">
                  {ref.fullLsaCitation}
                </div>

                {/* Descriptions */}
                <div className="flex flex-col gap-2">
                  <p className="font-body text-[13.5px] sm:text-[14px] leading-relaxed text-slate-700">
                    {ref.descriptionMs}
                  </p>
                  <p className="font-body text-[12.5px] sm:text-[13px] leading-relaxed text-slate-500 italic">
                    {ref.descriptionEn}
                  </p>
                </div>

                {/* Topics / Tags */}
                {ref.topics && ref.topics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
                      Cakupan:
                    </span>
                    {ref.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom Back to Home CTA */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Laman Utama</span>
        </Link>
        <Link
          href="/koleksi"
          className="text-sm font-semibold text-amber-800 hover:text-amber-950 transition-colors"
        >
          Lihat Koleksi Tematik →
        </Link>
      </div>
    </div>
  );
}
