import { LanguageCode } from '../types';

export interface UiTranslations {
  // Navigation
  nav_glossary: string;
  nav_suggest: string;
  nav_about: string;

  // Home Hero & Search
  hero_title_html: string;
  hero_desc: string;
  search_label: string;
  search_placeholder: string;
  search_hint: string;
  btn_clear: string;
  btn_search: string;
  trending_label: string;
  nav_search_placeholder: string;

  // Entry Page
  entry_affixes: string;
  entry_variants: string;
  entry_dialects: string;
  entry_definition: string;
  entry_examples: string;
  entry_thesaurus: string;
  entry_source_prefix: string;
  entry_suggest_btn: string;
  entry_listen_audio: string;

  // About Page
  about_kicker: string;
  about_title: string;
  about_lead: string;
  about_pillar_1_title: string;
  about_pillar_1_desc: string;
  about_pillar_2_title: string;
  about_pillar_2_desc: string;
  about_pillar_3_title: string;
  about_pillar_3_desc: string;
  about_methodology_title: string;
  about_methodology_desc: string;
  about_cta_title: string;
  about_cta_desc: string;
  about_cta_btn: string;

  // Suggest Modal
  modal_suggest_title: string;
  modal_suggest_desc: string;
  modal_word_label: string;
  modal_meaning_label: string;
  modal_example_label: string;
  modal_locality_label: string;
  modal_contributor_label: string;
  modal_notes_label: string;
  modal_btn_cancel: string;
  modal_btn_submit: string;
  modal_success_toast: string;

  // New QoL Discovery Features
  featured_word_title: string;
  random_word_btn: string;
  recent_searches_title: string;
  clear_recent_btn: string;
  browse_by_letter: string;
  stats_words: string;
  stats_dialects: string;
  stats_open_data: string;
}

