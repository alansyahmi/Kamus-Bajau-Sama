/**
 * KAMUS BAJAU SAMAH — INTERACTIVE PROTOTYPE CONTROLLER
 */

// Sample authorized lexical database for realistic prototype testing
const DICTIONARY_DATABASE = [
  {
    word: "laa'",
    pos: "KATA NAMA",
    ipa: "/laːʔ/",
    definitionMs: "darah",
    definitionEn: "blood",
    affixes: [
      { term: "ngelaa'", desc: "berdarah (Ragam Pelaku)", isAttested: true, link: "ngelaa'" },
      { term: "belaa'", desc: "mempunyai darah", isTheoretical: true },
      { term: "pelaa'an", desc: "tempat darah", isTheoretical: true }
    ],
    dialects: [
      { loc: "Kota Belud", val: "laa'" },
      { loc: "Tuaran", val: "laa'" },
      { loc: "Kawang", val: "laa'" }
    ],
    example: {
      bajau: "Lumua' laa' lua' betis-nu.",
      highlight: "laa'",
      ms: "Keluar darah dari betis kamu.",
      en: "Blood is coming out from your calf."
    },
    thesaurus: [
      { word: "ngelaa'", sub: "berdarah" },
      { word: "sedo'", sub: "luka" }
    ]
  },
  {
    word: "ngelaa'",
    pos: "KATA KERJA",
    ipa: "/ŋəlaːʔ/",
    definitionMs: "berdarah, mengeluarkan darah",
    definitionEn: "to bleed, bloody",
    rootEntry: {
      word: "laa'",
      meaning: "darah",
      pattern: "nge- + KATA DASAR (Ragam Pelaku)"
    },
    affixes: [
      { term: "laa'", desc: "darah (Kata Dasar)", isAttested: true, link: "laa'" },
      { term: "ningelaa'", desc: "diberdarahkan (Ragam Pasif)", isTheoretical: true }
    ],
    dialects: [
      { loc: "Kota Belud", val: "ngelaa'" },
      { loc: "Tuaran", val: "ngelaa'" }
    ],
    example: {
      bajau: "Ngelaa' jo poyo-no boi takad batu.",
      highlight: "Ngelaa'",
      ms: "Berdarahlah kakinya selepas terhantuk batu.",
      en: "His leg bled after hitting a stone."
    },
    thesaurus: [
      { word: "laa'", sub: "darah" }
    ]
  },
  {
    word: "bagi",
    pos: "KATA KERJA",
    ipa: "/ba.gi/",
    definitionMs: "bahagi",
    definitionEn: "to divide, share",
    affixes: [
      { term: "magi", desc: "mebahagi (Ragam Pelaku)", isTheoretical: true },
      { term: "binagi", desc: "dibahagi (Ragam Pasif)", isTheoretical: true },
      { term: "pebagi", desc: "membahagikan (Kausatif)", isTheoretical: true },
      { term: "bagian", desc: "bahagian (Kata Nama Terbitan)", isAttested: true, link: "bagian" }
    ],
    dialects: [
      { loc: "Kota Belud", val: "bagi" },
      { loc: "Tuaran", val: "bagi" }
    ],
    example: {
      bajau: "Baginou paray tu duo tumpuk.",
      highlight: "Baginou",
      ms: "Bahagikan padi ini kepada dua longgok.",
      en: "Divide this unhusked rice into two heaps."
    },
    thesaurus: [
      { word: "bagian", sub: "bahagian" }
    ]
  },
  {
    word: "bagian",
    pos: "KATA NAMA",
    ipa: "/ba.gi.an/",
    definitionMs: "bahagian, peruntukan",
    definitionEn: "portion, share, part",
    rootEntry: {
      word: "bagi",
      meaning: "bahagi",
      pattern: "KATA DASAR + -an (Kata Nama Terbitan)"
    },
    affixes: [
      { term: "bagi", desc: "bahagi (Kata Dasar)", isAttested: true, link: "bagi" }
    ],
    dialects: [
      { loc: "Kota Belud", val: "bagian" }
    ],
    example: {
      bajau: "Tu no bagian dikau.",
      highlight: "bagian",
      ms: "Inilah bahagian kamu.",
      en: "This is your share."
    },
    thesaurus: [
      { word: "bagi", sub: "bahagi" }
    ]
  },
  {
    word: "mangan",
    pos: "KATA KERJA",
    ipa: "/maː.ŋan/",
    definitionMs: "makan",
    definitionEn: "to eat",
    affixes: [
      { term: "nge-mangan", desc: "memakan (Ragam Pelaku)", isTheoretical: true },
      { term: "minangan", desc: "dimakan (Ragam Pasif)", isTheoretical: true },
      { term: "pemangan", desc: "memberi makan (Kausatif)", isTheoretical: true },
      { term: "manganan", desc: "makanan (Kata Nama Terbitan)", isTheoretical: true }
    ],
    dialects: [
      { loc: "Kota Belud", val: "mangan (piawai)" },
      { loc: "Tuaran", val: "mangan / pemangan" },
      { loc: "Kawang", val: "mangan" }
    ],
    example: {
      bajau: "Boi jo gai mangan, turino gai.",
      highlight: "mangan",
      ms: "Selepas mereka makan, mereka pun tidur.",
      en: "After they ate, they went to sleep."
    },
    thesaurus: [
      { word: "nginum", sub: "minum" },
      { word: "kinakan", sub: "makanan" }
    ]
  },
  {
    word: "tilau",
    pos: "KATA KERJA",
    ipa: "/ti.law/",
    definitionMs: "tanya",
    definitionEn: "to ask",
    affixes: [
      { term: "nilau", desc: "menanya (Ragam Pelaku)", isTheoretical: true },
      { term: "tinilau", desc: "ditanya (Ragam Pasif)", isTheoretical: true },
      { term: "patilau", desc: "bertanya-tanya", isTheoretical: true }
    ],
    dialects: [
      { loc: "Kota Belud", val: "tilau" },
      { loc: "Tuaran", val: "tilau" }
    ],
    example: {
      bajau: "Tilauno mio.",
      highlight: "Tilauno",
      ms: "Tanyalah sama dia.",
      en: "Ask him/her."
    },
    thesaurus: [
      { word: "pantun", sub: "bicara" }
    ]
  },
  {
    word: "jomo",
    pos: "KATA NAMA",
    ipa: "/dʒo.mo/",
    definitionMs: "orang, manusia",
    definitionEn: "person, human, people",
    affixes: [
      { term: "bejomo", desc: "mempunyai orang", isTheoretical: true },
      { term: "pejomoon", desc: "tempat orang / persinggahan (Harmoni Vokal -on)", isTheoretical: true }
    ],
    dialects: [
      { loc: "Kota Belud", val: "jomo" },
      { loc: "Tuaran", val: "jomo" }
    ],
    example: {
      bajau: "Suang jomo teko diom majlis.",
      highlight: "jomo",
      ms: "Banyak orang datang dalam majlis.",
      en: "Many people came to the gathering."
    },
    thesaurus: [
      { word: "anak", sub: "anak" }
    ]
  }
      { word: "nginum", sub: "minum" }
]
  },
{
  word: "nginum",
    pos: "KATA KERJA",
      ipa: "/ŋi.num/",
        definitionMs: "minum",
          definitionEn: "to drink",
            affixes: [
              { term: "ninginum", desc: "diminum" }
            ],
              dialects: [
                { loc: "Kota Belud", val: "ngonsop" }
              ],
                example: {
    bajau: "Ngonsop kopi kita.",
      highlight: "Ngonsop",
        ms: "Mari kita minum kopi.",
          en: "Let's drink coffee."
  },
  thesaurus: [
    { word: "boe'", sub: "air" }
  ]
}
];

