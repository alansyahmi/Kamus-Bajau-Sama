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

  // Footer / Footnote
  footer_brand_desc: string;
  footer_nav_title: string;
  footer_nav_home: string;
  footer_nav_about: string;
  footer_nav_suggest: string;
  footer_nav_alphabet: string;
  footer_dialects_title: string;
  footer_dialects_desc: string;
  footer_heritage_title: string;
  footer_heritage_desc: string;
  footer_copyright: string;
  footer_motif_note: string;

  // Support / Patronage Modal & CTA
  support_nav: string;
  support_modal_title: string;
  support_modal_desc: string;
  support_qr_caption: string;
  support_bank_name: string;
  support_account_name: string;
  support_account_number: string;
  support_copy_btn: string;
  support_copied_toast: string;
  support_download_qr: string;
  support_why_title: string;
  support_why_desc: string;

  // Entry & Lexical Navigation QoL
  entry_root_prefix: string;
  entry_share_btn: string;
  entry_link_copied: string;
  entry_ipa_copied: string;

  // Lexical Pagination
  pagination_prev: string;
  pagination_next: string;
  pagination_alphabet_index: string;
  pagination_start_index: string;
  pagination_end_index: string;

  // Not Found Recovery
  notfound_badge: string;
  notfound_desc: string;
  notfound_suggest_btn: string;
  notfound_did_you_mean: string;
  notfound_home_btn: string;

  // Affixes / Morphology
  affix_forms_count: string;
  affix_view_entry: string;
  affix_theoretical_form: string;
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
    about_lead: '<strong>Kamus Bajau Sama</strong> ialah sebuah sumber leksikal digital terbuka yang diasaskan untuk mendokumentésénkan, meraikan dan memperluaskan kosa kata bahasa Bajau Sama agar kekal hidup dan mudah diakses oleh semua lapisan masyarakat.',
    about_pillar_1_title: 'Akses Terbuka & Digital',
    about_pillar_1_desc: 'Menjadikan perbendaharaan kata Bajau Sama mudah dicari, difahami dan dikongsi merentasi pelbagai peranti dengan pengalaman carian yang pantas dan tepat.',
    about_pillar_2_title: 'Ketulenan & Integriti Data',
    about_pillar_2_desc: 'Setiap perkataan, sebutan dan contoh ayat dipelihara mengikut bentuk pertuturan tulen penutur jati tanpa sebarang rekaan atau pengubahsuaian leksikal sewenang-wenangnya.',
    about_pillar_3_title: 'Variasi Daerah & Dialek',
    about_pillar_3_desc: 'Mendokumentésénkan kepelbagaian dialek Bajau Sama di Sabah — dari Kota Belud, Tuaran, Papar, Kawang hingga ke persisiran pantai timur Sabah.',
    about_methodology_title: 'Metodologi & Sumber Rujukan',
    about_methodology_desc: 'Kandungan dalam kamus ini dikumpulkan melalui gabungan sumber lisan daripada warga emas, penutur jati komuniti, serta rujukan dokumentésén linguistik dan akademik yang diiktiraf.',
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
    stats_words: 'perkataan didokumentésénkan',
    stats_dialects: 'variasi daerah',
    stats_open_data: 'pangkalan data terbuka',

    footer_brand_desc: 'Inisiatif pemeliharaan khazanah kosa kata dan warisan leksikal bahasa Bajau Sama terbuka untuk generasi kini dan masa hadapan.',
    footer_nav_title: 'Pautan Pantas',
    footer_nav_home: 'Laman Utama',
    footer_nav_about: 'Tentang Projek',
    footer_nav_suggest: 'Cadang Perkataan',
    footer_nav_alphabet: 'Indeks Abjad A-Z',
    footer_dialects_title: 'Variasi Dialek & Daerah',
    footer_dialects_desc: 'Mendokumentésénkan kepelbagaian leksikal Pantai Barat (Kota Belud, Tuaran, Papar) dan Pantai Timur Sabah.',
    footer_heritage_title: 'Integriti Linguistik',
    footer_heritage_desc: 'Pangkalan data bersandarkan penutur jati dan sumber lisan tulen tanpa rekaan leksikal tiruan.',
    footer_copyright: 'Kamus Bajau Sama. Hak cipta terpelihara.',
    footer_motif_note: 'Motif Tradisional & Linangkit Sabah',

    support_nav: 'Sokong Kami',
    support_modal_title: 'Sokong Pemeliharaan Bahasa',
    support_modal_desc: 'Bantu kami mengekalkan Kamus Bajau Sama percuma, berdikari dan bebas iklan untuk anak bangsa serta generasi akan datang.',
    support_qr_caption: 'Imbas Kod QR DuitNow melalui mana-mana aplikasi bank atau e-Dompet Malaysia.',
    support_bank_name: 'Maybank / DuitNow',
    support_account_name: 'Alan Syahmi bin Sanih @ Sani',
    support_account_number: '160102434316',
    support_copy_btn: 'Salin Nama',
    support_copied_toast: 'Nama disalin!',
    support_download_qr: 'Muat Turun Kod QR',
    support_why_title: 'Kemana sumbangan anda disalurkan?',
    support_why_desc: 'Setiap sumbangan digunakan secara langsung untuk membiayai kos pelayan (hosting), pangkalan data terbuka, dan pembangunan ciri-ciri baharu kamus tanpa komersial.',

    entry_root_prefix: 'Kata Dasar:',
    entry_share_btn: 'Kongsi',
    entry_link_copied: 'Pautan disalin!',
    entry_ipa_copied: 'Salin!',

    pagination_prev: 'Kata Sebelum',
    pagination_next: 'Kata Seterusnya',
    pagination_alphabet_index: 'Indeks Abjad',
    pagination_start_index: 'Awal indeks abjad',
    pagination_end_index: 'Akhir indeks abjad',

    notfound_badge: 'Perkataan Belum Didokumentasikan',
    notfound_desc: 'Perkataan ini belum terdapat dalam pangkalan data rasmi Kamus Bajau Sama. Anda boleh menjadi penyumbang pertama untuk mendokumentasikannya!',
    notfound_suggest_btn: 'Cadangkan Perkataan Ini',
    notfound_did_you_mean: 'Adakah anda maksudkan perkataan berikut?',
    notfound_home_btn: 'Laman Utama',

    affix_forms_count: 'bentuk',
    affix_view_entry: 'Lihat Entri',
    affix_theoretical_form: 'Bentuk Teoretis',
  },

  bj: {
    nav_glossary: 'Glosari',
    nav_suggest: 'Sadang',
    nav_about: 'Pasal',

    hero_title_html: "Somo-somo <strong>Ngeneroka</strong><br>ko' <strong>Melioro</strong><br>Jiwo Bangso <em>Kiti.</em>",
    hero_desc: 'Mulai memia, atau sadang pekotoon bau untuk ngeluas kosa koto kamus tu.',
    search_label: 'BAR PEMIAAN',
    search_placeholder: 'Pemia pekotoon diom ling Sama, Melayu, atau Inggeris.',
    search_hint: "Pesadangan akan pelua' ta' mitu mun nitaip pekotoon.",
    btn_clear: "Peda",
    btn_search: 'Pemia',
    trending_label: 'Terending:',
    nav_search_placeholder: 'Pemia pekotoon.',

    entry_affixes: 'Turunan Sipitan',
    entry_variants: 'Varian Ortografi',
    entry_dialects: 'Variasi Daerah',
    entry_definition: 'Definisi',
    entry_examples: 'Sonto Pegunoon',
    entry_thesaurus: 'TESAURUS',
    entry_source_prefix: 'Poon:',
    entry_suggest_btn: '+ Sadang Maklumat',
    entry_listen_audio: 'Pakale sebutan',

    about_kicker: 'INISIATIF PEMELIOROON WARISAN LING-TI',
    about_title: "Melioro Warisan Lisan,<br>Memperkasa Pemakai <em>Generasi Baru.</em>",
    about_lead: "<strong>Kamus Bajau Sama</strong> iono po'on leksikal digital binuka' yang niasas untuk mendokumentésén, mera'i ko' mopoluasan kosa kata bahasa Bajau Sama supaya kekal hidup bo' terbuka kepada alam masyarakat.",
    about_pillar_1_title: 'Akses Tebuka & Digital',
    about_pillar_1_desc: "Mokosonong pekotoon Bajau Sama nianang, nipaham ko' nipabagi ta' peranti pantas engko' tepat.",
    about_pillar_2_title: 'Ketulenan & Integriti Data',
    about_pillar_2_desc: "Tiap-tiap pekotoon, sebutan engko' sonto ayat nipeliara' sebentuk tulen penutur jati.",
    about_pillar_3_title: 'Variasi Daerah & Dialek',
    about_pillar_3_desc: "Mendokumentésén kepelbagaian dialek Bajau Sama ta' Sabah — dari Kota Belud, Tuaran, Papar, Kawang sampay pantai timur.",
    about_methodology_title: 'Metodologi & Sumber Rujukan',
    about_methodology_desc: "Isi kamus diti nitipon le' sumber lisan ombok-ombok, penutur jati, engko' rujukan linguistik rasmi.",
    about_cta_title: 'Sumbangin Pengeratian-nu',
    about_cta_desc: "Kamus tu bekembang sebia engko' sumbangan-nu. Mun ngerati-nu pekotoon, sebutan, lugat setungan atau sonto ayat bau, kongsino engkami untuk nirego ko' niposok diom data rasmi.",
    about_cta_btn: '+ Sadang Pekotoon Betiu',

    modal_suggest_title: 'Sadang Entri Bau',
    modal_suggest_desc: 'Bantuno engkami ngoyoon Kamus Bajau Sama. Semomon sadangan komuniti akan nirego sebelum pinosokon diom kamus rasmi.',
    modal_word_label: 'Pekotoon Bajau Sama',
    modal_meaning_label: 'Erti / Definisi (Melayu / Inggeris)',
    modal_example_label: 'Sonto Ayat (Pilihan)',
    modal_locality_label: 'Daerah / Dialek',
    modal_contributor_label: 'Oron Penyumbang (Pilihan)',
    modal_notes_label: 'Nota Tambahan (Pilihan)',
    modal_btn_cancel: 'Batal',
    modal_btn_submit: 'Posok Sadangan',
    modal_success_toast: 'Sukor! Sadangan pekotoon-nu nisambut untuk nirego.',

    featured_word_title: 'Pekotoon Penean',
    random_word_btn: 'Pekotoon Rawak',
    recent_searches_title: 'Pemiaan Bau-bau',
    clear_recent_btn: "Peda",
    browse_by_letter: 'Simak Nuut Urup',
    stats_words: 'pekotoon nidokumentésén',
    stats_dialects: 'variasi daerah',
    stats_open_data: 'pangkalan data tebuka',

    footer_brand_desc: "Inisiatif melioro kazana kosokoto ko' warisan leksikal basa Sama tebuka' untuk generasi betiu ko' masa bunda'.",
    footer_nav_title: 'Pautan Pantas',
    footer_nav_home: 'Laman Poon',
    footer_nav_about: 'Pasal Projek',
    footer_nav_suggest: 'Sadangan Pekotoon',
    footer_nav_alphabet: 'Indék Urup A-Z',
    footer_dialects_title: 'Variasi Lugat & Daerah',
    footer_dialects_desc: 'Mendokumentésén kepelbagaian leksikal Pantai Barat (Kota Belud, Tuaran, Papar) ko Pantai Timur Sabah.',
    footer_heritage_title: 'Integriti Linguistik',
    footer_heritage_desc: 'Pangkalan data bertunjang penutur jati ko poon lisan tulen tanpa rekaan leksikal tiruan.',
    footer_copyright: 'Kamus Bajau Sama. Hak cipta terpelihara.',
    footer_motif_note: 'Motif Tradisional & Linangkit Sabah',

    support_nav: 'Sungkuun Engkami',
    support_modal_title: 'Sungkuun Melioro Basa Sama',
    support_modal_desc: 'Sungkuunno engkami melioro Kamus Bajau Sama supaya kekal peri, lapang lekat iklan engko\' tebuka\' untuk sekemon generasi-ti.',
    support_qr_caption: 'Imbasin Kod QR DuitNow nuut éps béng-nu atau e-Dompet-nu.',
    support_bank_name: 'Maybank / DuitNow',
    support_account_name: 'Alan Syahmi bin Sanih @ Sani',
    support_account_number: '160102434316',
    support_copy_btn: 'Salin Oron',
    support_copied_toast: 'Oron nisalin!',
    support_download_qr: 'Simpan Kod QR',
    support_why_title: 'Pinggo lumaan-ni sumbangan-nu?',
    support_why_desc: 'Bilang-bilang sumbangan-nu koso pinakai terus untuk bayad pelayan (server hosting), pungkaan data tebuka\', peluas fungsi kamus ko\' nerusan kerjo pemelioroon digital tanpa iklanan komesel.',

    entry_root_prefix: 'Koto Dasar:',
    entry_share_btn: "Kunsi'",
    entry_link_copied: 'Pekoson sinalin!',
    entry_ipa_copied: 'Sinalin!',

    pagination_prev: 'Koto Sebelum',
    pagination_next: 'Koto Seterus-ni',
    pagination_alphabet_index: 'Indék Urup',
    pagination_start_index: 'Awal indék urup',
    pagination_end_index: 'Air indék urup',

    notfound_badge: "Pekotoon Nya' Lagi Nidokumentésén",
    notfound_desc: "Pekotoon tu nya' lagi pinesimpon diom pungkaan data rasmi Kamus Bajau Sama. Bulino ngelidas-nu mula-mula nyumbang maksud-ni ko' pegunoon-ni'!",
    notfound_suggest_btn: 'Sadangan Pekotoon Itu',
    notfound_did_you_mean: 'Boi ingin memia-nu pekotoon betuut?',
    notfound_home_btn: 'Laman Pedauan',

    affix_forms_count: 'matukan',
    affix_view_entry: 'Peda Éntri',
    affix_theoretical_form: 'Matukan Téorétikal',
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
    about_lead: '<strong>Kamus Bajau Sama</strong> is an open digital lexical resource founded to document, celebrate and expand the Bajau Sama vocabulary so it remains alive and accessible to all communities.',
    about_pillar_1_title: 'Open & Digital Access',
    about_pillar_1_desc: 'Making the Bajau Sama vocabulary effortlessly searchable, comprehensible, and shareable across all modern devices with fast, accurate discovery.',
    about_pillar_2_title: 'Authenticity & Data Integrity',
    about_pillar_2_desc: 'Every word, pronunciation, and example sentence is preserved in the authentic spoken form of native speakers without artificial modifications.',
    about_pillar_3_title: 'Regional Dialect Variations',
    about_pillar_3_desc: 'Documenting the rich diversity of Bajau Sama dialects across Sabah — from Kota Belud, Tuaran, Papar, Kawang to the east coast communities.',
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

    footer_brand_desc: 'An open language-preservation and lexical documentation initiative for the Bajau Sama language, built for present and future generations.',
    footer_nav_title: 'Quick Links',
    footer_nav_home: 'Home',
    footer_nav_about: 'About Project',
    footer_nav_suggest: 'Suggest a Word',
    footer_nav_alphabet: 'A-Z Alphabet Index',
    footer_dialects_title: 'Dialects & Localities',
    footer_dialects_desc: 'Documenting lexical variations across the West Coast (Kota Belud, Tuaran, Papar) and East Coast Sabah.',
    footer_heritage_title: 'Linguistic Integrity',
    footer_heritage_desc: 'Authoritative entries grounded in native speakers and verified oral sources without synthetic fabrication.',
    footer_copyright: 'Kamus Bajau Sama. All rights reserved.',
    footer_motif_note: 'Traditional Motifs & Sabah Linangkit',

    support_nav: 'Support Us',
    support_modal_title: 'Support Language Preservation',
    support_modal_desc: 'Help us keep Kamus Bajau Sama completely free, independent, and ad-free for future generations.',
    support_qr_caption: 'Scan this DuitNow QR with any Malaysian banking or eWallet app.',
    support_bank_name: 'Maybank / DuitNow',
    support_account_name: 'Alan Syahmi bin Sanih @ Sani',
    support_account_number: '160102434316',
    support_copy_btn: 'Copy Name',
    support_copied_toast: 'Name copied!',
    support_download_qr: 'Download QR Code',
    support_why_title: 'Where do your funds go?',
    support_why_desc: '100% of contributions directly support server hosting, open-access database infrastructure, and continuing digital preservation work without commercial ads.',

    entry_root_prefix: 'Root Word:',
    entry_share_btn: 'Share',
    entry_link_copied: 'Link copied!',
    entry_ipa_copied: 'Copied!',

    pagination_prev: 'Previous Word',
    pagination_next: 'Next Word',
    pagination_alphabet_index: 'Alphabet Index',
    pagination_start_index: 'Start of index',
    pagination_end_index: 'End of index',

    notfound_badge: 'Word Not Yet Documented',
    notfound_desc: 'This word has not yet been documented in the official Kamus Bajau Sama database. You can be the first to contribute its meaning and usage!',
    notfound_suggest_btn: 'Suggest This Word',
    notfound_did_you_mean: 'Did you mean the following words?',
    notfound_home_btn: 'Home',

    affix_forms_count: 'forms',
    affix_view_entry: 'View Entry',
    affix_theoretical_form: 'Theoretical Form',
  },
};