export const TRANSLATIONS: Record<LanguageCode, UiTranslations> = {
  ms: {
    nav_glossary: 'Glosari',
    nav_suggest: 'Cadang',
    nav_about: 'Tentang',

    hero_title_html: 'Bersama <strong>Menerokai</strong><br>dan <strong>Memelihara</strong><br>Jiwa Bangsa <em>Kita.</em>',
    hero_desc: 'Mulakan pencarian, atau cadangkan perkataan baharu untuk meluaskan kosa kata kamus ini.',
    search_label: 'BAR PENCARIAN',
    search_placeholder: 'Cari perkataan dalam bahasa Bajau, Melayu atau Inggeris.',
    search_hint: 'Cadangan akan muncul di sini apabila anda menaip sesuatu.',
    btn_clear: 'Padam',
    btn_search: 'Cari',
    trending_label: 'Trending:',
    nav_search_placeholder: 'Cari perkataan.',

    entry_affixes: 'Terbitan Imbuhan',
    entry_variants: 'Varian Ortografi',
    entry_dialects: 'Variasi Daerah',
    entry_definition: 'Definisi',
    entry_examples: 'Contoh Penggunaan',
    entry_thesaurus: 'TESAURUS',
    entry_source_prefix: 'Sumber:',
    entry_suggest_btn: '+ Cadang Maklumat',
    entry_listen_audio: 'Dengarkan sebutan',

    about_kicker: 'INISIATIF PEMELIHARAAN WARISAN BAHASA',
    about_title: 'Memelihara Warisan Lisan,<br>Memperkasa Penutur <em>Generasi Hadapan.</em>',
    about_lead: '<strong>Kamus Bajau Samah</strong> ialah sebuah sumber leksikal digital terbuka yang diasaskan untuk mendokumentasikan, meraikan dan memperluaskan kosa kata bahasa Bajau Samah agar kekal hidup dan mudah diakses oleh semua lapisan masyarakat.',
    about_pillar_1_title: 'Akses Terbuka & Digital',
    about_pillar_1_desc: 'Menjadikan perbendaharaan kata Bajau Samah mudah dicari, difahami dan dikongsi merentasi pelbagai peranti dengan pengalaman carian yang pantas dan tepat.',
    about_pillar_2_title: 'Ketulenan & Integriti Data',
    about_pillar_2_desc: 'Setiap perkataan, sebutan dan contoh ayat dipelihara mengikut bentuk pertuturan tulen penutur jati tanpa sebarang rekaan atau pengubahsuaian leksikal sewenang-wenangnya.',
    about_pillar_3_title: 'Variasi Daerah & Dialek',
    about_pillar_3_desc: 'Mendokumentasikan kepelbagaian dialek Bajau Samah di Sabah — dari Kota Belud, Tuaran, Papar, Kawang hingga ke persisiran pantai timur Sabah.',
    about_methodology_title: 'Metodologi & Sumber Rujukan',
    about_methodology_desc: 'Kandungan dalam kamus ini dikumpulkan melalui gabungan sumber lisan daripada warga emas, penutur jati komuniti, serta rujukan dokumentasi linguistik dan akademik yang diiktiraf.',
    about_cta_title: 'Sumbangkan Pengetahuan Anda',
    about_cta_desc: 'Kamus ini berkembang seiring dengan sumbangan anda. Jika anda mengetahui perkataan, sebutan, dialek setempat atau contoh ayat baharu, kongsi bersama kami untuk dinilai dan dimasukkan ke dalam pangkalan data rasmi.',
    about_cta_btn: '+ Cadang Perkataan Sekarang',

    modal_suggest_title: 'Cadang Perkataan / Maklumat Baharu',
    modal_suggest_desc: 'Bantu kami memperkayakan Kamus Bajau Sama. Setiap cadangan komuniti akan disemak sebelum dimuatkan ke kamus rasmi.',
    modal_word_label: 'Perkataan Bajau Sama',
    modal_meaning_label: 'Maksud / Definisi (Bahasa Melayu / Inggeris)',
    modal_example_label: 'Contoh Ayat (Pilihan)',
    modal_locality_label: 'Daerah / Dialek',
    modal_contributor_label: 'Nama Pencadang (Pilihan)',
    modal_notes_label: 'Nota Tambahan (Pilihan)',
    modal_btn_cancel: 'Batal',
    modal_btn_submit: 'Hantar Cadangan',
    modal_success_toast: 'Terima kasih! Cadangan perkataan anda telah diterima untuk semakan.',

    featured_word_title: 'Perkataan Pilihan',
    random_word_btn: 'Perkataan Rawak',
    recent_searches_title: 'Carian Terkini',
    clear_recent_btn: 'Padam',
    browse_by_letter: 'Semak Mengikut Huruf',
    stats_words: 'perkataan didokumentasikan',
    stats_dialects: 'variasi daerah',
    stats_open_data: 'pangkalan data terbuka',
  },

  bj: {
    nav_glossary: 'Glosari',
    nav_suggest: 'Sadang',
    nav_about: 'Pasal',

    hero_title_html: "Somo-somo <strong>Ngeneroka</strong><br>ko' <strong>Meloro</strong><br>Jiwo Bangso <em>Kiti.</em>",
    hero_desc: 'Mulai memia, atau sadang pekataan bau untuk ngeluas kosa kata kamus tu.',
    search_label: 'BAR PEMIAAN',
    search_placeholder: 'Pemia pekataan diom ling Sama, Melayu, atau Inggeris.',
    search_hint: "Pesadangan akan pelua' ta' mitu mun nitaip pekataan.",
    btn_clear: "Peda",
    btn_search: 'Pemia',
    trending_label: 'Terending:',
    nav_search_placeholder: 'Pemia pekataan.',

    entry_affixes: 'Turunan Sipitan',
    entry_variants: 'Varian Ortografi',
    entry_dialects: 'Variasi Daerah',
    entry_definition: 'Definisi',
    entry_examples: 'Sonto Pegunoon',
    entry_thesaurus: 'TESAURUS',
    entry_source_prefix: 'Poon:',
    entry_suggest_btn: '+ Sadang Maklumat',
    entry_listen_audio: 'Pakale sebutan',

    about_kicker: 'INISIATIF PEMELOROON WARISAN LING-TI',
    about_title: "Meloro Warisan Lisan,<br>Memperkasa Pemakai <em>Generasi Baru.</em>",
    about_lead: "<strong>Kamus Bajau Samah</strong> iono po'on leksikal digital binuka' yang niasas untuk mendokumentasi, mera'i ko' mopoluasan kosa kata bahasa Bajau Samah supaya kekal hidup bo' terbuka kepada alam masyarakat.",
    about_pillar_1_title: 'Akses Tebuka & Digital',
    about_pillar_1_desc: "Mokosonong pekataan Bajau Samah nianang, nipaham ko' nipabagi ta' peranti pantas engko' tepat.",
    about_pillar_2_title: 'Ketulenan & Integriti Data',
    about_pillar_2_desc: "Tiap-tiap pekataan, sebutan engko' sonto ayat nipeliara' sebentuk tulen penutur jati.",
    about_pillar_3_title: 'Variasi Daerah & Dialek',
    about_pillar_3_desc: "Mendokumentasi kepelbagaian dialek Bajau Samah ta' Sabah — dari Kota Belud, Tuaran, Papar, Kawang sampay pantai timur.",
    about_methodology_title: 'Metodologi & Sumber Rujukan',
    about_methodology_desc: "Isi kamus diti nitipon le' sumber lisan ombok-ombok, penutur jati, engko' rujukan linguistik rasmi.",
    about_cta_title: 'Sumbangin Pengeratian-nu',
    about_cta_desc: "Kamus tu bekembang sebia engko' sumbangan-nu. Mun ngerati-nu pekataan, sebutan, lugat setungan atau sonto ayat bau, kongsino engkami untuk nirego ko' niposok diom data rasmi.",
    about_cta_btn: '+ Sadang Pekataan Betiu',

    modal_suggest_title: 'Sadang Entri Bau',
    modal_suggest_desc: 'Bantuno engkami ngoyoon Kamus Bajau Sama. Semomon sadangan komuniti akan nirego sebelum pinosokon diom kamus rasmi.',
    modal_word_label: 'Pekataan Bajau Sama',
    modal_meaning_label: 'Erti / Definisi (Melayu / Inggeris)',
    modal_example_label: 'Sonto Ayat (Pilihan)',
    modal_locality_label: 'Daerah / Dialek',
    modal_contributor_label: 'Oron Penyumbang (Pilihan)',
    modal_notes_label: 'Nota Tambahan (Pilihan)',
    modal_btn_cancel: 'Batal',
    modal_btn_submit: 'Posok Sadangan',
    modal_success_toast: 'Sukor! Sadangan pekataan-nu nisambut untuk nirego.',

    featured_word_title: 'Pekataan Penean',
    random_word_btn: 'Pekataan Rawak',
    recent_searches_title: 'Pemiaan Bau-bau',
    clear_recent_btn: "Peda",
    browse_by_letter: 'Simak Nuut Urup',
    stats_words: 'pekataan nidokumentasi',
    stats_dialects: 'variasi daerah',
    stats_open_data: 'pangkalan data tebuka',
  },

  en: {
    nav_glossary: 'Glossary',
    nav_suggest: 'Suggest',
    nav_about: 'About',

    hero_title_html: 'Together <strong>Exploring</strong><br>and <strong>Preserving</strong><br>the Soul of Our <em>People.</em>',
    hero_desc: "Start searching, or suggest a new word to expand this dictionary's vocabulary.",
    search_label: 'SEARCH BAR',
    search_placeholder: 'Search words in Bajau, Malay or English.',
    search_hint: 'Suggestions will appear here as you type.',
    btn_clear: 'Clear',
    btn_search: 'Search',
    trending_label: 'Trending:',
    nav_search_placeholder: 'Search words.',

    entry_affixes: 'Word Derivations',
    entry_variants: 'Orthographical Variant(s)',
    entry_dialects: 'Regional Variants',
    entry_definition: 'Definition',
    entry_examples: 'Usage Examples',
    entry_thesaurus: 'THESAURUS',
    entry_source_prefix: 'Source:',
    entry_suggest_btn: '+ Suggest Information',
    entry_listen_audio: 'Listen to pronunciation',

    about_kicker: 'LANGUAGE HERITAGE PRESERVATION INITIATIVE',
    about_title: 'Preserving an Oral Heritage,<br>Empowering <em>Future Generations.</em>',
    about_lead: '<strong>Kamus Bajau Samah</strong> is an open digital lexical resource founded to document, celebrate and expand the Bajau Samah vocabulary so it remains alive and accessible to all communities.',
    about_pillar_1_title: 'Open & Digital Access',
    about_pillar_1_desc: 'Making the Bajau Samah vocabulary effortlessly searchable, comprehensible, and shareable across all modern devices with fast, accurate discovery.',
    about_pillar_2_title: 'Authenticity & Data Integrity',
    about_pillar_2_desc: 'Every word, pronunciation, and example sentence is preserved in the authentic spoken form of native speakers without artificial modifications.',
    about_pillar_3_title: 'Regional Dialect Variations',
    about_pillar_3_desc: 'Documenting the rich diversity of Bajau Samah dialects across Sabah — from Kota Belud, Tuaran, Papar, Kawang to the east coast communities.',
    about_methodology_title: 'Methodology & References',
    about_methodology_desc: 'Dictionary content is collected from elder native speakers, local communities, and recognized linguistic publications and fieldwork.',
    about_cta_title: 'Share Your Knowledge',
    about_cta_desc: 'This dictionary grows with your contributions. If you know a word, pronunciation, regional dialect, or new example sentence, share it with us to be reviewed and included in the official database.',
    about_cta_btn: '+ Suggest a Word Now',

    modal_suggest_title: 'Suggest a New Word / Information',
    modal_suggest_desc: 'Help us enrich Kamus Bajau Sama. Every community submission is carefully reviewed before being published into the authoritative dictionary.',
    modal_word_label: 'Bajau Sama Word',
    modal_meaning_label: 'Meaning / Definition (Malay / English)',
    modal_example_label: 'Example Sentence (Optional)',
    modal_locality_label: 'District / Dialect',
    modal_contributor_label: 'Contributor Name (Optional)',
    modal_notes_label: 'Additional Notes (Optional)',
    modal_btn_cancel: 'Cancel',
    modal_btn_submit: 'Submit Suggestion',
    modal_success_toast: 'Thank you! Your word suggestion has been received for review.',

    featured_word_title: 'Featured Word',
    random_word_btn: 'Random Word',
    recent_searches_title: 'Recent Searches',
    clear_recent_btn: 'Clear',
    browse_by_letter: 'Browse by Letter',
    stats_words: 'words documented',
    stats_dialects: 'regional variants',
    stats_open_data: 'open lexical database',
  },

};