// Current State
let currentPage = 'home';
let currentEntry = DICTIONARY_DATABASE[0];
let currentLang = 'ms';

// DOM Elements
const homeSearchInput = document.getElementById('home-search-input');
const navSearchInput = document.getElementById('nav-search-input');
const searchSuggestions = document.getElementById('search-suggestions');
const btnClearSearch = document.getElementById('btn-clear-search');
const searchHintText = document.getElementById('search-hint-text');

// ============================================================
// I18N — Translation Strings
// ============================================================
const TRANSLATIONS = {
  ms: {
    nav_glosari: 'Glosari', nav_cadang: 'Cadang', nav_tentang: 'Tentang',
    hero_desc: 'Mulakan pencarian, atau cadangkan perkataan baharu untuk meluaskan kosa kata kamus ini.',
    search_label: 'BAR PENCARIAN',
    search_placeholder: 'Cari perkataan dalam bahasa Bajau, Melayu atau Inggeris.',
    search_hint: 'Cadangan akan muncul di sini apabila anda menaip sesuatu.',
    btn_clear: 'Padam', btn_search: 'Cari', trending_label: 'Trending:',
    nav_search_placeholder: 'Cari perkataan.',
    entry_affixes: 'Terbitan Imbuhan', entry_dialects: 'Variasi Daerah',
    entry_definition: 'Definisi', entry_examples: 'Contoh Penggunaan',
    entry_source: '<strong>Sumber:</strong> Informan Lisan (Kota Belud) \u2022 Disemak oleh Penutur Jati',
    entry_suggest_btn: '+ Cadang Maklumat',
    about_kicker: 'INISIATIF PEMELIHARAAN WARISAN BAHASA',
    about_title: 'Memelihara Warisan Lisan,<br>Memperkasa Penutur <em>Generasi Hadapan.</em>',
    about_lead: '<strong>Kamus Bajau Samah</strong> ialah sebuah sumber leksikal digital terbuka yang diasaskan untuk mendokumentasikan, meraikan dan memperluaskan kosa kata bahasa Bajau Samah agar kekal hidup dan mudah diakses oleh semua lapisan masyarakat.',
    about_cta_title: 'Sumbangkan Pengetahuan Anda',
    about_cta_desc: 'Kamus ini berkembang seiring dengan sumbangan anda. Jika anda mengetahui perkataan, sebutan, dialek setempat atau contoh ayat baharu, kongsi bersama kami untuk dinilai dan dimasukkan ke dalam pangkalan data rasmi.',
    about_cta_btn: '+ Cadang Perkataan Sekarang',
  },
  bj: {
    nav_glosari: 'Glosari', nav_cadang: 'Sadang', nav_tentang: 'Pasal',
    hero_desc: "Mulai memia, atau sadang pekataan bau untuk ngeluas kosa kata kamus tu.",
    search_label: 'BAR PEMIAAN',
    search_placeholder: "Pemia pekataan diom ling Sama, Melayu, atau Inggeris.",
    search_hint: 'Pesadangan akan pelua\' ta\' mitu mun nitaip pekataan.',
    btn_clear: 'Ala\'', btn_search: 'Pemia', trending_label: 'Terending:',
    nav_search_placeholder: 'Pemia pekataan.',
    entry_affixes: 'Turunan Sipitan', entry_dialects: 'Variasi Daerah',
    entry_definition: 'Definisi', entry_examples: 'Sonto Pegunoon',
    entry_source: '<strong>Poon:</strong> Informan Lisan (Kota Belud) \u2022 Nisimak le\' Penutur Jati',
    entry_suggest_btn: '+ Sadang Maklumat',
    about_kicker: 'INISIATIF PEMELOROON WARISAN LING-TI',
    about_title: 'Meloro Warisan Lisan,<br>Memperkasa Pemakai <em>Generasi Baru.</em>',
    about_lead: "<strong>Kamus Bajau Samah</strong> iono po'on leksikal digital binuka' yang niasas untuk mendokumentasi, mera\'i ko' mopoluasan kosa kata bahasa Bajau Samah supaya kekal hidup bo' terbuka kepada alam masyarakat.",
    about_cta_title: 'Sumbangin Pengeratian-nu',
    about_cta_desc: "Kamus tu bekembang sebia engko' sumbangan-nu. Mun ngerati-nu pekataan, sebutan, lugat setungan atau sonto ayat bau, kongsino engkami untuk nirego ko' niposok diom data rasmi.",
    about_cta_btn: '+ Sadang Pekataan Betiu',
  },
  en: {
    nav_glosari: 'Glossary', nav_cadang: 'Suggest', nav_tentang: 'About',
    hero_desc: "Start searching, or suggest a new word to expand this dictionary's vocabulary.",
    search_label: 'SEARCH BAR',
    search_placeholder: 'Search words in Bajau, Malay or English.',
    search_hint: 'Suggestions will appear here as you type.',
    btn_clear: 'Clear', btn_search: 'Search', trending_label: 'Trending:',
    nav_search_placeholder: 'Search words.',
    entry_affixes: 'Word Derivations', entry_dialects: 'Regional Variants',
    entry_definition: 'Definition', entry_examples: 'Usage Examples',
    entry_source: '<strong>Source:</strong> Oral Informant (Kota Belud) \u2022 Verified by Native Speaker',
    entry_suggest_btn: '+ Suggest Information',
    about_kicker: 'LANGUAGE HERITAGE PRESERVATION INITIATIVE',
    about_title: 'Preserving an Oral Heritage,<br>Empowering <em>Future Generations.</em>',
    about_lead: '<strong>Kamus Bajau Samah</strong> is an open digital lexical resource founded to document, celebrate and expand the Bajau Samah vocabulary so it remains alive and accessible to all communities.',
    about_cta_title: 'Share Your Knowledge',
    about_cta_desc: 'This dictionary grows with your contributions. If you know a word, pronunciation, regional dialect or new example sentence, share it with us to be reviewed and added to the official database.',
    about_cta_btn: '+ Suggest a Word Now',
  }
};