/**
 * Banganan Koto / Kelas Koto (Part of Speech) Linguistic Translations
 * Adhering to authentic West Coast Bajau Samah grammar & terminology.
 */
export const POS_TRANSLATIONS: Record<LanguageCode, Record<string, { full: string; short: string }>> = {
  ms: {
    'KATA KERJA': { full: 'KATA KERJA', short: 'KERJA' },
    'KATA KERJA TRANSITIF': { full: 'KATA KERJA TRANSITIF', short: 'TRANSITIF' },
    'KATA KERJA TAK TRANSITIF': { full: 'KATA KERJA TAK TRANSITIF', short: 'TAK TRANSITIF' },
    'KATA KERJA PASIF': { full: 'KATA KERJA PASIF', short: 'PASIF' },
    'KATA NAMA': { full: 'KATA NAMA', short: 'NAMA' },
    'KATA NAMA AM': { full: 'KATA NAMA AM', short: 'NAMA AM' },
    'KATA NAMA KHAS': { full: 'KATA NAMA KHAS', short: 'NAMA KHAS' },
    'KATA SIFAT': { full: 'KATA SIFAT', short: 'SIFAT' },
    'KATA ADJEKTIF': { full: 'KATA ADJEKTIF', short: 'ADJEKTIF' },
    'ADJEKTIF': { full: 'KATA ADJEKTIF', short: 'ADJEKTIF' },
    'KATA TUGAS / PARTIKEL': { full: 'KATA TUGAS (PARTIKEL)', short: 'TUGAS' },
    'KATA TUGAS (PARTIKEL)': { full: 'KATA TUGAS (PARTIKEL)', short: 'TUGAS' },
    'KATA TUGAS': { full: 'KATA TUGAS', short: 'TUGAS' },
    'KATA BILANGAN': { full: 'KATA BILANGAN', short: 'BILANGAN' },
    'PENJODOH BILANGAN': { full: 'PENJODOH BILANGAN', short: 'PENJODOH' },
    'KATA SENDI NAMA': { full: 'KATA SENDI NAMA', short: 'SENDI' },
    'KATA SENDI': { full: 'KATA SENDI NAMA', short: 'SENDI' },
    'KATA HUBUNG': { full: 'KATA HUBUNG', short: 'HUBUNG' },
    'KATA GANTI NAMA': { full: 'KATA GANTI NAMA', short: 'GANTI NAMA' },
    'KATA GANTI NAMA TUNJUK': { full: 'KATA GANTI NAMA TUNJUK', short: 'TUNJUK' },
    'KATA GANTI NAMA TANYA': { full: 'KATA GANTI NAMA TANYA', short: 'GANTI TANYA' },
    'KATA KETERANGAN': { full: 'KATA KETERANGAN', short: 'KETERANGAN' },
    'KATA SERU': { full: 'KATA SERU', short: 'SERU' },
    'KATA TANYA': { full: 'KATA TANYA', short: 'TANYA' },
    'KATA PERINTAH': { full: 'KATA PERINTAH', short: 'PERINTAH' },
    'KATA BANTU': { full: 'KATA BANTU', short: 'BANTU' },
    'KATA PENEGAS': { full: 'KATA PENEGAS', short: 'PENEGAS' },
    'KATA PENEGAS (PARTIKEL)': { full: 'KATA PENEGAS (PARTIKEL)', short: 'PENEGAS' },
    'KATA PENEGAS / PARTIKEL': { full: 'KATA PENEGAS (PARTIKEL)', short: 'PENEGAS' },
    'KATA NAFI': { full: 'KATA NAFI', short: 'NAFI' },
    'KATA ARAH': { full: 'KATA ARAH', short: 'ARAH' },
    'KATA MAJMUK': { full: 'KATA MAJMUK', short: 'MAJMUK' },
    'KATA GANDA': { full: 'KATA GANDA', short: 'GANDA' },
    'PERIBAHASA': { full: 'PERIBAHASA', short: 'PERIBAHASA' },
    'SIMPULAN BAHASA': { full: 'SIMPULAN BAHASA', short: 'SIMPULAN' },
    'PERIBAHASA / SIMPULAN BAHASA': { full: 'PERIBAHASA (SIMPULAN BAHASA)', short: 'PERIBAHASA' },
    'PERIBAHASA (SIMPULAN BAHASA)': { full: 'PERIBAHASA (SIMPULAN BAHASA)', short: 'PERIBAHASA' },
  },
  bj: {
    'KATA KERJA': { full: 'KOTO KERJO', short: 'KERJO' },
    'KATA KERJA TRANSITIF': { full: 'KOTO KERJO BENGENTAAN', short: 'BENGENTAAN' },
    'KATA KERJA TAK TRANSITIF': { full: 'KOTO KERJO BELAPANGAN', short: 'BELAPANGAN' },
    'KATA KERJA PASIF': { full: 'KOTO KERJO PASIP', short: 'PASIP' },
    'KATA NAMA': { full: 'KOTO ORON', short: 'ORON' },
    'KATA NAMA AM': { full: 'KOTO ORON AM', short: 'ORON AM' },
    'KATA NAMA KHAS': { full: 'KOTO ORON AS', short: 'ORON AS' },
    'KATA SIFAT': { full: 'KOTO SIPAT', short: 'SIPAT' },
    'KATA ADJEKTIF': { full: 'KOTO SIPAT', short: 'SIPAT' },
    'ADJEKTIF': { full: 'KOTO SIPAT', short: 'SIPAT' },
    'KATA TUGAS / PARTIKEL': { full: 'KOTO TUGAS (PATIKEL)', short: 'TUGAS' },
    'KATA TUGAS (PARTIKEL)': { full: 'KOTO TUGAS (PATIKEL)', short: 'TUGAS' },
    'KATA TUGAS': { full: 'KOTO TUGAS', short: 'TUGAS' },
    'KATA BILANGAN': { full: 'KOTO BILANGAN', short: 'BILANGAN' },
    'PENJODOH BILANGAN': { full: 'PENJODO BILANGAN', short: 'PENJODO' },
    'KATA SENDI NAMA': { full: 'KOTO SENDI ORON', short: 'SENDI ORON' },
    'KATA SENDI': { full: 'KOTO SENDI ORON', short: 'SENDI ORON' },
    'KATA HUBUNG': { full: 'KOTO UBUNG', short: 'UBUNG' },
    'KATA GANTI NAMA': { full: 'KOTO GANTI ORON', short: 'GANTI ORON' },
    'KATA GANTI NAMA TUNJUK': { full: 'KOTO GANTI ORON TUNDUK', short: 'GANTI ORON TUNDUK' },
    'KATA GANTI NAMA TANYA': { full: 'KOTO GANTI ORON TILAU', short: 'GANTI TILAU' },
    'KATA KETERANGAN': { full: 'KOTO KETELAKAN', short: 'KETELAKAN' },
    'KATA SERU': { full: 'KOTO PAUAN', short: 'PAUAN' },
    'KATA TANYA': { full: 'KOTO TILAU', short: 'TILAU' },
    'KATA PERINTAH': { full: 'KOTO SOON', short: 'SOON' },
    'KATA BANTU': { full: 'KOTO TABANG', short: 'TABANG' },
    'KATA PENEGAS': { full: 'KOTO PENEGAS', short: 'PENEGAS' },
    'KATA PENEGAS (PARTIKEL)': { full: 'KOTO PENEGAS (PATIKEL)', short: 'PENEGAS' },
    'KATA PENEGAS / PARTIKEL': { full: 'KOTO PENEGAS (PATIKEL)', short: 'PENEGAS' },
    'KATA NAFI': { full: 'KOTO GEGA', short: 'GEGA' },
    'KATA ARAH': { full: 'KOTO BANTING', short: 'BANTING' },
    'KATA MAJMUK': { full: 'KOTO MAJMUK', short: 'MAJMUK' },
    'KATA GANDA': { full: "KOTO GANDA'", short: "GANDA'" },
    'PERIBAHASA': { full: 'PERIBASA', short: 'PERIBASA' },
    'SIMPULAN BAHASA': { full: 'SIMPULAN BASA', short: 'SIMPULAN' },
    'PERIBAHASA / SIMPULAN BAHASA': { full: 'PERIBASA (SIMPULAN BASA)', short: 'PERIBASA' },
    'PERIBAHASA (SIMPULAN BAHASA)': { full: 'PERIBASA (SIMPULAN BASA)', short: 'PERIBASA' },
  },
  en: {
    'KATA KERJA': { full: 'VERB', short: 'VERB' },
    'KATA KERJA TRANSITIF': { full: 'TRANSITIVE VERB', short: 'V.TR' },
    'KATA KERJA TAK TRANSITIF': { full: 'INTRANSITIVE VERB', short: 'V.INTR' },
    'KATA KERJA PASIF': { full: 'PASSIVE VERB', short: 'V.PASS' },
    'KATA NAMA': { full: 'NOUN', short: 'NOUN' },
    'KATA NAMA AM': { full: 'COMMON NOUN', short: 'NOUN' },
    'KATA NAMA KHAS': { full: 'PROPER NOUN', short: 'PROP NOUN' },
    'KATA SIFAT': { full: 'ADJECTIVE', short: 'ADJ' },
    'KATA ADJEKTIF': { full: 'ADJECTIVE', short: 'ADJ' },
    'ADJEKTIF': { full: 'ADJECTIVE', short: 'ADJ' },
    'KATA TUGAS / PARTIKEL': { full: 'PARTICLE', short: 'PARTICLE' },
    'KATA TUGAS (PARTIKEL)': { full: 'PARTICLE', short: 'PARTICLE' },
    'KATA TUGAS': { full: 'PARTICLE', short: 'PARTICLE' },
    'KATA BILANGAN': { full: 'NUMERAL', short: 'NUMERAL' },
    'PENJODOH BILANGAN': { full: 'NUMERAL CLASSIFIER', short: 'CLASSIFIER' },
    'KATA SENDI NAMA': { full: 'PREPOSITION', short: 'PREP' },
    'KATA SENDI': { full: 'PREPOSITION', short: 'PREP' },
    'KATA HUBUNG': { full: 'CONJUNCTION', short: 'CONJ' },
    'KATA GANTI NAMA': { full: 'PRONOUN', short: 'PRONOUN' },
    'KATA GANTI NAMA TUNJUK': { full: 'DEMONSTRATIVE PRONOUN', short: 'DEMONSTRATIVE' },
    'KATA GANTI NAMA TANYA': { full: 'INTERROGATIVE PRONOUN', short: 'INTERROG PRON' },
    'KATA KETERANGAN': { full: 'ADVERB', short: 'ADV' },
    'KATA SERU': { full: 'INTERJECTION', short: 'INTERJ' },
    'KATA TANYA': { full: 'INTERROGATIVE', short: 'INTERROG' },
    'KATA PERINTAH': { full: 'IMPERATIVE', short: 'IMPERATIVE' },
    'KATA BANTU': { full: 'AUXILIARY', short: 'AUX' },
    'KATA PENEGAS': { full: 'EMPHATIC PARTICLE', short: 'EMPHATIC' },
    'KATA PENEGAS (PARTIKEL)': { full: 'EMPHATIC PARTICLE', short: 'EMPHATIC' },
    'KATA PENEGAS / PARTIKEL': { full: 'EMPHATIC PARTICLE', short: 'EMPHATIC' },
    'KATA NAFI': { full: 'NEGATIVE PARTICLE', short: 'NEG' },
    'KATA ARAH': { full: 'DIRECTIONAL WORD', short: 'DIRECTIONAL' },
    'KATA MAJMUK': { full: 'COMPOUND WORD', short: 'COMPOUND' },
    'KATA GANDA': { full: 'REDUPLICATION', short: 'REDUPL' },
    'PERIBAHASA': { full: 'PROVERB', short: 'PROVERB' },
    'SIMPULAN BAHASA': { full: 'IDIOM', short: 'IDIOM' },
    'PERIBAHASA / SIMPULAN BAHASA': { full: 'PROVERB / IDIOM', short: 'IDIOM' },
    'PERIBAHASA (SIMPULAN BAHASA)': { full: 'PROVERB / IDIOM', short: 'IDIOM' },
  },
};

