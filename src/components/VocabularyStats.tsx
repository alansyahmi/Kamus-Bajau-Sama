'use client';

import React, { useEffect, useState } from 'react';
import { BookMarked, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function VocabularyStats() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ totalWords: 5, totalLocalities: 3 });

  useEffect(() => {
    fetch('/api/search?q=stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.totalWords === 'number') {
          setStats(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-6 pt-5 border-t border-slate-200/70 text-[13px] text-slate-600 font-body">
      <div className="flex items-center gap-1.5">
        <BookMarked className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong className="font-semibold text-slate-900">{stats.totalWords}</strong> {t.stats_words}
        </span>
      </div>

      <span className="text-slate-300 hidden sm:inline">•</span>

      <div className="flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <span>
          <strong className="font-semibold text-slate-900">{stats.totalLocalities}</strong> {t.stats_dialects}
        </span>
      </div>

      <span className="text-slate-300 hidden sm:inline">•</span>

      <div className="flex items-center gap-1.5">
        <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="text-slate-500 capitalize">{t.stats_open_data}</span>
      </div>
    </div>
  );
}