// Hero title per-lang HTML (stored separately due to rich markup)
const HERO_TITLE = {
  ms: 'Bersama <strong>Menerokai</strong><br>dan <strong>Memelihara</strong><br>Jiwa Bangsa <em>Kita.</em>',
  bj: "Somo-somo <strong>Ngeneroka</strong><br>ko' <strong>Meloro</strong><br>Jiwo Bangso <em>Kiti.</em>",
  en: 'Together <strong>Exploring</strong><br>and <strong>Preserving</strong><br>the Soul of Our <em>People.</em>',
};

/**
 * Switch the UI language across all tagged elements.
 */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  applyLanguage(lang);
}

function applyLanguage(lang) {
  const t = TRANSLATIONS[lang];

  // 1. Simple innerHTML nodes tagged with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key === 'hero_title') {
      el.innerHTML = HERO_TITLE[lang] || HERO_TITLE.ms;
      return;
    }
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // 2. Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // 3. Refresh visible hint text
  if (searchHintText && searchHintText.style.display !== 'none') {
    searchHintText.textContent = t['search_hint'];
  }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  setupSearch(homeSearchInput, searchSuggestions);
  applyLanguage('ms'); // apply default on load

  if (navSearchInput) {
    navSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = navSearchInput.value.trim().toLowerCase();
        if (query) {
          executeSearch(query);
        }
      }
    });
  }
});