/**
 * Formats POS based on the active language code.
 * Adheres to rule: Kata should just be koto in bj, Kata Bilangan = Koto Bilangan.
 */
export function formatPartOfSpeech(
  pos: string | undefined | null,
  lang: LanguageCode = 'ms',
  isShort = false
): string {
  if (!pos) return '';
  const cleanPos = pos.trim().toUpperCase();
  const langTable = POS_TRANSLATIONS[lang] || POS_TRANSLATIONS.ms;

  // Direct hit in target language table
  if (langTable[cleanPos]) {
    return isShort ? langTable[cleanPos].short : langTable[cleanPos].full;
  }

  // If cleanPos was provided in Bajau (or other language), resolve canonical key
  let canonicalKey = cleanPos;
  for (const [mKey, bVal] of Object.entries(POS_TRANSLATIONS.bj)) {
    if (bVal.full.toUpperCase() === cleanPos || bVal.short.toUpperCase() === cleanPos) {
      canonicalKey = mKey;
      break;
    }
  }

  if (langTable[canonicalKey]) {
    return isShort ? langTable[canonicalKey].short : langTable[canonicalKey].full;
  }

  const firstPart = canonicalKey.split('/')[0].trim();
  if (langTable[firstPart]) {
    return isShort ? langTable[firstPart].short : langTable[firstPart].full;
  }

  if (isShort) {
    return cleanPos.replace(/^(KATA|KOTO)\s+/i, '');
  }

  if (lang === 'bj') {
    return cleanPos.replace(/^KATA\s+/i, 'KOTO ');
  }

  return cleanPos;
}

