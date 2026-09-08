export interface ReferenceItem {
  id: string; // anchor slug, e.g. "miller-2007"
  shortCite: string; // e.g. "Miller (2007)"
  fullLsaCitation: string;
  author: string;
  year: number;
  title: string;
  publicationType: 'dissertation' | 'book' | 'article' | 'fieldwork' | 'community';
  publisherOrInstitution?: string;
  descriptionMs: string;
  descriptionEn: string;
  locality?: string;
  topics?: string[];
  externalUrl?: string;
}

export const CORPUS_REFERENCES: ReferenceItem[] = [
  {
    id: 'miller-2007',
    shortCite: 'Miller (2007)',
    fullLsaCitation: 'Miller, Mark T. 2007. A grammar of West Coast Bajau. Arlington: University of Texas at Arlington dissertation.',
    author: 'Mark T. Miller',
    year: 2007,
    title: 'A Grammar of West Coast Bajau',
    publicationType: 'dissertation',
    publisherOrInstitution: 'Department of Linguistics, University of Texas at Arlington',
    descriptionMs: 'Kajian tatabahasa dan leksikal deskriptif paling komprehensif bagi dialek Bajau Sama Pantai Barat Sabah (khususnya Kota Belud). Mengandungi dokumentasi fonologi, sebutan IPA, paradigma morfologi (imbuhan kata kerja, terbitan arah eN-, penjodoh bilangan), sintaksis, serta korpus cerita rakyat dan naratif tradisi.',
    descriptionEn: 'The most comprehensive descriptive grammar and lexical documentation of West Coast Bajau in Sabah (primarily Kota Belud). Covers phonology, IPA phonetics, morphological paradigms (verb affixes, directive eN- locatives, classifiers), syntax, and transcribed folklore texts.',
    locality: 'Kota Belud, Sabah',
    topics: ['Morfologi', 'Fonologi', 'Penjodoh Bilangan', 'Sintaksis', 'Cerita Rakyat'],
    externalUrl: 'https://rc.library.uta.edu/uta-ir/handle/10106/748'
  },
  {
    id: 'banker-1984',
    shortCite: 'Banker & Banker (1984)',
    fullLsaCitation: 'Banker, John & Elizabeth Banker. 1984. The Bajau Semah. In Julie K. King & John Wayne King (eds.), Languages of Sabah: A survey report, 213–224. Pacific Linguistics C-78. Canberra: Australian National University.',
    author: 'John Banker & Elizabeth Banker',
    year: 1984,
    title: 'The Bajau Semah',
    publicationType: 'article',
    publisherOrInstitution: 'Pacific Linguistics C-78, Australian National University',
    descriptionMs: 'Tinjauan sosiolinguistik dan dialektologi mengenai taburan penutur bahasa Bajau Sama di pelbagai daerah di Sabah, merangkumi perbezaan dialek Pantai Barat dan Pantai Timur.',
    descriptionEn: 'Sociolinguistic and dialectological survey on the distribution of Bajau Sama speakers across Sabah, noting West Coast and East Coast dialect boundaries.',
    locality: 'Sabah (Kota Belud, Papar, Tuaran, Kudat, Semporna)',
    topics: ['Dialektologi', 'Sosiolinguistik', 'Taburan Geografi']
  },
  {
    id: 'webonary-psb',
    shortCite: 'SIL / PSB (2020)',
    fullLsaCitation: 'SIL International. 2020. Proto-Sama-Bajaw comparative lexicon. Webonary: Dictionaries and Grammars of the World.',
    author: 'SIL International',
    year: 2020,
    title: 'Proto-Sama-Bajaw Comparative Lexicon',
    publicationType: 'book',
    publisherOrInstitution: 'SIL International',
    descriptionMs: 'Pangkalan data perbandingan leksikon Proto-Sama-Bajaw (PSB) yang meneliti rekonstruksi bentuk purba, etimologi akar kata, dan variasi fonologi merentas seluruh keluarga bahasa Sama-Bajaw.',
    descriptionEn: 'Comparative lexical database for Proto-Sama-Bajaw (PSB) reconstructing proto-forms, root etymologies, and phonological shifts across Sama-Bajaw languages.',
    locality: 'Rantau Austronesia / Sabah & Filipina',
    topics: ['Etimologi', 'Linguistik Sejarah', 'Proto-Sama-Bajaw'],
    externalUrl: 'https://www.webonary.org/proto-sama-bajaw/'
  },
  {
    id: 'sneddon-1996',
    shortCite: 'Sneddon (1996)',
    fullLsaCitation: 'Sneddon, James N. 1996. Indonesian: A comprehensive grammar. London: Routledge.',
    author: 'James N. Sneddon',
    year: 1996,
    title: 'Indonesian: A Comprehensive Grammar',
    publicationType: 'book',
    publisherOrInstitution: 'Routledge',
    descriptionMs: 'Rujukan tatabahasa tipologi bagi perbandingan sistem penjodoh bilangan (*classifiers*) dan kata sukatan (*measure nouns / partitives*) dalam rumpun bahasa Austronesia dan rantau Kepulauan Melayu.',
    descriptionEn: 'Typological grammar reference for comparative analysis of Austronesian numeral classifiers and measure nouns/partitives.',
    topics: ['Tipologi Bahasa', 'Penjodoh Bilangan', 'Kata Sukatan']
  },
  {
    id: 'sumber-lisan',
    shortCite: 'Informan Lisan / Penutur Jati',
    fullLsaCitation: 'Kamus Bajau Sama. 2024–2026. Korpus lisan penutur jati & rakaman komuniti. Kota Belud & Tuaran.',
    author: 'Penutur Jati & Tetua Komuniti',
    year: 2024,
    title: 'Korpus Lisan Penutur Jati & Rakaman Komuniti',
    publicationType: 'fieldwork',
    descriptionMs: 'Rakaman lisan, pengesahan sebutan dialek tempatan, dan istilah budaya tradisional bersama penutur jati tempatan dari Kota Belud, Tuaran, Papar, dan kawasan sekitarnya.',
    descriptionEn: 'Oral recordings, local dialect verifications, and traditional cultural terminology recorded directly from native speakers and community elders in Kota Belud, Tuaran, and Papar.',
    locality: 'Kota Belud, Tuaran, Papar, Sabah',
    topics: ['Sebutan Asli', 'Kosa Kata Budaya', 'Variasi Dialek']
  },
  {
    id: 'sumbangan-komuniti',
    shortCite: 'Sumbangan Komuniti',
    fullLsaCitation: 'Kamus Bajau Sama. 2025–2026. Pangkalan data sumbangan & cadangan kata komuniti terbuka.',
    author: 'Komuniti Bajau Sama Terbuka',
    year: 2025,
    title: 'Pangkalan Data Sumbangan & Cadangan Kata Komuniti Terbuka',
    publicationType: 'community',
    descriptionMs: 'Kosa kata, contoh ayat, dan dialek tempatan yang dicadangkan oleh pengguna dan penutur komuniti melalui borang penyertaan awam, yang telah disaring dan disahkan oleh moderator bahasa.',
    descriptionEn: 'Vocabulary, example sentences, and dialect words suggested by community contributors via the public submission form, vetted and verified by language moderators.',
    locality: 'Seluruh Sabah & Penutur Diaspora',
    topics: ['Penyertaan Awam', 'Kosa Kata Terkini', 'Dokumentasi Terbuka']
  }
];

export function findReferenceByText(text: string): ReferenceItem | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('miller')) return CORPUS_REFERENCES.find(r => r.id === 'miller-2007') || null;
  if (lower.includes('banker')) return CORPUS_REFERENCES.find(r => r.id === 'banker-1984') || null;
  if (lower.includes('webonary') || lower.includes('proto-sama-bajaw') || lower.includes('psb')) {
    return CORPUS_REFERENCES.find(r => r.id === 'webonary-psb') || null;
  }
  if (lower.includes('sneddon')) return CORPUS_REFERENCES.find(r => r.id === 'sneddon-1996') || null;
  if (lower.includes('lisan') || lower.includes('penutur jati')) {
    return CORPUS_REFERENCES.find(r => r.id === 'sumber-lisan') || null;
  }
  if (lower.includes('sumbangan') || lower.includes('komuniti') || lower.includes('contributor')) {
    return CORPUS_REFERENCES.find(r => r.id === 'sumbangan-komuniti') || null;
  }
  return null;
}