// Setup Live Autocomplete for Home Search
function setupSearch(inputEl, suggestionsContainer) {
  if (!inputEl || !suggestionsContainer) return;

  inputEl.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();

    if (val.length > 0) {
      btnClearSearch.style.display = 'block';
      const matches = DICTIONARY_DATABASE.filter(item =>
        item.word.toLowerCase().includes(val) ||
        item.definitionMs.toLowerCase().includes(val) ||
        item.definitionEn.toLowerCase().includes(val)
      );

      if (matches.length > 0) {
        searchHintText.style.display = 'none';
        suggestionsContainer.innerHTML = matches.map(item => `
          <div class="inline-suggestion-item" onclick="selectEntry('${item.word}')">
            <span class="suggestion-word">${item.word}</span>
            <div class="suggestion-meta">
              <span class="suggestion-def">${item.definitionMs}</span>
              <span class="suggestion-tag">${item.pos.split('/')[0].trim()}</span>
            </div>
          </div>
        `).join('');
        suggestionsContainer.style.display = 'flex';
      } else {
        searchHintText.style.display = 'none';
        suggestionsContainer.innerHTML = `
          <div class="inline-suggestion-item" onclick="openCadangModal('${val}')" style="background:#fff1f2; border-color:#fecdd3;">
            <span class="suggestion-word" style="font-size:14px;">Tiada padanan untuk "${val}"</span>
            <span class="suggestion-tag" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;">+ Cadangkan perkataan</span>
          </div>
        `;
        suggestionsContainer.style.display = 'flex';
      }
    } else {
      btnClearSearch.style.display = 'none';
      suggestionsContainer.style.display = 'none';
      searchHintText.style.display = 'block';
      searchHintText.textContent = 'Cadangan akan muncul di sini apabila anda menaip sesuatu.';
    }
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitSearch();
    }
  });
}

