'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Heart, Download, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(t.support_account_name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 max-w-[500px] w-full shadow-2xl flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto pb-safe sm:pb-7 border border-slate-200/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Heart className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 id="support-modal-title" className="font-heading text-[19px] sm:text-[21px] text-slate-900 font-bold tracking-tight">
                {t.support_modal_title}
              </h3>
              <p className="font-body text-[11.5px] text-slate-500">
                Inisiatif Terbuka & Bebas Iklan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative / Description */}
        <p className="font-body text-[14px] text-slate-600 leading-relaxed">
          {t.support_modal_desc}
        </p>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-center">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/70 relative group">
            <Image
              src="/duitnow-qr.png"
              alt="Maybank DuitNow QR Code"
              width={260}
              height={360}
              className="w-[200px] sm:w-[220px] h-auto object-contain rounded-xl"
              priority
            />
          </div>

          <p className="font-body text-[12px] text-slate-500 mt-3 max-w-[320px] leading-snug">
            {t.support_qr_caption}
          </p>

          {/* Account Details & Action Bar */}
          <div className="w-full mt-4 pt-3 border-t border-slate-200/70 flex flex-col gap-2">
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-left">
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                  Nama Penerima (DuitNow)
                </p>
                <p className="font-body text-[13.5px] font-semibold text-slate-900">
                  {t.support_account_name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
                title={t.support_copy_btn}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">{t.support_copied_toast}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.support_copy_btn}</span>
                  </>
                )}
              </button>
            </div>

            <a
              href="/duitnow-qr.png"
              download="DuitNow-KamusBajauSamah.png"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-body text-[13px] font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{t.support_download_qr}</span>
            </a>
          </div>
        </div>

        {/* Why Support Explainer Box */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <h4 className="font-body text-[12.5px] font-semibold text-amber-950">
              {t.support_why_title}
            </h4>
            <p className="font-body text-[12px] text-amber-900/85 leading-relaxed">
              {t.support_why_desc}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-body text-[14px] font-medium rounded-xl transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
