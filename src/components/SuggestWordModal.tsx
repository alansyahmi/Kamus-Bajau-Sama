'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface SuggestWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

export default function SuggestWordModal({ isOpen, onClose, initialWord = '' }: SuggestWordModalProps) {
  const { t } = useLanguage();
  const [headword, setHeadword] = useState(initialWord);
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [locality, setLocality] = useState('Kota Belud');
  const [contributorName, setContributorName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialWord) setHeadword(initialWord);
  }, [initialWord]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headword.trim() || !meaning.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headword: headword.trim(),
          meaning: meaning.trim(),
          exampleSentence: exampleSentence.trim(),
          locality,
          contributorName: contributorName.trim(),
          notes: notes.trim(),
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
          setHeadword('');
          setMeaning('');
          setExampleSentence('');
          setContributorName('');
          setNotes('');
        }, 1800);
      }
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-7 max-w-[540px] w-full shadow-dropdown flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[20px] text-slate-900 font-bold">{t.modal_suggest_title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3 text-emerald-600">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            <p className="font-body text-[16px] font-medium text-slate-800">{t.modal_success_toast}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-1">
            <p className="font-body text-[14px] text-slate-500 leading-relaxed">{t.modal_suggest_desc}</p>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[13px] font-medium text-slate-700">
                {t.modal_word_label} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={headword}
                onChange={(e) => setHeadword(e.target.value)}
                placeholder="Cth: mangan, boe', tilau"
                required
                className="font-body text-[14px] p-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[13px] font-medium text-slate-700">
                {t.modal_meaning_label} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Cth: makan, air, bertanya"
                required
                className="font-body text-[14px] p-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[13px] font-medium text-slate-700">
                {t.modal_example_label}
              </label>
              <textarea
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                rows={2}
                placeholder="Cth: Boino ku mangan tadi. (Sudah saya makan tadi)"
                className="font-body text-[14px] p-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] font-medium text-slate-700">
                  {t.modal_locality_label}
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="font-body text-[14px] p-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-900 bg-white"
                >
                  <option value="Kota Belud">Kota Belud</option>
                  <option value="Tuaran">Tuaran</option>
                  <option value="Papar">Papar</option>
                  <option value="Kawang">Kawang</option>
                  <option value="Semporna">Semporna</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] font-medium text-slate-700">
                  {t.modal_contributor_label}
                </label>
                <input
                  type="text"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="Nama anda"
                  className="font-body text-[14px] p-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="font-body text-[14px] font-medium text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t.modal_btn_cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="font-body text-[14px] font-medium bg-black text-white px-6 py-2 rounded-full hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {isSubmitting ? '...' : t.modal_btn_submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