function clearSearch() {
  if (homeSearchInput) {
    homeSearchInput.value = '';
    homeSearchInput.focus();
    searchSuggestions.style.display = 'none';
    searchHintText.style.display = 'block';
    searchHintText.textContent = 'Cadangan akan muncul di sini apabila anda menaip sesuatu.';
    btnClearSearch.style.display = 'none';
  }
}

function quickSearch(word) {
  if (homeSearchInput) {
    homeSearchInput.value = word;
  }
  executeSearch(word);
}

function submitSearch() {
  const query = homeSearchInput ? homeSearchInput.value.trim().toLowerCase() : '';
  if (query) {
    executeSearch(query);
  } else {
    homeSearchInput?.focus();
  }
}

function executeSearch(query) {
  const match = DICTIONARY_DATABASE.find(item => item.word.toLowerCase() === query.toLowerCase());
  if (match) {
    renderEntry(match);
    showPage('entry');
  } else {
    showToast(`Perkataan "${query}" belum tersenarai. Membuka borang cadangan...`);
    setTimeout(() => {
      openCadangModal(query);
    }, 600);
  }
}

function selectEntry(word) {
  const match = DICTIONARY_DATABASE.find(item => item.word.toLowerCase() === word.toLowerCase());
  if (match) {
    renderEntry(match);
    showPage('entry');
  }
}

