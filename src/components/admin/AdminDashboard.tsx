'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { detectWordsInSentence, cleanBajauWord, tokenizeSentence } from '@/lib/linguistics/autoLinker';

interface ExampleItem {
  id?: number;
  sentenceBajau: string;
  highlightWord?: string;
  sentenceMs: string;
  sentenceEn?: string;
  audioUrl?: string | null;
}

interface ExampleItemEx extends ExampleItem {
  id: number;
  senseId: number;
  senseOrderIndex: number;
  senseDefinitionMs: string;
  entryId: number;
  headword: string;
  partOfSpeech: string;
}

interface SenseItem {
  id?: number;
  orderIndex: number;
  definitionMs: string;
  definitionEn?: string;
  examples?: ExampleItem[];
}

interface EntryItem {
  id: number;
  headword: string;
  searchNormalized: string;
  partOfSpeech: string;
  ipa?: string;
  audioUrl?: string | null;
  senses?: SenseItem[];
  affixes?: Array<{ id?: number; term: string; meaningMs: string; meaningEn?: string }>;
  dialects?: Array<{ id?: number; localityName: string; dialectForm: string }>;
}

interface SubmissionItem {
  id: number;
  headword: string;
  meaning: string;
  exampleSentence?: string | null;
  contributorName?: string | null;
  contributorEmail?: string | null;
  locality?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminEditorProps {
  initialWord?: string;
  searchParams?: {
    entry?: string;
    word?: string;
    q?: string;
  };
}

export default function AdminDashboard({ initialWord, searchParams }: AdminEditorProps = {}) {
  const targetWord = initialWord || searchParams?.entry || searchParams?.word || searchParams?.q || '';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'entries' | 'examples' | 'submissions' | 'new_entry' | 'stats'>('entries');

  // Entries State
  const [searchQuery, setSearchQuery] = useState(targetWord || '');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [entriesList, setEntriesList] = useState<EntryItem[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);

  // Examples Studio State
  const [examplesList, setExamplesList] = useState<ExampleItemEx[]>([]);
  const [totalExamples, setTotalExamples] = useState(0);
  const [examplesSearchQuery, setExamplesSearchQuery] = useState('');
  const [examplesFilter, setExamplesFilter] = useState<'all' | 'has_audio' | 'no_audio' | 'no_highlight'>('all');
  const [examplesPage, setExamplesPage] = useState(1);
  const [examplesTotalPages, setExamplesTotalPages] = useState(1);
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);
  const [editingExampleId, setEditingExampleId] = useState<number | null>(null);
  const [exampleSaveStatus, setExampleSaveStatus] = useState<Record<number, string>>({});
  const [exampleAudioStatus, setExampleAudioStatus] = useState<Record<number, string>>({});
  const [bakingExampleId, setBakingExampleId] = useState<number | null>(null);
  const [examplePlayingId, setExamplePlayingId] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EntryItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [allHeadwordsSet, setAllHeadwordsSet] = useState<Set<string>>(new Set());
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const savedEntryRef = useRef<EntryItem | null>(null);

  // Submissions State
  const [submissionsList, setSubmissionsList] = useState<SubmissionItem[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [moderatingSub, setModeratingSub] = useState<SubmissionItem | null>(null);
  const [editSubWord, setEditSubWord] = useState('');
  const [editSubMeaning, setEditSubMeaning] = useState('');
  const [editSubPos, setEditSubPos] = useState('KATA NAMA');
  const [modNotes, setModNotes] = useState('');

  // Audio Studio State
  const [selectedVoice, setSelectedVoice] = useState<string>('su');
  const [customPhoneticInput, setCustomPhoneticInput] = useState<string>('');
  const [customRate, setCustomRate] = useState<string>('-5%');
  const [isBakingAudio, setIsBakingAudio] = useState(false);
  const [audioStatusMsg, setAudioStatusMsg] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewAudioObj, setPreviewAudioObj] = useState<HTMLAudioElement | null>(null);

  // New Entry Form State
  const [newHw, setNewHw] = useState('');
  const [newPos, setNewPos] = useState('KATA NAMA');
  const [newIpa, setNewIpa] = useState('');
  const [newDefMs, setNewDefMs] = useState('');
  const [newDefEn, setNewDefEn] = useState('');
  const [newExBj, setNewExBj] = useState('');
  const [newExMs, setNewExMs] = useState('');
  const [newExEn, setNewExEn] = useState('');
  const [createStatus, setCreateStatus] = useState<string | null>(null);

  // Check initial login session
  useEffect(() => {
    const token = localStorage.getItem('admin_passkey');
    if (token) {
      setPasskey(token);
      validateLogin(token);
    }
  }, []);

