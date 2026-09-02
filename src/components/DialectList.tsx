'use client';

import React from 'react';
import { LexicalDialect } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function DialectList({ dialects }: { dialects: LexicalDialect[] }) {
  const { t } = useLanguage();

  if (!dialects || dialects.length === 0) return null;

  const spellingVariants = dialects.filter(
    (d) =>
      d.localityName.toLowerCase().includes('varian') ||
      d.localityName.toLowerCase().includes('ortografi') ||
      d.localityName.toLowerCase().includes('ejaan')
  );

  const regionalDialects = dialects.filter(
    (d) =>
      !d.localityName.toLowerCase().includes('varian') &&
      !d.localityName.toLowerCase().includes('ortografi') &&
      !d.localityName.toLowerCase().includes('ejaan')
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Varian Ortografi (Orthographical Variants) */}
      {spellingVariants.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-body text-[22px] font-medium text-slate-900 tracking-tightest">
            {t.entry_variants}
          </h2>
          <ol className="flex flex-col gap-1.5 list-none p-0 m-0">
            {spellingVariants.map((item, idx) => (
              <li key={item.id} className="text-[16px] text-slate-800 flex items-baseline gap-2.5 font-body">
                <span className="font-body text-[14px] font-semibold text-slate-400 min-w-[20px]">
                  {idx + 1}.
                </span>
                <span className="text-slate-900 font-serif font-medium text-[17px]">{item.dialectForm}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 2. Variasi Daerah (Regional Dialect Variants) */}
      {regionalDialects.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-body text-[22px] font-medium text-slate-900 tracking-tightest">
            {t.entry_dialects}
          </h2>
          <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
            {regionalDialects.map((item) => (
              <li key={item.id} className="text-[16px] text-slate-800 flex items-baseline gap-2 font-body">
                <span className="font-medium text-slate-900 min-w-[96px]">{item.localityName}:</span>
                <span className="text-slate-600 font-serif font-medium">{item.dialectForm}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