// Render dynamic entry contents
function renderEntry(item) {
  currentEntry = item;

  const pageEntry = document.getElementById('page-entry');
  if (!pageEntry) return;

  const posBadge = pageEntry.querySelector('.pos-badge');
  const headwordTitle = pageEntry.querySelector('.headword-title');
  const ipaText = pageEntry.querySelector('.ipa-text');
  const affixList = pageEntry.querySelector('.affix-list');
  const dialectList = pageEntry.querySelector('.dialect-list');
  const defText = pageEntry.querySelector('.def-text');
  const defEn = pageEntry.querySelector('.def-en');
  const exampleQuote = pageEntry.querySelector('.example-quote');
  const exampleTrMs = pageEntry.querySelector('.example-tr-ms');
  const exampleTrEn = pageEntry.querySelector('.example-tr-en');
  const thesaurusItems = pageEntry.querySelector('.thesaurus-items');

  if (posBadge) {
    if (item.rootEntry) {
      posBadge.innerHTML = `
        <span class="pos-tag">${item.pos}</span>
        <a href="#" class="root-badge" onclick="selectEntry('${item.rootEntry.word}'); return false;" title="Kata Dasar: ${item.rootEntry.word}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
          <span>Kata Dasar: <strong>${item.rootEntry.word}</strong> (${item.rootEntry.meaning})</span>
        </a>
      `;
    } else {
      posBadge.innerHTML = `<span class="pos-tag">${item.pos}</span>`;
    }
  }
  if (headwordTitle) headwordTitle.textContent = item.word;
  if (ipaText) ipaText.textContent = item.ipa;
  if (defText) defText.textContent = item.definitionMs;
  if (defEn) defEn.textContent = `(${item.definitionEn})`;

  if (affixList) {
    affixList.innerHTML = item.affixes.map(a => {
      const isAttested = a.isAttested;
      const displayTerm = a.isTheoretical ? `*${a.term}` : a.term;
      if (isAttested) {
        return `
          <li class="affix-item-row attested">
            <div class="affix-left">
              <a href="#" class="affix-link" onclick="selectEntry('${a.link || a.term}'); return false;">
                <strong>${displayTerm}</strong>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <span class="affix-sep">–</span>
              <span class="affix-desc">${a.desc}</span>
            </div>
            <span class="affix-badge attested-tag">Entri Tersah</span>
          </li>
        `;
      } else {
        return `
          <li class="affix-item-row theoretical">
            <div class="affix-left">
              <strong class="affix-term theoretical-term" title="Bentuk terbitan teoretis / produktif">${displayTerm}</strong>
              <span class="affix-sep">–</span>
              <span class="affix-desc">${a.desc}</span>
            </div>
            <span class="affix-badge theoretical-tag" title="Bentuk morfologi produktif (belum didokumentasikan sebagai entri bertulis tersendiri)">* Bentuk Teoretis</span>
          </li>
        `;
      }
    }).join('');
  }

  if (dialectList) {
    dialectList.innerHTML = item.dialects.map(d => `
      <li><span class="locality-name">${d.loc}:</span> <span class="locality-val">${d.val}</span></li>
    `).join('');
  }

  if (item.example) {
    if (exampleQuote) exampleQuote.innerHTML = `“${item.example.bajau.replace(item.example.highlight, `<strong class="highlight-word">${item.example.highlight}</strong>`)}”`;
    if (exampleTrMs) exampleTrMs.textContent = item.example.ms;
    if (exampleTrEn) exampleTrEn.textContent = item.example.en;
  }

  if (thesaurusItems) {
    if (item.thesaurus && item.thesaurus.length > 0) {
      thesaurusItems.innerHTML = item.thesaurus.map(t => `
        <a href="#" class="thesaurus-pill" onclick="quickSearch('${t.word}'); return false;">${t.word} <span class="thesaurus-sub">(${t.sub})</span></a>
      `).join('');
    } else {
      thesaurusItems.innerHTML = `<span style="font-size:13px; color:#94a3b8;">Tiada kata berkaitan didokumentasikan lagi.</span>`;
    }
  }
}

