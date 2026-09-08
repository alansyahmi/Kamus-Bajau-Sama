'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SuggestWordModal from './SuggestWordModal';
import SupportModal from './SupportModal';

export default function Footer() {
  const { t } = useLanguage();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="mt-auto w-full pl-[var(--linangkit-width)] relative z-20">
        {/* Sawtooth / Triangular Crest Motif in Pure Black */}
        <div className="w-full overflow-hidden leading-none select-none -mb-px" aria-hidden="true">
          <svg
            className="w-full h-[18px] sm:h-[22px] block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="footer-sawtooth" width="24" height="22" patternUnits="userSpaceOnUse">
                <polygon points="0,22 12,0 24,22" fill="#000000" />
              </pattern>
            </defs>
            <rect width="100%" height="22" fill="url(#footer-sawtooth)" />
          </svg>
        </div>

        {/* Solid Pure Black (#000000) Container */}
        <div className="bg-black text-slate-300">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pt-10 sm:pt-14 pb-12 sm:pb-16">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              {/* Left Column: Brand & Inisiatif Motto */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/minimalist-logo-transparent.png"
                    alt="Kamus Bajau Sama Logo"
                    width={36}
                    height={36}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow"
                  />
                  <div className="flex flex-col">
                    <span className="font-heading text-[20px] sm:text-[22px] font-bold text-white tracking-tight">
                      Kamus Bajau Sama
                    </span>
                    <span className="font-body text-[11px] text-slate-400 tracking-normal">
                      Pangkalan Data & Warisan Leksikal Terbuka
                    </span>
                  </div>
                </div>

                <p className="font-body text-[14.5px] leading-relaxed text-slate-300 max-w-[620px]">
                  {t.footer_brand_desc}
                </p>
              </div>

              {/* Right Column: Pautan Pantas */}
              <div className="md:col-span-4 flex flex-col gap-3.5">
                <h3 className="font-body text-[13px] font-semibold tracking-wider uppercase text-slate-400">
                  {t.footer_nav_title}
                </h3>
                <ul className="flex flex-col gap-2.5 font-body text-[14px]">
                  <li>
                    <Link
                      href="/"
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{t.footer_nav_home}</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tentang"
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{t.footer_nav_about}</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rujukan"
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>Rujukan &amp; Bibliografi</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#simak-abjad"
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{t.footer_nav_alphabet}</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setIsSuggestOpen(true)}
                      className="text-amber-300 hover:text-amber-200 transition-colors inline-flex items-center gap-1.5 text-left font-medium group"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                      <span>{t.footer_nav_suggest}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setIsSupportOpen(true)}
                      className="text-rose-300 hover:text-rose-200 transition-colors inline-flex items-center gap-1.5 text-left font-medium group"
                    >
                      <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform fill-rose-400/30" />
                      <span>{t.support_nav}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Disclaimer & Copyright Row */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] font-body text-slate-400">
              <p>
                © {currentYear} {t.footer_copyright}
              </p>
              <p className="text-slate-400">
                Inisiatif Pemeliharaan Warisan Leksikal Terbuka
              </p>
            </div>

          </div>
        </div>
      </footer>

      {/* Suggest Word Modal from Footer */}
      <SuggestWordModal isOpen={isSuggestOpen} onClose={() => setIsSuggestOpen(false)} />
      {/* Support / DuitNow Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </>
  );
}