  const validateLogin = async (key: string) => {
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_passkey', key);
        loadEntries(targetWord || '', '', 1, key, true);
        loadExamples('', 'all', 1, key);
        loadSubmissions(key);
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Kunci keselamatan tidak sah.');
        setIsAuthenticated(false);
      }
    } catch {
      setAuthError('Gagal menyambung ke pelayan.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_passkey');
    setIsAuthenticated(false);
    fetch('/api/admin/login', { method: 'DELETE' });
  };

  const loadEntries = async (query = searchQuery, letter = selectedLetter, page = currentPage, key = passkey, autoSelectTarget = false) => {
    setIsLoadingEntries(true);
    try {
      const url = `/api/admin/entries?q=${encodeURIComponent(query)}&letter=${encodeURIComponent(letter)}&page=${page}&limit=20`;
      const res = await fetch(url, {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        const list: EntryItem[] = data.entries || [];
        setEntriesList(list);
        setTotalEntries(data.pagination?.total || 0);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 1);

        if (list.length > 0) {
          if (autoSelectTarget && targetWord) {
            const targetLower = targetWord.toLowerCase().trim();
            const matched = list.find(e => e.headword.toLowerCase().trim() === targetLower) || list[0];
            setSelectedEntry(matched);
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', `/admin/${encodeURIComponent(matched.headword)}`);
            }
          } else if (!selectedEntry) {
            setSelectedEntry(list[0]);
          }
        }
      }

      // Populate glossary headwords set for real-time auto-link detection
      if (allHeadwordsSet.size === 0) {
        fetch('/api/search?q=all')
          .then(r => r.json())
          .then(list => {
            if (Array.isArray(list)) {
              const set = new Set<string>();
              list.forEach((item: any) => {
                if (item.headword) {
                  set.add(item.headword.toLowerCase());
                }
              });
              setAllHeadwordsSet(set);
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const loadExamples = async (q = examplesSearchQuery, filter = examplesFilter, page = examplesPage, key = passkey) => {
    setIsLoadingExamples(true);
    try {
      const url = `/api/admin/examples?q=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}&page=${page}&limit=20`;
      const res = await fetch(url, {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        setExamplesList(data.examples || []);
        setTotalExamples(data.total || 0);
        setExamplesPage(data.page || 1);
        setExamplesTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingExamples(false);
    }
  };

  const handleSaveExample = async (ex: ExampleItemEx) => {
    setExampleSaveStatus(prev => ({ ...prev, [ex.id]: 'Menyimpan...' }));
    try {
      const res = await fetch(`/api/admin/examples/${ex.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify({
          sentenceBajau: ex.sentenceBajau,
          highlightWord: ex.highlightWord,
          sentenceMs: ex.sentenceMs,
          sentenceEn: ex.sentenceEn,
        }),
      });
      if (res.ok) {
        setExampleSaveStatus(prev => ({ ...prev, [ex.id]: '✅ Tersimpan' }));
        setTimeout(() => {
          setExampleSaveStatus(prev => {
            const next = { ...prev };
            delete next[ex.id];
            return next;
          });
        }, 3000);
      } else {
        const err = await res.json();
        setExampleSaveStatus(prev => ({ ...prev, [ex.id]: `❌ ${err.error || 'Gagal'}` }));
      }
    } catch {
      setExampleSaveStatus(prev => ({ ...prev, [ex.id]: '❌ Ralat' }));
    }
  };

  const handleBakeExampleAudio = async (ex: ExampleItemEx) => {
    setBakingExampleId(ex.id);
    setExampleAudioStatus(prev => ({ ...prev, [ex.id]: 'Menjana audio...' }));
    try {
      const res = await fetch(`/api/admin/examples/${ex.id}/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify({
          voiceKey: selectedVoice,
          rate: customRate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.audioUrl) {
        setExamplesList(prev => prev.map(item => item.id === ex.id ? { ...item, audioUrl: data.audioUrl } : item));
        setExampleAudioStatus(prev => ({ ...prev, [ex.id]: '✅ Audio Rasmi Tersimpan!' }));
        setTimeout(() => {
          setExampleAudioStatus(prev => {
            const next = { ...prev };
            delete next[ex.id];
            return next;
          });
        }, 4000);
      } else {
        setExampleAudioStatus(prev => ({ ...prev, [ex.id]: `❌ ${data.error || 'Gagal'}` }));
      }
    } catch {
      setExampleAudioStatus(prev => ({ ...prev, [ex.id]: '❌ Ralat' }));
    } finally {
      setBakingExampleId(null);
    }
  };

  const handleDeleteExampleAudio = async (ex: ExampleItemEx) => {
    if (!confirm('Adakah anda pasti mahu memadam rakaman audio rasmi bagi ayat ini?')) return;
    try {
      const res = await fetch(`/api/admin/examples/${ex.id}/audio`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passkey },
      });
      if (res.ok) {
        setExamplesList(prev => prev.map(item => item.id === ex.id ? { ...item, audioUrl: null } : item));
        setExampleAudioStatus(prev => ({ ...prev, [ex.id]: '🗑️ Audio dipadam' }));
        setTimeout(() => {
          setExampleAudioStatus(prev => {
            const next = { ...prev };
            delete next[ex.id];
            return next;
          });
        }, 3000);
      }
    } catch {
      alert('Gagal memadam audio ayat.');
    }
  };

  const handleDeleteExample = async (exId: number) => {
    if (!confirm('Adakah anda pasti mahu memadam ayat contoh ini?')) return;
    try {
      const res = await fetch(`/api/admin/examples/${exId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passkey },
      });
      if (res.ok) {
        setExamplesList(prev => prev.filter(item => item.id !== exId));
        setTotalExamples(prev => Math.max(0, prev - 1));
      } else {
        alert('Gagal memadam ayat contoh.');
      }
    } catch {
      alert('Ralat pelayan semasa memadam ayat contoh.');
    }
  };

  const handlePlaySentenceAudio = (exId: number, sentenceText: string, audioUrl?: string | null) => {
    if (previewAudioObj) {
      previewAudioObj.pause();
      previewAudioObj.currentTime = 0;
    }

    if (audioUrl) {
      setExamplePlayingId(exId);
      const audio = new Audio(audioUrl);
      setPreviewAudioObj(audio);
      audio.onended = () => setExamplePlayingId(null);
      audio.onerror = () => setExamplePlayingId(null);
      audio.play().catch(() => setExamplePlayingId(null));
      return;
    }

    setExamplePlayingId(exId);
    const url = `/api/tts?text=${encodeURIComponent(sentenceText)}&voice=${encodeURIComponent(selectedVoice)}&rate=${encodeURIComponent(customRate)}&t=${Date.now()}`;
    const audio = new Audio(url);
    setPreviewAudioObj(audio);
    audio.onended = () => setExamplePlayingId(null);
    audio.onerror = () => setExamplePlayingId(null);
    audio.play().catch(() => setExamplePlayingId(null));
  };

  const loadSubmissions = async (key = passkey) => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('/api/admin/submissions', {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data.submissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleSaveEntry = useCallback(async () => {
    if (!selectedEntry) return;
    setSaveStatus('Menyimpan perubahan...');
    try {
      const res = await fetch(`/api/admin/entries/${selectedEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify(selectedEntry),
      });
      if (res.ok) {
        setSaveStatus('✅ Berjaya dikemas kini!');
        setHasUnsavedChanges(false);
        savedEntryRef.current = selectedEntry;
        setTimeout(() => setSaveStatus(null), 3000);
        loadEntries(searchQuery);
      } else {
        const err = await res.json();
        setSaveStatus(`❌ Ralat: ${err.error || 'Gagal menyimpan'}`);
      }
    } catch {
      setSaveStatus('❌ Ralat sambungan.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntry, passkey, searchQuery]);

  // Ctrl+Enter saves the current entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveEntry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveEntry]);

  // Track unsaved changes: compare current selectedEntry vs last saved snapshot
  useEffect(() => {
    if (!selectedEntry) {
      setHasUnsavedChanges(false);
      return;
    }
    const saved = savedEntryRef.current;
    // No saved snapshot yet means this entry was just selected from list — not dirty
    if (!saved || saved.id !== selectedEntry.id) {
      savedEntryRef.current = selectedEntry;
      setHasUnsavedChanges(false);
      return;
    }
    const isDirty = JSON.stringify(saved) !== JSON.stringify(selectedEntry);
    setHasUnsavedChanges(isDirty);
  }, [selectedEntry]);

  const handlePreviewAudio = (voiceKey: string, customHeadword?: string, rateVal?: string) => {
    if (!selectedEntry) return;
    if (previewAudioObj) {
      previewAudioObj.pause();
      previewAudioObj.currentTime = 0;
    }
    const text = customHeadword || selectedEntry.headword;
    const rateToUse = rateVal || customRate;
    const url = `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voiceKey)}&rate=${encodeURIComponent(rateToUse)}${selectedEntry.ipa ? `&ipa=${encodeURIComponent(selectedEntry.ipa)}` : ''}&t=${Date.now()}`;
    const audio = new Audio(url);
    setPreviewAudioObj(audio);
    setIsPreviewPlaying(true);
    audio.onended = () => setIsPreviewPlaying(false);
    audio.onerror = () => setIsPreviewPlaying(false);
    audio.play().catch(() => setIsPreviewPlaying(false));
  };

  const handleBakeAudio = async () => {
    if (!selectedEntry) return;
    setIsBakingAudio(true);
    setAudioStatusMsg('Menjana dan menyimpan rakaman rasmi...');
    try {
      const res = await fetch(`/api/admin/entries/${selectedEntry.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify({
          voiceKey: selectedVoice,
          customText: (customPhoneticInput || selectedEntry.headword).trim(),
          rate: customRate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.audioUrl) {
        setSelectedEntry({ ...selectedEntry, audioUrl: data.audioUrl });
        setAudioStatusMsg('✅ Rakaman audio rasmi berjaya disimpan!');
        // Update item in entriesList as well
        setEntriesList(prev => prev.map(e => e.id === selectedEntry.id ? { ...e, audioUrl: data.audioUrl } : e));
        setTimeout(() => setAudioStatusMsg(null), 4000);
      } else {
        setAudioStatusMsg(`❌ Ralat: ${data.error || data.details || 'Gagal menyimpan audio'}`);
      }
    } catch {
      setAudioStatusMsg('❌ Ralat pelayan semasa menyimpan audio.');
    } finally {
      setIsBakingAudio(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!selectedEntry) return;
    if (!confirm('Adakah anda pasti mahu memadam rakaman audio rasmi bagi entri ini?')) return;
    try {
      const res = await fetch(`/api/admin/entries/${selectedEntry.id}?audioOnly=true`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passkey },
      });
      if (res.ok) {
        setSelectedEntry({ ...selectedEntry, audioUrl: null });
        setEntriesList(prev => prev.map(e => e.id === selectedEntry.id ? { ...e, audioUrl: null } : e));
        setAudioStatusMsg('🗑️ Rakaman rasmi telah dipadam.');
        setTimeout(() => setAudioStatusMsg(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Gagal memadam audio: ${err.error || err.details || res.statusText}`);
      }
    } catch (e: any) {
      alert(`Ralat sambungan semasa memadam audio: ${e.message}`);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    if (!confirm(`Adakah anda pasti mahu memadam entri "${selectedEntry.headword}"?`)) return;
    try {
      const res = await fetch(`/api/admin/entries/${selectedEntry.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passkey },
      });
      if (res.ok) {
        alert(`Entri "${selectedEntry.headword}" telah berjaya dipadam.`);
        setSelectedEntry(null);
        loadEntries(searchQuery);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Gagal memadam entri: ${err.error || err.details || res.statusText}`);
      }
    } catch (e: any) {
      alert(`Ralat sambungan semasa memadam entri: ${e.message}`);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStatus('Mencipta entri...');
    try {
      const res = await fetch('/api/admin/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify({
          headword: newHw,
          partOfSpeech: newPos,
          ipa: newIpa || undefined,
          definitionMs: newDefMs,
          definitionEn: newDefEn || undefined,
          examples: newExBj && newExMs ? [{
            sentenceBajau: newExBj,
            sentenceMs: newExMs,
            sentenceEn: newExEn,
            highlightWord: newHw,
          }] : [],
        }),
      });
      if (res.ok) {
        setCreateStatus('✅ Entri berjaya dicipta!');
        setNewHw('');
        setNewDefMs('');
        setNewDefEn('');
        setNewExBj('');
        setNewExMs('');
        setNewExEn('');
        setTimeout(() => setCreateStatus(null), 4000);
        loadEntries('');
      } else {
        const err = await res.json();
        setCreateStatus(`❌ ${err.error || 'Gagal mencipta entri'}`);
      }
    } catch {
      setCreateStatus('❌ Ralat pelayan.');
    }
  };

  const handleModerateSubmission = async (action: 'approve' | 'reject') => {
    if (!moderatingSub) return;
    try {
      const res = await fetch(`/api/admin/submissions/${moderatingSub.id}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify({
          action,
          editedWord: editSubWord,
          editedMeaning: editSubMeaning,
          editedPos: editSubPos,
          reviewerNotes: modNotes,
        }),
      });
      if (res.ok) {
        alert(action === 'approve' ? '✅ Sumbangan berjaya diluluskan dan ditambah ke kamus!' : 'Sumbangan telah ditolak.');
        setModeratingSub(null);
        loadSubmissions();
        loadEntries('');
      } else {
        const err = await res.json();
        alert(`Ralat: ${err.error}`);
      }
    } catch {
      alert('Ralat sambungan.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-xl border border-sand-200 dark:border-stone-800 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 mb-4 text-3xl">
            🔐
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Papan Pemuka Pentadbir
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
            Kamus Bajau Samah — Mod Pengurusan Pangkalan Data Tempatan
          </p>

          <form onSubmit={(e) => { e.preventDefault(); validateLogin(passkey); }} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Kunci Akses Rahsia (*Passkey*)
              </label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Masukkan kata laluan..."
                className="w-full px-4 py-3 rounded-xl border border-sand-300 dark:border-stone-700 bg-sand-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium rounded-xl transition shadow-md"
            >
              Buka Papan Pemuka
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-sand-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-400">
            <Link href="/" className="hover:text-amber-600 transition">
              ← Kembali ke Laman Utama
            </Link>
            <span>Kamus Bajau Samah v1.0</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* Top Navbar */}
      <header className="border-b border-sand-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🪡</span>
          <div>
            <h1 className="font-serif font-bold text-base tracking-tight flex items-center gap-2">
              Kamus Bajau Samah — CMS Pentadbir
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Local-First Active
              </span>
            </h1>
            <p className="text-xs text-stone-500">Pangkalan Data SQLite: {totalEntries} Entri Berautoriti</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-sand-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'entries'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            📚 Sunting Entri ({totalEntries})
          </button>
          <button
            onClick={() => {
              setActiveTab('examples');
              loadExamples();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'examples'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            📝 Sunting Contoh ({totalExamples})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'submissions'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            📥 Moderasi Sumbangan ({submissionsList.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('new_entry')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'new_entry'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            ➕ Tambah Kata Baru
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs px-3 py-1.5 border border-sand-300 dark:border-stone-700 rounded-lg hover:bg-sand-100 dark:hover:bg-stone-800 transition"
          >
            ↗ Buka Kamus Awam
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 rounded-lg transition"
          >
            Log Keluar
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`p-6 mx-auto transition-all duration-300 ${activeTab === 'entries' && selectedEntry ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        {/* TAB 1: LEXICON LIST / DEDICATED EDITOR WITH OPTIONAL SIDEBAR */}
        {activeTab === 'entries' && (
          <div>
            {!selectedEntry ? (
              /* DEDICATED FULL-PAGE LEXICON DIRECTORY & SEARCH VIEW */
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-sand-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col min-h-[75vh]">
                {/* Header Toolbar & Search Filter */}
                <div className="p-6 border-b border-sand-200 dark:border-stone-800 space-y-4 bg-sand-50/50 dark:bg-stone-950/40">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                        Direktori Leksikon Kamus Bajau Samah
                      </h2>
                      <p className="text-xs text-stone-500">
                        Pilih mana-mana kata dasar di bawah untuk membuka editor khusus satu halaman penuh.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab('new_entry')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        ➕ Tambah Kata Baru
                      </button>
                    </div>
                  </div>

                  {/* Search Input Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari kata dasar Bajau Samah, ejaan normalisasi, atau maksud Melayu..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                        loadEntries(e.target.value, selectedLetter, 1);
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          loadEntries('', selectedLetter, 1);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-2 py-1"
                      >
                        ✕ Padam
                      </button>
                    )}
                  </div>

                  {/* Alphabet Filter Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                    <button
                      onClick={() => {
                        setSelectedLetter('');
                        setCurrentPage(1);
                        loadEntries(searchQuery, '', 1);
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition ${
                        selectedLetter === ''
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-sand-200 dark:border-stone-700 hover:bg-sand-100'
                      }`}
                    >
                      Semua Abjad
                    </button>
                    {['a', 'b', 'd', 'e', 'g', 'i', 'j', 'k', 'l', 'm', 'n', 'ng', 'ny', 'o', 'p', 'r', 's', 't', 'u', 'w', 'y'].map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          setSelectedLetter(l);
                          setCurrentPage(1);
                          loadEntries(searchQuery, l, 1);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 uppercase transition ${
                          selectedLetter === l
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-sand-200 dark:border-stone-700 hover:bg-sand-100'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paginated Entries Table / Cards */}
                <div className="flex-1">
                  {isLoadingEntries ? (
                    <div className="p-16 text-center text-sm text-stone-400">Memuatkan senarai entri...</div>
                  ) : entriesList.length === 0 ? (
                    <div className="p-16 text-center text-sm text-stone-400">Tiada entri dijumpai untuk carian ini.</div>
                  ) : (() => {
                    const hwCounts: Record<string, number> = {};
                    const hwIndex: Record<number, number> = {};
                    for (const e of entriesList) {
                      hwCounts[e.headword] = (hwCounts[e.headword] || 0) + 1;
                    }
                    const hwSeen: Record<string, number> = {};
                    const SUPS = ['', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
                    for (const e of entriesList) {
                      if (hwCounts[e.headword] > 1) {
                        hwSeen[e.headword] = (hwSeen[e.headword] || 0) + 1;
                        hwIndex[e.id] = hwSeen[e.headword];
                      }
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
                        {entriesList.map((entry) => {
                          const primaryMs = entry.senses?.[0]?.definitionMs || '-';
                          const primaryEn = entry.senses?.[0]?.definitionEn;
                          const supIdx = hwIndex[entry.id];
                          const sup = supIdx ? SUPS[supIdx] || `⁽${supIdx}⁾` : '';
                          const hasAudio = Boolean(entry.audioUrl);

                          return (
                            <button
                              key={entry.id}
                              onClick={() => {
                                setSelectedEntry(entry);
                                if (typeof window !== 'undefined') {
                                  window.history.replaceState(null, '', `/admin/${encodeURIComponent(entry.headword)}`);
                                }
                              }}
                              className="group p-4 text-left bg-sand-50/50 dark:bg-stone-800/40 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 rounded-2xl border border-sand-200 dark:border-stone-700/80 hover:border-amber-300 dark:hover:border-amber-800 transition duration-150 flex flex-col justify-between"
                            >
                              <div className="space-y-1.5 w-full">
                                <div className="flex items-center justify-between">
                                  <div className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                                    {entry.headword}{sup && <sup className="text-amber-600 ml-0.5 text-xs">{sup}</sup>}
                                  </div>
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-sand-200 dark:bg-stone-800 rounded-md text-stone-700 dark:text-stone-300 font-semibold">
                                    {entry.partOfSpeech.replace('KATA ', '')}
                                  </span>
                                </div>

                                <p className="text-xs font-medium text-stone-700 dark:text-stone-300 line-clamp-1">
                                  {primaryMs}
                                </p>
                                {primaryEn && (
                                  <p className="text-[11px] text-stone-400 italic line-clamp-1">
                                    {primaryEn}
                                  </p>
                                )}
                              </div>

                              <div className="pt-3 mt-3 border-t border-sand-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-400 w-full font-mono">
                                <span>{entry.ipa || '—'}</span>
                                <div className="flex items-center gap-2">
                                  {hasAudio && (
                                    <span className="text-amber-600 dark:text-amber-400 font-bold" title="Mempunyai rakaman audio rasmi">🎙️</span>
                                  )}
                                  <span className="text-amber-700 dark:text-amber-400 font-medium group-hover:underline">Sunting ✎</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Pagination Controls Toolbar */}
                <div className="p-4 border-t border-sand-200 dark:border-stone-800 bg-sand-50/70 dark:bg-stone-950/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage <= 1 || isLoadingEntries}
                      onClick={() => {
                        const prev = Math.max(1, currentPage - 1);
                        setCurrentPage(prev);
                        loadEntries(searchQuery, selectedLetter, prev);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 rounded-xl disabled:opacity-30 hover:bg-sand-100 font-medium transition text-stone-700 dark:text-stone-300"
                    >
                      ◀ Halaman Sebelum
                    </button>
                    <button
                      disabled={currentPage >= totalPages || isLoadingEntries}
                      onClick={() => {
                        const next = Math.min(totalPages, currentPage + 1);
                        setCurrentPage(next);
                        loadEntries(searchQuery, selectedLetter, next);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 rounded-xl disabled:opacity-30 hover:bg-sand-100 font-medium transition text-stone-700 dark:text-stone-300"
                    >
                      Halaman Seterusnya ▶
                    </button>
                  </div>

                  <div className="text-stone-500 text-xs font-medium">
                    Halaman <span className="font-bold text-stone-900 dark:text-stone-100">{currentPage}</span> daripada {totalPages} ({totalEntries} jumlah entri)
                  </div>
                </div>
              </div>
            ) : (
              /* DEDICATED ENTRY EDITOR WITH QUICK-NAV SIDEBAR (1/4 - 3/4 SPLIT) */
              <div className="flex flex-col lg:flex-row items-start gap-6 relative">
                {/* 1/4 Quick Navigation Sidebar (Collapsible) */}
                {isSidebarOpen && (
                  <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-white dark:bg-stone-900 rounded-3xl border border-sand-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col sticky top-20 max-h-[calc(100vh-6rem)]">
                    {/* Sidebar Header & Search */}
                    <div className="p-4 border-b border-sand-200 dark:border-stone-800 space-y-3 bg-sand-50/50 dark:bg-stone-950/40">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>📖</span> Navigasi Pantas
                        </span>
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          title="Sembunyikan panel tepi"
                          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-2 py-1 rounded-lg hover:bg-sand-100 dark:hover:bg-stone-800"
                        >
                          ◀ Tutup
                        </button>
                      </div>

                      {/* Quick Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cari kata dasar..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                            loadEntries(e.target.value, selectedLetter, 1);
                          }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              loadEntries('', selectedLetter, 1);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Compact Alphabet Filter */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin text-[10px]">
                        <button
                          onClick={() => {
                            setSelectedLetter('');
                            setCurrentPage(1);
                            loadEntries(searchQuery, '', 1);
                          }}
                          className={`px-2 py-0.5 rounded-md font-semibold shrink-0 transition ${
                            selectedLetter === ''
                              ? 'bg-amber-600 text-white'
                              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-sand-200 dark:border-stone-700'
                          }`}
                        >
                          Semua
                        </button>
                        {['a', 'b', 'd', 'e', 'g', 'i', 'j', 'k', 'l', 'm', 'n', 'ng', 'ny', 'o', 'p', 'r', 's', 't', 'u', 'w', 'y'].map((l) => (
                          <button
                            key={l}
                            onClick={() => {
                              setSelectedLetter(l);
                              setCurrentPage(1);
                              loadEntries(searchQuery, l, 1);
                            }}
                            className={`px-1.5 py-0.5 rounded-md font-semibold shrink-0 uppercase transition ${
                              selectedLetter === l
                                ? 'bg-amber-600 text-white'
                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-sand-200 dark:border-stone-700'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Entry List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-sand-100 dark:divide-stone-800/80 p-2 space-y-1">
                      {isLoadingEntries ? (
                        <div className="p-8 text-center text-xs text-stone-400">Memuatkan...</div>
                      ) : entriesList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-400">Tiada entri.</div>
                      ) : (
                        entriesList.map((entry) => {
                          const isCurrent = selectedEntry?.id === entry.id;
                          const primaryMs = entry.senses?.[0]?.definitionMs || '-';
                          const hasAudio = Boolean(entry.audioUrl);

                          return (
                            <button
                              key={entry.id}
                              onClick={() => {
                                if (hasUnsavedChanges) {
                                  if (!confirm('Terdapat perubahan yang belum disimpan. Teruskan beralih entri?')) {
                                    return;
                                  }
                                }
                                setSelectedEntry(entry);
                                if (typeof window !== 'undefined') {
                                  window.history.replaceState(null, '', `/admin/${encodeURIComponent(entry.headword)}`);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between gap-2 ${
                                isCurrent
                                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                                  : 'hover:bg-sand-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-serif text-sm font-semibold truncate">
                                    {entry.headword}
                                  </span>
                                  <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                                    isCurrent
                                      ? 'bg-amber-600 text-amber-100'
                                      : 'bg-sand-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                                  }`}>
                                    {entry.partOfSpeech.replace('KATA ', '')}
                                  </span>
                                </div>
                                <p className={`text-[11px] truncate mt-0.5 ${isCurrent ? 'text-amber-100' : 'text-stone-400'}`}>
                                  {primaryMs}
                                </p>
                              </div>
                              {hasAudio && (
                                <span className={`text-xs ${isCurrent ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`}>
                                  🎙️
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Sidebar Pagination Footer */}
                    <div className="p-3 border-t border-sand-200 dark:border-stone-800 bg-sand-50/70 dark:bg-stone-950/80 flex items-center justify-between text-[11px]">
                      <button
                        disabled={currentPage <= 1 || isLoadingEntries}
                        onClick={() => {
                          const prev = Math.max(1, currentPage - 1);
                          setCurrentPage(prev);
                          loadEntries(searchQuery, selectedLetter, prev);
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 rounded-lg disabled:opacity-30 hover:bg-sand-100 text-stone-700 dark:text-stone-300 font-medium"
                      >
                        ◀ Sebelum
                      </button>
                      <span className="text-stone-500 font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        disabled={currentPage >= totalPages || isLoadingEntries}
                        onClick={() => {
                          const next = Math.min(totalPages, currentPage + 1);
                          setCurrentPage(next);
                          loadEntries(searchQuery, selectedLetter, next);
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 rounded-lg disabled:opacity-30 hover:bg-sand-100 text-stone-700 dark:text-stone-300 font-medium"
                      >
                        Seterus ▶
                      </button>
                    </div>
                  </div>
                )}

                {/* 3/4 Main Editor Area */}
                <div className="flex-1 w-full bg-white dark:bg-stone-900 rounded-3xl border border-sand-200 dark:border-stone-800 p-8 shadow-sm space-y-8">
                  {/* Top Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand-200 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="px-3.5 py-2 bg-sand-100 hover:bg-sand-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        ◀ Kembali ke Direktori
                      </button>

                      {!isSidebarOpen && (
                        <button
                          onClick={() => setIsSidebarOpen(true)}
                          className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          📖 Buka Panel Tepi (1/4)
                        </button>
                      )}

                      <div>
                        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          Sunting Kata: <span className="text-amber-600 dark:text-amber-400">{selectedEntry.headword}</span>
                        </h2>
                        <p className="text-xs text-stone-500">ID Entri: #{selectedEntry.id} • Bentuk Carian: {selectedEntry.searchNormalized}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/kamus/${encodeURIComponent(selectedEntry.headword)}`}
                        target="_blank"
                        className="text-xs font-medium px-3.5 py-2 border border-sand-300 dark:border-stone-700 rounded-xl hover:bg-sand-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition"
                      >
                        ↗ Pratonton Laman
                      </Link>
                      <button
                        onClick={handleDeleteEntry}
                        className="text-xs font-semibold px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 hover:bg-rose-100 rounded-xl transition"
                      >
                        Padam Entri
                      </button>
                    </div>
                  </div>

                {/* Core Lexical Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Kata Dasar (*Headword*)
                    </label>
                    <input
                      type="text"
                      value={selectedEntry.headword}
                      onChange={(e) => setSelectedEntry({ ...selectedEntry, headword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Golongan Kata (*POS*)
                    </label>
                    <select
                      value={selectedEntry.partOfSpeech}
                      onChange={(e) => setSelectedEntry({ ...selectedEntry, partOfSpeech: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="KATA NAMA">KATA NAMA</option>
                      <option value="KATA KERJA">KATA KERJA</option>
                      <option value="KATA SIFAT">KATA SIFAT</option>
                      <option value="KATA BILANGAN">KATA BILANGAN</option>
                      <option value="KATA TUGAS / PARTIKEL">KATA TUGAS / PARTIKEL</option>
                      <option value="KATA SENDI NAMA">KATA SENDI NAMA</option>
                      <option value="KATA GANTI NAMA">KATA GANTI NAMA</option>
                      <option value="KATA HUBUNG">KATA HUBUNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Transkripsi Fonetik (*IPA*)
                    </label>
                    <input
                      type="text"
                      value={selectedEntry.ipa || ''}
                      onChange={(e) => setSelectedEntry({ ...selectedEntry, ipa: e.target.value })}
                      placeholder="/ipa/"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                  {/* 🎙️ Studio Sebutan Audio Rasmi (Audio Studio & Bakery) */}
                  <div className="p-5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎙️</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                          Studio Sebutan Audio Rasmi
                        </h3>
                        {selectedEntry.audioUrl ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
                            ✓ Audio Rasmi Tersimpan
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-300 dark:bg-stone-800 dark:text-stone-400">
                            Auto-TTS Dinamik
                          </span>
                        )}
                      </div>

                      {selectedEntry.audioUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteAudio}
                          className="text-[11px] text-rose-600 hover:text-rose-800 underline transition"
                        >
                          Padam Audio Rasmi
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-amber-950/70 dark:text-amber-200/70 leading-relaxed">
                      Dengar pelbagai model suara Austronesia dan simpan (*bake*) sebutan terbaik menjadi fail audio kekal rasmi bagi mengelakkan variasi sebutan rawak.
                    </p>

                    {/* Custom phonetic trigger override & Speed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                            Teks Fonetik Suara (*Custom Phonetic Trigger*)
                          </label>
                          {customPhoneticInput && (
                            <button
                              type="button"
                              onClick={() => setCustomPhoneticInput('')}
                              className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                            >
                              Guna Asal ({selectedEntry.headword})
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={customPhoneticInput || selectedEntry.headword}
                          onChange={(e) => setCustomPhoneticInput(e.target.value)}
                          placeholder="Cth: bé-sé', se-do', suh-do'..."
                          className="w-full px-3.5 py-2 rounded-xl border border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                          Kelajuan Sebutan (*Speech Rate*)
                        </label>
                        <select
                          value={customRate}
                          onChange={(e) => setCustomRate(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="-30%">Sangat Perlahan (-30%)</option>
                          <option value="-25%">Lebih Perlahan (-25%)</option>
                          <option value="-20%">Perlahan Jelas (-20%)</option>
                          <option value="-15%">Perlahan (-15%)</option>
                          <option value="-10%">Sedikit Perlahan (-10%)</option>
                          <option value="-5%">Sederhana (-5% - Asal)</option>
                          <option value="+0%">Normal (0%)</option>
                          <option value="+5%">Sedikit Laju (+5%)</option>
                          <option value="+10%">Laju (+10%)</option>
                          <option value="+15%">Pantas (+15%)</option>
                          <option value="+20%">Sangat Pantas (+20%)</option>
                          <option value="+30%">Ekspres (+30%)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {/* Voice Model Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">Model:</span>
                        <select
                          value={selectedVoice}
                          onChange={(e) => setSelectedVoice(e.target.value)}
                          className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="su">🇮🇩 Sunda / Tuti (Wanita - Disyorkan)</option>
                          <option value="su-m">🇮🇩 Sunda / Jajang (Lelaki - Vokal Tulen)</option>
                          <option value="jv">🇮🇩 Jawa / Siti (Wanita - Glotal & Pepet Mantap)</option>
                          <option value="jv-m">🇮🇩 Jawa / Dimas (Lelaki - Glotal & Pepet)</option>
                          <option value="fil">🇵🇭 Tagalog / Blessica (Wanita)</option>
                          <option value="fil-m">🇵🇭 Tagalog / Angelo (Lelaki)</option>
                          <option value="id">🇮🇩 Indonesia / Gadis (Wanita)</option>
                          <option value="id-m">🇮🇩 Indonesia / Ardi (Lelaki)</option>
                          <option value="ms">🇲🇾 Melayu / Yasmin (Wanita)</option>
                          <option value="ms-m">🇲🇾 Melayu / Osman (Lelaki)</option>
                          <option value="ar">🇪🇬 Arab / Salma (Glotal Hamzah Tulen)</option>
                        </select>
                      </div>

                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => handlePreviewAudio(selectedVoice, customPhoneticInput || selectedEntry.headword)}
                        disabled={isPreviewPlaying}
                        className="px-4 py-2 bg-white dark:bg-stone-800 hover:bg-amber-100/60 border border-amber-300 dark:border-stone-700 text-amber-900 dark:text-amber-200 font-medium rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <span>{isPreviewPlaying ? '🔊 Sedang Main...' : '▶ Uji Dengar'}</span>
                      </button>

                      {/* Bake / Save Button */}
                      <button
                        type="button"
                        onClick={() => handleBakeAudio()}
                        disabled={isBakingAudio}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <span>{isBakingAudio ? '⏳ Menyimpan...' : '💾 Simpan Sebagai Audio Rasmi'}</span>
                      </button>
                    </div>

                    {audioStatusMsg && (
                      <div className="text-xs font-medium text-amber-800 dark:text-amber-300 pt-1">
                        {audioStatusMsg}
                      </div>
                    )}
                  </div>

                  {/* Senses & Definitions */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        Definisi & Terjemahan ({selectedEntry.senses?.length || 0})
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newSenses = [...(selectedEntry.senses || [])];
                          newSenses.push({
                            orderIndex: newSenses.length + 1,
                            definitionMs: '',
                            definitionEn: '',
                            examples: [],
                          });
                          setSelectedEntry({ ...selectedEntry, senses: newSenses });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-xl transition"
                      >
                        + Tambah Definisi Baharu
                      </button>
                    </div>

                    {selectedEntry.senses?.map((sense, sIdx) => (
                      <div key={sIdx} className="p-5 bg-sand-50 dark:bg-stone-800/60 rounded-2xl space-y-4 border border-sand-200 dark:border-stone-700 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            Maksud #{sIdx + 1}
                          </span>
                          {selectedEntry.senses && selectedEntry.senses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Padam Maksud #${sIdx + 1}?`)) {
                                  const newSenses = selectedEntry.senses!.filter((_, i) => i !== sIdx);
                                  setSelectedEntry({ ...selectedEntry, senses: newSenses });
                                }
                              }}
                              className="text-xs font-semibold text-rose-600 hover:underline"
                            >
                              Padam Maksud
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                              Maksud Bahasa Melayu
                            </label>
                            <input
                              type="text"
                              value={sense.definitionMs}
                              onChange={(e) => {
                                const newSenses = [...(selectedEntry.senses || [])];
                                newSenses[sIdx].definitionMs = e.target.value;
                                setSelectedEntry({ ...selectedEntry, senses: newSenses });
                              }}
                              placeholder="Maksud dalam Bahasa Melayu..."
                              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                              English Definition
                            </label>
                            <input
                              type="text"
                              value={sense.definitionEn || ''}
                              onChange={(e) => {
                                const newSenses = [...(selectedEntry.senses || [])];
                                newSenses[sIdx].definitionEn = e.target.value;
                                setSelectedEntry({ ...selectedEntry, senses: newSenses });
                              }}
                              placeholder="English definition..."
                              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        {/* Examples under this Sense */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                              Ayat Contoh ({sense.examples?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newSenses = [...(selectedEntry.senses || [])];
                                if (!newSenses[sIdx].examples) newSenses[sIdx].examples = [];
                                newSenses[sIdx].examples!.push({
                                  sentenceBajau: '',
                                  highlightWord: selectedEntry.headword,
                                  sentenceMs: '',
                                  sentenceEn: '',
                                });
                                setSelectedEntry({ ...selectedEntry, senses: newSenses });
                              }}
                              className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 underline"
                            >
                              + Tambah Ayat Contoh
                            </button>
                          </div>

                          {sense.examples?.map((ex, eIdx) => {
                            const detectedWords = detectWordsInSentence(
                              ex.sentenceBajau,
                              allHeadwordsSet,
                              selectedEntry.headword
                            ).filter(t => t.isWord);

                            return (
                              <div key={eIdx} className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-sand-200 dark:border-stone-700 space-y-3 mb-3">
                                <div className="flex items-center justify-between gap-3">
                                  <input
                                    type="text"
                                    placeholder="Ayat Bajau Samah (cth: Mangan kiti sekot)..."
                                    value={ex.sentenceBajau}
                                    onChange={(e) => {
                                      const newSenses = [...(selectedEntry.senses || [])];
                                      if (newSenses[sIdx].examples) {
                                        newSenses[sIdx].examples![eIdx].sentenceBajau = e.target.value;
                                        setSelectedEntry({ ...selectedEntry, senses: newSenses });
                                      }
                                    }}
                                    className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif focus:ring-2 focus:ring-amber-500"
                                  />
                                  {ex.sentenceBajau && (
                                    <button
                                      type="button"
                                      onClick={() => handlePreviewAudio(selectedVoice, ex.sentenceBajau, customRate)}
                                      title="Uji dengar sebutan ayat ini dengan model suara yang dipilih"
                                      className="px-3 py-2 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-xl transition text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-amber-200 dark:border-stone-700"
                                    >
                                      <span>▶ Uji Ayat</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSenses = [...(selectedEntry.senses || [])];
                                      newSenses[sIdx].examples = newSenses[sIdx].examples!.filter((_, i) => i !== eIdx);
                                      setSelectedEntry({ ...selectedEntry, senses: newSenses });
                                    }}
                                    title="Padam ayat contoh"
                                    className="text-stone-400 hover:text-rose-600 px-2 py-1 text-sm rounded-lg"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Real-time Detected Words in Sentence Bar */}
                                {detectedWords.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 pb-1 px-2.5 bg-sand-50 dark:bg-stone-800/50 rounded-xl border border-sand-200/60 dark:border-stone-700 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                                      Kata Terkesan:
                                    </span>
                                    {detectedWords.map((dt, dtIdx) => {
                                      const isHighlighted = ex.highlightWord?.toLowerCase() === dt.cleaned.toLowerCase();
                                      const inDict = Boolean(dt.matchingHeadword);

                                      return (
                                        <button
                                          key={dtIdx}
                                          type="button"
                                          onClick={() => {
                                            const newSenses = [...(selectedEntry.senses || [])];
                                            newSenses[sIdx].examples![eIdx].highlightWord = dt.cleaned;
                                            setSelectedEntry({ ...selectedEntry, senses: newSenses });
                                          }}
                                          title={inDict ? `Kata dalam kamus ("${dt.matchingHeadword}"). Klik untuk set sebagai kata fokus utama.` : 'Kata belum tersenarai'}
                                          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition flex items-center gap-1 ${
                                            isHighlighted
                                              ? 'bg-amber-600 text-white font-bold shadow-xs'
                                              : inDict
                                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                                              : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200'
                                          }`}
                                        >
                                          <span>{dt.raw}</span>
                                          {isHighlighted ? ' ★' : inDict ? ' ✓' : ''}
                                        </button>
                                      );
                                    })}
                                    <span className="text-[10px] text-stone-400 ml-auto italic">
                                      (Klik kata untuk jadikan kata fokus ★)
                                    </span>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Terjemahan Melayu..."
                                    value={ex.sentenceMs}
                                    onChange={(e) => {
                                      const newSenses = [...(selectedEntry.senses || [])];
                                      if (newSenses[sIdx].examples) {
                                        newSenses[sIdx].examples![eIdx].sentenceMs = e.target.value;
                                        setSelectedEntry({ ...selectedEntry, senses: newSenses });
                                      }
                                    }}
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                                  />
                                  <input
                                    type="text"
                                    placeholder="English translation..."
                                    value={ex.sentenceEn || ''}
                                    onChange={(e) => {
                                      const newSenses = [...(selectedEntry.senses || [])];
                                      if (newSenses[sIdx].examples) {
                                        newSenses[sIdx].examples![eIdx].sentenceEn = e.target.value;
                                        setSelectedEntry({ ...selectedEntry, senses: newSenses });
                                      }
                                    }}
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Morphological Affixes / Turunan Sipitan */}
                  <div className="p-5 bg-sand-50 dark:bg-stone-800/60 rounded-2xl space-y-4 border border-sand-200 dark:border-stone-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        Turunan Sipitan / Terbitan Imbuhan ({selectedEntry.affixes?.length || 0})
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newAffixes = [...(selectedEntry.affixes || [])];
                          newAffixes.push({
                            term: '',
                            meaningMs: '',
                            meaningEn: '',
                          });
                          setSelectedEntry({ ...selectedEntry, affixes: newAffixes });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-xl transition"
                      >
                        + Tambah Imbuhan
                      </button>
                    </div>

                    {selectedEntry.affixes?.map((aff, aIdx) => (
                      <div key={aIdx} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-sand-200 dark:border-stone-700 items-center">
                        <input
                          type="text"
                          placeholder="Bentuk Terbitan (cth: panganan)..."
                          value={aff.term}
                          onChange={(e) => {
                            const newAff = [...(selectedEntry.affixes || [])];
                            newAff[aIdx].term = e.target.value;
                            setSelectedEntry({ ...selectedEntry, affixes: newAff });
                          }}
                          className="px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold text-amber-900 dark:text-amber-300"
                        />
                        <input
                          type="text"
                          placeholder="Maksud Melayu..."
                          value={aff.meaningMs}
                          onChange={(e) => {
                            const newAff = [...(selectedEntry.affixes || [])];
                            newAff[aIdx].meaningMs = e.target.value;
                            setSelectedEntry({ ...selectedEntry, affixes: newAff });
                          }}
                          className="px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="English meaning..."
                            value={aff.meaningEn || ''}
                            onChange={(e) => {
                              const newAff = [...(selectedEntry.affixes || [])];
                              newAff[aIdx].meaningEn = e.target.value;
                              setSelectedEntry({ ...selectedEntry, affixes: newAff });
                            }}
                            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAff = selectedEntry.affixes!.filter((_, i) => i !== aIdx);
                              setSelectedEntry({ ...selectedEntry, affixes: newAff });
                            }}
                            className="text-stone-400 hover:text-rose-600 px-2 py-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section 4: Dialects & Spelling Variants */}
                  <div className="space-y-4 pt-4 border-t border-sand-200 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>📍</span> Variasi Ejaan & Dialek Tempatan ({selectedEntry.dialects?.length || 0})
                        </h3>
                        <p className="text-xs text-stone-500">
                          Bentuk ejaan alternatif (*spelling variants*) atau sebutan mengikut dialek daerah (Kota Belud, Tuaran, Papar, Semporna, dll.) yang boleh dicari secara automatik.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newDialects = [...(selectedEntry.dialects || [])];
                            newDialects.push({
                              localityName: 'Varian Ejaan',
                              dialectForm: '',
                            });
                            setSelectedEntry({ ...selectedEntry, dialects: newDialects });
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl transition border border-amber-200 dark:border-amber-800/40"
                        >
                          + Varian Ejaan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newDialects = [...(selectedEntry.dialects || [])];
                            newDialects.push({
                              localityName: 'Kota Belud (Piawai)',
                              dialectForm: selectedEntry.headword,
                            });
                            setSelectedEntry({ ...selectedEntry, dialects: newDialects });
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-xl transition"
                        >
                          + Dialek Daerah
                        </button>
                      </div>
                    </div>

                    {selectedEntry.dialects?.map((dia, dIdx) => (
                      <div key={dIdx} className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-sand-200 dark:border-stone-700 items-center">
                        <select
                          value={dia.localityName}
                          onChange={(e) => {
                            const newDia = [...(selectedEntry.dialects || [])];
                            newDia[dIdx].localityName = e.target.value;
                            setSelectedEntry({ ...selectedEntry, dialects: newDia });
                          }}
                          className="px-3 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Varian Ortografi">📝 Varian Ortografi</option>
                          <option value="Kota Belud (Piawai)">📍 Kota Belud (Piawai)</option>
                          <option value="Kota Belud">📍 Kota Belud</option>
                          <option value="Tuaran">📍 Tuaran</option>
                          <option value="Papar">📍 Papar / Kawang</option>
                          <option value="Kudat">📍 Kudat / Banggi</option>
                          <option value="Semporna">📍 Semporna / Pantai Timur</option>
                          {dia.localityName && !['Varian Ortografi', 'Varian Ejaan', 'Kota Belud (Piawai)', 'Kota Belud', 'Tuaran', 'Papar', 'Kudat', 'Semporna'].includes(dia.localityName) && (
                            <option value={dia.localityName}>📍 {dia.localityName}</option>
                          )}
                        </select>
                        <input
                          type="text"
                          placeholder="Bentuk Perkataan (cth: kepa, bu'e', panganan)..."
                          value={dia.dialectForm}
                          onChange={(e) => {
                            const newDia = [...(selectedEntry.dialects || [])];
                            newDia[dIdx].dialectForm = e.target.value;
                            setSelectedEntry({ ...selectedEntry, dialects: newDia });
                          }}
                          className="px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif font-medium focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDia = selectedEntry.dialects!.filter((_, i) => i !== dIdx);
                            setSelectedEntry({ ...selectedEntry, dialects: newDia });
                          }}
                          className="text-stone-400 hover:text-rose-600 px-2 py-1 text-xs"
                          title="Padam varian"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Unsaved Changes Banner */}
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                      </span>
                      <span className="font-semibold">Terdapat perubahan yang belum disimpan.</span>
                      <span className="text-amber-600 dark:text-amber-400 ml-auto font-medium">Tekan <kbd className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 rounded font-mono text-[10px] border border-amber-300 dark:border-amber-700">Ctrl + Enter</kbd> untuk simpan</span>
                    </div>
                  )}

                  {/* Save Button Bar */}
                  <div className="pt-4 flex items-center justify-between border-t border-sand-200 dark:border-stone-800">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{saveStatus}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold rounded-xl text-xs transition"
                      >
                        Tutup & Kembali
                      </button>
                      <button
                        onClick={handleSaveEntry}
                        title="Simpan (Ctrl+Enter)"
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        💾 Simpan Perubahan
                        <span className="text-[10px] opacity-70 font-mono">Ctrl+↵</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.5: DEDICATED SUNTING CONTOH & AUDIO STUDIO */}
        {activeTab === 'examples' && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-sand-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col min-h-[75vh]">
            {/* Header Toolbar & Search Filter */}
            <div className="p-6 border-b border-sand-200 dark:border-stone-800 space-y-4 bg-sand-50/50 dark:bg-stone-950/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>📝</span> Studio Sunting Contoh & Audio Ayat
                  </h2>
                  <p className="text-xs text-stone-500">
                    Pengurusan korpus ayat contoh kamus, pemautan kata automatik (*auto-linking*), dan studio sebutan audio ayat rasmi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadExamples()}
                    className="px-3.5 py-2 bg-sand-100 dark:bg-stone-800 text-xs font-semibold rounded-xl hover:bg-sand-200 text-stone-700 dark:text-stone-300 transition flex items-center gap-1.5"
                  >
                    🔄 Muat Semula
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cari ayat Bajau Samah, terjemahan Melayu, atau kata dasar..."
                    value={examplesSearchQuery}
                    onChange={(e) => {
                      setExamplesSearchQuery(e.target.value);
                      setExamplesPage(1);
                      loadExamples(e.target.value, examplesFilter, 1);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                  />
                  {examplesSearchQuery && (
                    <button
                      onClick={() => {
                        setExamplesSearchQuery('');
                        loadExamples('', examplesFilter, 1);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-2 py-1"
                    >
                      ✕ Padam
                    </button>
                  )}
                </div>

                {/* Filter Pill Selector */}
                <div className="flex items-center gap-1.5 bg-sand-100 dark:bg-stone-800 p-1.5 rounded-2xl shrink-0 text-xs">
                  <button
                    onClick={() => {
                      setExamplesFilter('all');
                      setExamplesPage(1);
                      loadExamples(examplesSearchQuery, 'all', 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-medium transition ${
                      examplesFilter === 'all'
                        ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Semua ({totalExamples})
                  </button>
                  <button
                    onClick={() => {
                      setExamplesFilter('has_audio');
                      setExamplesPage(1);
                      loadExamples(examplesSearchQuery, 'has_audio', 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1 ${
                      examplesFilter === 'has_audio'
                        ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <span>🎙️ Ada Audio</span>
                  </button>
                  <button
                    onClick={() => {
                      setExamplesFilter('no_audio');
                      setExamplesPage(1);
                      loadExamples(examplesSearchQuery, 'no_audio', 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-medium transition ${
                      examplesFilter === 'no_audio'
                        ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Tiada Audio
                  </button>
                  <button
                    onClick={() => {
                      setExamplesFilter('no_highlight');
                      setExamplesPage(1);
                      loadExamples(examplesSearchQuery, 'no_highlight', 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-medium transition ${
                      examplesFilter === 'no_highlight'
                        ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Tiada Kata Fokus
                  </button>
                </div>
              </div>
            </div>

            {/* Examples List */}
            <div className="flex-1 p-6 space-y-6">
              {isLoadingExamples ? (
                <div className="p-16 text-center text-sm text-stone-400">Memuatkan senarai contoh ayat...</div>
              ) : examplesList.length === 0 ? (
                <div className="p-16 text-center text-sm text-stone-400">Tiada ayat contoh dijumpai bagi padanan ini.</div>
              ) : (
                examplesList.map((ex) => {
                  const detectedWords = detectWordsInSentence(
                    ex.sentenceBajau,
                    allHeadwordsSet,
                    ex.headword
                  ).filter(t => t.isWord);

                  const isPlayingThis = examplePlayingId === ex.id;
                  const isBakingThis = bakingExampleId === ex.id;
                  const saveMsg = exampleSaveStatus[ex.id];
                  const audioMsg = exampleAudioStatus[ex.id];

                  return (
                    <div
                      key={ex.id}
                      className="p-6 bg-sand-50/50 dark:bg-stone-800/40 rounded-3xl border border-sand-200 dark:border-stone-700/80 shadow-xs space-y-5 hover:border-amber-200 dark:hover:border-amber-900/60 transition"
                    >
                      {/* Top Bar: Headword & Sense Context Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-200/70 dark:border-stone-700/70">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => {
                              // Find entry and switch to entries tab
                              fetch(`/api/admin/entries?q=${encodeURIComponent(ex.headword)}&letter=&page=1&limit=20`, {
                                headers: { 'x-admin-key': passkey },
                              })
                                .then(r => r.json())
                                .then(data => {
                                  const found = data.entries?.find((item: any) => item.id === ex.entryId);
                                  if (found) {
                                    setSelectedEntry(found);
                                    setActiveTab('entries');
                                  }
                                });
                            }}
                            className="font-serif font-bold text-base text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5"
                            title="Buka kata dasar ini dalam editor leksikon"
                          >
                            <span>📖</span>
                            <span>{ex.headword}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-sand-200 dark:bg-stone-800 rounded-md text-stone-700 dark:text-stone-300 font-semibold">
                              {ex.partOfSpeech.replace('KATA ', '')}
                            </span>
                          </button>

                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500">
                            Maksud #{ex.senseOrderIndex}: <span className="italic">{ex.senseDefinitionMs}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ex.audioUrl ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
                              ✓ Audio Rasmi Tersimpan
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-300 dark:bg-stone-800 dark:text-stone-400">
                              Auto-TTS Dinamik
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteExample(ex.id)}
                            className="text-xs font-semibold px-3 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                          >
                            Padam
                          </button>
                        </div>
                      </div>

                      {/* Main Editable Fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Ayat Bajau Samah
                          </label>
                          <input
                            type="text"
                            value={ex.sentenceBajau}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamplesList(prev => prev.map(item => item.id === ex.id ? { ...item, sentenceBajau: val } : item));
                            }}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif font-medium focus:ring-2 focus:ring-amber-500 shadow-xs"
                          />
                        </div>

                        {/* Real-time Detected Words in Sentence Bar */}
                        {detectedWords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 py-2 px-3 bg-white dark:bg-stone-900 rounded-xl border border-sand-200 dark:border-stone-700 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                              Kata Terkesan:
                            </span>
                            {detectedWords.map((dt, dtIdx) => {
                              const isHighlighted = ex.highlightWord?.toLowerCase() === dt.cleaned.toLowerCase();
                              const inDict = Boolean(dt.matchingHeadword);

                              return (
                                <button
                                  key={dtIdx}
                                  type="button"
                                  onClick={() => {
                                    setExamplesList(prev => prev.map(item => item.id === ex.id ? { ...item, highlightWord: dt.cleaned } : item));
                                  }}
                                  title={inDict ? `Kata dalam kamus ("${dt.matchingHeadword}"). Klik untuk set sebagai kata fokus utama ★.` : 'Kata belum tersenarai'}
                                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition flex items-center gap-1 ${
                                    isHighlighted
                                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                                      : inDict
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200'
                                  }`}
                                >
                                  <span>{dt.raw}</span>
                                  {isHighlighted ? ' ★' : inDict ? ' ✓' : ''}
                                </button>
                              );
                            })}
                            <span className="text-[10px] text-stone-400 ml-auto italic">
                              (Klik kata untuk jadikan kata fokus ★)
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Terjemahan Bahasa Melayu
                            </label>
                            <input
                              type="text"
                              value={ex.sentenceMs}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExamplesList(prev => prev.map(item => item.id === ex.id ? { ...item, sentenceMs: val } : item));
                              }}
                              className="w-full px-4 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              English Translation (Pilihan)
                            </label>
                            <input
                              type="text"
                              value={ex.sentenceEn || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExamplesList(prev => prev.map(item => item.id === ex.id ? { ...item, sentenceEn: val } : item));
                              }}
                              placeholder="English translation..."
                              className="w-full px-4 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Integrated Sentence Audio Bakery Studio */}
                      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <span>🎙️</span> Studio Sebutan Ayat
                          </span>
                          {ex.audioUrl && (
                            <button
                              type="button"
                              onClick={() => handleDeleteExampleAudio(ex)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 underline transition text-left"
                            >
                              Padam Audio Rasmi Ayat
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {/* Voice Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-600 dark:text-stone-400">Model:</span>
                            <select
                              value={selectedVoice}
                              onChange={(e) => setSelectedVoice(e.target.value)}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium"
                            >
                              <option value="su">🇮🇩 Sunda / Tuti (Wanita - Disyorkan)</option>
                              <option value="su-m">🇮🇩 Sunda / Jajang (Lelaki)</option>
                              <option value="jv">🇮🇩 Jawa / Siti (Wanita)</option>
                              <option value="jv-m">🇮🇩 Jawa / Dimas (Lelaki)</option>
                              <option value="fil">🇵🇭 Tagalog / Blessica (Wanita)</option>
                              <option value="fil-m">🇵🇭 Tagalog / Angelo (Lelaki)</option>
                              <option value="id">🇮🇩 Indonesia / Gadis (Wanita)</option>
                              <option value="ms">🇲🇾 Melayu / Yasmin (Wanita)</option>
                            </select>
                          </div>

                          {/* Rate Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-600 dark:text-stone-400">Kelajuan:</span>
                            <select
                              value={customRate}
                              onChange={(e) => setCustomRate(e.target.value)}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium"
                            >
                              <option value="-20%">Perlahan Jelas (-20%)</option>
                              <option value="-10%">Sedikit Perlahan (-10%)</option>
                              <option value="-5%">Sederhana (-5% - Asal)</option>
                              <option value="+0%">Normal (0%)</option>
                              <option value="+10%">Laju (+10%)</option>
                            </select>
                          </div>

                          {/* Play / Test Button */}
                          <button
                            type="button"
                            onClick={() => handlePlaySentenceAudio(ex.id, ex.sentenceBajau, ex.audioUrl)}
                            className="px-3.5 py-1.5 bg-white dark:bg-stone-800 hover:bg-amber-100/60 border border-amber-300 dark:border-stone-700 text-amber-900 dark:text-amber-200 font-medium rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
                          >
                            <span>{isPlayingThis ? '🔊 Memainkan...' : '▶ Uji Dengar'}</span>
                          </button>

                          {/* Bake Button */}
                          <button
                            type="button"
                            onClick={() => handleBakeExampleAudio(ex)}
                            disabled={isBakingThis}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>{isBakingThis ? '⏳ Menyimpan...' : '💾 Simpan Audio Rasmi'}</span>
                          </button>

                          {audioMsg && (
                            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 ml-2">
                              {audioMsg}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Save Bar for this Example */}
                      <div className="flex items-center justify-between pt-2 border-t border-sand-200/50 dark:border-stone-700/50">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {saveMsg || ''}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSaveExample(ex)}
                          className="px-5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5"
                        >
                          💾 Simpan Teks Ayat
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-sand-200 dark:border-stone-800 bg-sand-50/70 dark:bg-stone-950/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  disabled={examplesPage <= 1 || isLoadingExamples}
                  onClick={() => {
                    const prev = Math.max(1, examplesPage - 1);
                    setExamplesPage(prev);
                    loadExamples(examplesSearchQuery, examplesFilter, prev);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 rounded-xl disabled:opacity-30 hover:bg-sand-100 font-medium transition text-stone-700 dark:text-stone-300"
                >
                  ◀ Halaman Sebelum
                </button>
                <button
                  disabled={examplesPage >= examplesTotalPages || isLoadingExamples}
                  onClick={() => {
                    const next = Math.min(examplesTotalPages, examplesPage + 1);
                    setExamplesPage(next);
                    loadExamples(examplesSearchQuery, examplesFilter, next);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-sand-300 dark:border-stone-700 rounded-xl disabled:opacity-30 hover:bg-sand-100 font-medium transition text-stone-700 dark:text-stone-300"
                >
                  Halaman Seterusnya ▶
                </button>
              </div>

              <div className="text-stone-500 text-xs font-medium">
                Halaman <span className="font-bold text-stone-900 dark:text-stone-100">{examplesPage}</span> daripada {examplesTotalPages} ({totalExamples} jumlah ayat)
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSIONS MODERATION */}
        {activeTab === 'submissions' && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-sand-200 dark:border-stone-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold">Barisan Moderasi Cadangan Komuniti</h2>
                <p className="text-xs text-stone-500">Semak, sunting ejaan, dan luluskan sumbangan perkataan ke dalam kamus rasmi.</p>
              </div>
              <button
                onClick={() => loadSubmissions()}
                className="px-3.5 py-1.5 bg-sand-100 dark:bg-stone-800 text-xs font-semibold rounded-xl hover:bg-sand-200 transition"
              >
                🔄 Muat Semula
              </button>
            </div>

            {isLoadingSubmissions ? (
              <div className="p-12 text-center text-xs text-stone-400">Memuatkan senarai sumbangan...</div>
            ) : submissionsList.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400">Tiada sumbangan komuniti yang direkodkan setakat ini.</div>
            ) : (
              <div className="divide-y divide-sand-100 dark:divide-stone-800">
                {submissionsList.map((sub) => (
                  <div key={sub.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">{sub.headword}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status}
                        </span>
                        <span className="text-xs text-stone-400">• Disumbang oleh: {sub.contributorName || 'Anon'} ({sub.locality || 'Sabah'})</span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300"><strong>Maksud:</strong> {sub.meaning}</p>
                      {sub.exampleSentence && (
                        <p className="text-xs text-stone-500 italic">"{sub.exampleSentence}"</p>
                      )}
                      {sub.notes && (
                        <p className="text-[11px] text-stone-400">Catatan: {sub.notes}</p>
                      )}
                    </div>

                    {sub.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setModeratingSub(sub);
                            setEditSubWord(sub.headword);
                            setEditSubMeaning(sub.meaning);
                          }}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition"
                        >
                          Semak & Luluskan
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tolak sumbangan "${sub.headword}"?`)) {
                              setModeratingSub(sub);
                              handleModerateSubmission('reject');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-red-100 hover:text-red-700 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-semibold transition"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Moderation Modal */}
            {moderatingSub && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-lg w-full border border-sand-200 dark:border-stone-800 shadow-2xl space-y-4">
                  <h3 className="font-serif text-lg font-bold">Luluskan Perkataan ke Kamus Rasmi</h3>
                  <p className="text-xs text-stone-500">Anda boleh membetulkan ejaan mengikut ORTHOGRAPHY.md sebelum diluluskan.</p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 mb-1">Kata Dasar Bajau Samah</label>
                      <input
                        type="text"
                        value={editSubWord}
                        onChange={(e) => setEditSubWord(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 dark:border-stone-700 font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 mb-1">Maksud / Definisi Melayu</label>
                      <input
                        type="text"
                        value={editSubMeaning}
                        onChange={(e) => setEditSubMeaning(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 dark:border-stone-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 mb-1">Golongan Kata</label>
                      <select
                        value={editSubPos}
                        onChange={(e) => setEditSubPos(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 dark:border-stone-700"
                      >
                        <option value="KATA NAMA">KATA NAMA</option>
                        <option value="KATA KERJA">KATA KERJA</option>
                        <option value="KATA SIFAT">KATA SIFAT</option>
                        <option value="KATA BILANGAN">KATA BILANGAN</option>
                        <option value="KATA TUGAS / PARTIKEL">KATA TUGAS / PARTIKEL</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-sand-100 dark:border-stone-800">
                    <button
                      onClick={() => setModeratingSub(null)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-sand-100 rounded-xl transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleModerateSubmission('approve')}
                      className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                    >
                      ✅ Sah & Tambah ke Kamus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE NEW ENTRY */}
        {activeTab === 'new_entry' && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-sand-200 dark:border-stone-800 p-8 shadow-sm max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-2">Tambah Entri Rasmi Baharu</h2>
            <p className="text-xs text-stone-500 mb-6">
              Entri yang ditambah akan terus dimasukkan ke dalam pangkalan data SQLite dan diindeks untuk enjin carian.
            </p>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Kata Dasar (*Headword*) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cth: sumbang"
                    value={newHw}
                    onChange={(e) => setNewHw(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 text-sm font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Golongan Kata (*POS*) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 text-sm"
                  >
                    <option value="KATA NAMA">KATA NAMA</option>
                    <option value="KATA KERJA">KATA KERJA</option>
                    <option value="KATA SIFAT">KATA SIFAT</option>
                    <option value="KATA BILANGAN">KATA BILANGAN</option>
                    <option value="KATA TUGAS / PARTIKEL">KATA TUGAS / PARTIKEL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Transkripsi IPA (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="Cth: /sumbaŋ/ (auto-dijana jika kosong)"
                  value={newIpa}
                  onChange={(e) => setNewIpa(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Maksud / Definisi Bahasa Melayu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: derma, sumbangan"
                  value={newDefMs}
                  onChange={(e) => setNewDefMs(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  English Definition (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="Cth: donation, contribution"
                  value={newDefEn}
                  onChange={(e) => setNewDefEn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 dark:border-stone-700 text-sm"
                />
              </div>

              <div className="p-4 bg-sand-50 dark:bg-stone-800 rounded-2xl space-y-3 border border-sand-200 dark:border-stone-700">
                <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">Ayat Contoh (Pilihan)</h4>
                <input
                  type="text"
                  placeholder="Ayat Bajau Samah..."
                  value={newExBj}
                  onChange={(e) => setNewExBj(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-serif"
                />
                <input
                  type="text"
                  placeholder="Terjemahan Melayu..."
                  value={newExMs}
                  onChange={(e) => setNewExMs(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                />
              </div>

              {createStatus && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 rounded-xl">
                  {createStatus}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm transition shadow-md"
              >
                ➕ Cipta Entri Rasmi
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