// Page Navigation
function showPage(pageName) {
  currentPage = pageName;
  const pageHome = document.getElementById('page-home');
  const pageEntry = document.getElementById('page-entry');
  const pageAbout = document.getElementById('page-about');

  const btnHome = document.getElementById('btn-view-home');
  const btnEntry = document.getElementById('btn-view-entry');
  const btnAbout = document.getElementById('btn-view-about');
  const leftBorder = document.querySelector('.linangkit-left-border');

  // Hide all pages first
  if (pageHome) pageHome.style.display = 'none';
  if (pageEntry) pageEntry.style.display = 'none';
  if (pageAbout) pageAbout.style.display = 'none';

  // Deactivate all switcher buttons
  btnHome?.classList.remove('active');
  btnEntry?.classList.remove('active');
  btnAbout?.classList.remove('active');

  if (pageName === 'home') {
    pageHome.style.display = 'flex';
    btnHome?.classList.add('active');
    leftBorder?.classList.remove('motif-entry');
  } else if (pageName === 'entry') {
    pageEntry.style.display = 'flex';
    btnEntry?.classList.add('active');
    leftBorder?.classList.add('motif-entry');
  } else if (pageName === 'about') {
    pageAbout.style.display = 'flex';
    btnAbout?.classList.add('active');
    leftBorder?.classList.remove('motif-entry');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Simulation Viewport Toggle
function toggleViewport() {
  const wrapper = document.getElementById('viewport-wrapper');
  const btn = document.getElementById('btn-toggle-viewport');
  const label = document.getElementById('vp-label');

  if (wrapper.classList.contains('mobile-mode')) {
    wrapper.classList.remove('mobile-mode');
    btn.classList.remove('active');
    label.textContent = 'Mod Telefon';
  } else {
    wrapper.classList.add('mobile-mode');
    btn.classList.add('active');
    label.textContent = 'Mod Komputer';
  }
}

// Audio Pronunciation Simulator with Web Audio Oscillator
function playPronunciation(word) {
  const btn = document.getElementById('audio-play-btn');
  btn.classList.add('playing');

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.log('Audio preview:', e);
  }

  showToast(`Memainkan sebutan: /${currentEntry ? currentEntry.ipa : word}/`);

  setTimeout(() => {
    btn.classList.remove('playing');
  }, 700);
}

// Modals
function openCadangModal(prefillWord = '') {
  const modal = document.getElementById('modal-cadang');
  const wordInput = document.getElementById('cadang-word');
  if (wordInput && prefillWord) {
    wordInput.value = prefillWord;
  }
  if (modal) modal.showModal();
}

function openGlosariModal() {
  const modal = document.getElementById('modal-info');
  const title = document.getElementById('info-modal-title');
  const body = document.getElementById('info-modal-body');

  title.textContent = 'Glosari Abjad Bajau Sama';
  body.innerHTML = `
    <p style="margin-bottom:12px; color:#475569;">Pilih huruf untuk melihat senarai kosa kata:</p>
    <div style="display:flex; flex-wrap:wrap; gap:6px;">
      ${['A', 'B', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'NG', 'O', 'P', 'R', 'S', 'T', 'U', 'W', 'Y'].map(letter => `
        <button type="button" class="chip-item" onclick="filterByLetter('${letter}')">${letter}</button>
      `).join('')}
    </div>
  `;
  modal.showModal();
}

function filterByLetter(letter) {
  closeModal('modal-info');
  showToast(`Menapis perkataan bermula huruf [${letter}]`);
  if (letter === 'M') {
    selectEntry('mangan');
  } else if (letter === 'T') {
    selectEntry('tilau');
  } else if (letter === 'B') {
    selectEntry('boe\'');
  }
}

function openTentangModal() {
  const modal = document.getElementById('modal-info');
  const title = document.getElementById('info-modal-title');
  const body = document.getElementById('info-modal-body');

  title.textContent = 'Tentang Kamus Bajau Samah';
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; font-size:14.5px; color:#334155; line-height:1.65;">
      <p>
        <strong>Kamus Bajau Samah</strong> ialah sebuah inisiatif pemeliharaan warisan bahasa dan dokumentasi leksikal digital terbuka untuk bahasa Bajau Samah di Sabah.
      </p>
      <p>
        Projek ini menghubungkan para penutur jati, komuniti keluarga, penyelidik dan generasi masa hadapan merentasi pelbagai daerah termasuk Kota Belud, Tuaran, Papar, Kawang dan kawasan pesisir Sabah.
      </p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:8px; font-size:13px; color:#475569;">
        <strong>Matlamat Utama:</strong>
        <ul style="margin-top:6px; padding-left:18px; display:flex; flex-direction:column; gap:4px;">
          <li>Memudahkan pencarian kosa kata secara tepat dan pantas.</li>
          <li>Mendokumentasikan variasi dialek daerah dan terbitan imbuhan.</li>
          <li>Menyediakan ruang sumbangan terbuka yang disemak secara teliti.</li>
        </ul>
      </div>
    </div>
  `;
  modal.showModal();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.close();
}

function handleCadangSubmit(e) {
  e.preventDefault();
  closeModal('modal-cadang');
  showToast('Cadangan anda berjaya dihantar untuk semakan penutur jati. Terima kasih!');
}

function showToast(message) {
  const toast = document.getElementById('toast-notif');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
