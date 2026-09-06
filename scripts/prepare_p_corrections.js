const Database = require("better-sqlite3");
const fs = require("fs");
const db = new Database("dictionary.db");

// Load all P entries with their current senses
const rows = db.prepare(`
  SELECT 
    e.id as entry_id,
    e.headword,
    e.search_normalized,
    e.part_of_speech,
    e.ipa,
    s.id as sense_id,
    s.order_index,
    s.definition_ms,
    s.definition_en
  FROM entries e
  JOIN senses s ON e.id = s.entry_id
  WHERE LOWER(SUBSTR(e.headword, 1, 1)) = 'p'
  ORDER BY LOWER(e.headword) ASC, e.id ASC, s.order_index ASC
`).all();

// Define comprehensive corrections for all P entries needing changes
// We preserve entries that are already clean and well-formed.
const corrections = {
  // 1. pagar
  19384: {
    headword: "pagar",
    pos: "KATA NAMA",
    ipa: "/pagar/",
    senses: [
      { id: 19384, definition_ms: "pagar", definition_en: "fence" }
    ]
  },
  // 2. pak
  19386: {
    headword: "pak",
    pos: "KATA NAMA",
    ipa: "/pak/",
    senses: [
      { id: 19386, definition_ms: "katak", definition_en: "frog" }
    ]
  },
  // 3. paksa'
  19389: {
    headword: "paksa'",
    pos: "KATA KERJA",
    ipa: "/paksaʔ/",
    senses: [
      { id: 19389, definition_ms: "paksa", definition_en: "to force" }
    ]
  },
  // 4. palu-paluan
  19394: {
    headword: "palu-paluan",
    pos: "KATA NAMA", // was KATA KERJA
    ipa: "/palu-paluan/",
    senses: [
      { id: 19394, definition_ms: "sasaran pukulan", definition_en: "object of repeated hitting" }
    ]
  },
  // 5. pan
  19395: {
    headword: "pan",
    pos: "KATA TUGAS / PARTIKEL", // was KATA NAMA
    ipa: "/pan/",
    senses: [
      { id: 19395, definition_ms: "pun, juga (penanda penegas)", definition_en: "topic particle: also, too, (emphatic marker)" }
    ]
  },
  // 6. panutan
  19403: {
    headword: "panutan",
    pos: "KATA KERJA",
    ipa: "/panutan/", // was /panut-an/
    senses: [
      { id: 19403, definition_ms: "menghanyutkan", definition_en: "to set something adrift" }
    ]
  },
  // 7. pe-gontor -> pegontor
  19411: {
    headword: "pegontor",
    pos: "KATA KERJA",
    ipa: "/pəgontor/",
    senses: [
      { id: 19411, definition_ms: "menggoncangkan, menggoyangkan", definition_en: "to shake something, cause to shake" }
    ]
  },
  // 8. pe-iram -> peiram
  19412: {
    headword: "peiram",
    pos: "KATA KERJA",
    ipa: "/pəiram/",
    senses: [
      { id: 19412, definition_ms: "menghitamkan, menjadi hitam", definition_en: "to become black, to darken" }
    ]
  },
  // 9. pe-ke-raat -> pekeraat
  19413: {
    headword: "pekeraat",
    pos: "KATA KERJA",
    ipa: "/pəkəraːt/",
    senses: [
      { id: 19413, definition_ms: "merosakkan, memburukkan", definition_en: "to damage, ruin" }
    ]
  },
  // 10. pe-ke-tau -> peketau
  19414: {
    headword: "peketau",
    pos: "KATA KERJA",
    ipa: "/pəkətaw/",
    senses: [
      { id: 19414, definition_ms: "menakutkan", definition_en: "to scare, frighten" }
    ]
  },
  // 11. pe-kepa' -> pekepa'
  19415: {
    headword: "pekepa'",
    pos: "KATA KERJA",
    ipa: "/pəkəpaʔ/",
    senses: [
      { id: 19415, definition_ms: "menyinggahkan, meletakkan agar hinggap", definition_en: "to cause to alight, to let perch" }
    ]
  },
  // 12. pe-keta -> peketa
  19416: {
    headword: "peketa",
    pos: "KATA KERJA",
    ipa: "/pəkəta/",
    senses: [
      { id: 19416, definition_ms: "menyeberang, melintas, menyeberangkan", definition_en: "to cross over, to cause to cross" }
    ]
  },
  // 13. pe-kiling -> pekiling
  19417: {
    headword: "pekiling",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəkiliŋ/",
    senses: [
      { id: 19417, definition_ms: "menelentangkan, membaringkan", definition_en: "to lay someone on their back, to make lie down" }
    ]
  },
  // 14. pe-kito-on -> pekitoon
  19418: {
    headword: "pekitoon",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəkitoːn/",
    senses: [
      { id: 19418, definition_ms: "menunjukkan, memperlihatkan", definition_en: "to show something to someone" }
    ]
  },
  // 15. pe-lantung -> pelantung
  19420: {
    headword: "pelantung",
    pos: "KATA KERJA",
    ipa: "/pəlantuŋ/",
    senses: [
      { id: 19420, definition_ms: "mengapungkan, menimbul", definition_en: "to float, to cause to float" }
    ]
  },
  // 16. pe-lekat -> pelekat
  19421: {
    headword: "pelekat",
    pos: "KATA KERJA",
    ipa: "/pələkat/",
    senses: [
      { id: 19421, definition_ms: "meninggalkan, melepaskan", definition_en: "to leave behind, to release" }
    ]
  },
  // 17. pe-liak -> peliak
  19422: {
    headword: "peliak",
    pos: "KATA KERJA",
    ipa: "/pəliak/",
    senses: [
      { id: 19422, definition_ms: "menelentangkan, menelangkupkan", definition_en: "to lay something on its back, to upturn" }
    ]
  },
  // 18. pe-liang -> peliang
  19423: {
    headword: "peliang",
    pos: "KATA KERJA",
    ipa: "/pəliaŋ/",
    senses: [
      { id: 19423, definition_ms: "menerbangkan, melepaskan terbang", definition_en: "to release into flight, to cause to fly" }
    ]
  },
  // 19. pe-limbo -> pelimbo
  19424: {
    headword: "pelimbo",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəlimbo/",
    senses: [
      { id: 19424, definition_ms: "melemaskan (ke dalam air)", definition_en: "to suffocate, to drown someone" }
    ]
  },
  // 20. pe-lulai -> pelulai
  19426: {
    headword: "pelulai",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəlulaj/",
    senses: [
      { id: 19426, definition_ms: "melarikan, menyuruh berlari", definition_en: "to make someone run" }
    ]
  },
  // 21. pe-lumpat -> pelumpat
  19427: {
    headword: "pelumpat",
    pos: "KATA KERJA",
    ipa: "/pəlumpat/",
    senses: [
      { id: 19427, definition_ms: "melompatkan, menyuruh melompat", definition_en: "to cause to jump, to jump" }
    ]
  },
  // 22. pe-lunsur -> pelunsur
  19428: {
    headword: "pelunsur",
    pos: "KATA KERJA",
    ipa: "/pəlunsur/",
    senses: [
      { id: 19428, definition_ms: "mengalirkan, mengeluncurkan", definition_en: "to cause to flow, to slide down" }
    ]
  },
  // 23. pe-oyo -> peoyo
  19429: {
    headword: "peoyo",
    pos: "KATA KERJA",
    ipa: "/pəojo/",
    senses: [
      { id: 19429, definition_ms: "menjadi besar, membesar", definition_en: "to become large, to grow big" }
    ]
  },
  // 24. pe-pantau -> pepantau
  19430: {
    headword: "pepantau",
    pos: "KATA KERJA",
    ipa: "/pəpantaw/",
    senses: [
      { id: 19430, definition_ms: "mendirikan, menegakkan", definition_en: "to stand something up, to erect" }
    ]
  },
  // 25. pe-patai -> pepatai
  19431: {
    headword: "pepatai",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəpataj/",
    senses: [
      { id: 19431, definition_ms: "membunuh", definition_en: "to kill someone" }
    ]
  },
  // 26. pe-pe-dia' -> pepedia'
  19432: {
    headword: "pepedia'",
    pos: "KATA KERJA",
    ipa: "/pəpədiaʔ/",
    senses: [
      { id: 19432, definition_ms: "merendahkan, menurunkan perlahan-lahan", definition_en: "to lower something gradually" }
    ]
  },
  // 27. pe-sading -> pesading
  19433: {
    headword: "pesading",
    pos: "KATA KERJA",
    ipa: "/pəsadiŋ/",
    senses: [
      { id: 19433, definition_ms: "menyandarkan, mencondongkan", definition_en: "to lean something, to lean against" }
    ]
  },
  // 28. pe-sedi -> pesedi
  19434: {
    headword: "pesedi",
    pos: "KATA KERJA",
    ipa: "/pəsədi/",
    senses: [
      { id: 19434, definition_ms: "mengalihkan ke tepi, merapatkan ke sisi", definition_en: "to move something aside, to bring beside" }
    ]
  },
  // 29. pe-sikot -> pesikot
  19435: {
    headword: "pesikot",
    pos: "KATA KERJA",
    ipa: "/pəsikot/",
    senses: [
      { id: 19435, definition_ms: "mendekati, menghampiri, merapatkan", definition_en: "to come near, to approach" }
    ]
  },
  // 30. pe-singga -> pesingga
  19436: {
    headword: "pesingga",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəsiŋga/",
    senses: [
      { id: 19436, definition_ms: "menyinggahkan, memberhentikan", definition_en: "to stop by, to cause to stop" }
    ]
  },
  // 31. pe-sorong -> pesorong
  19437: {
    headword: "pesorong",
    pos: "KATA KERJA",
    ipa: "/pəsoroŋ/",
    senses: [
      { id: 19437, definition_ms: "menghampiri, mendekati, menolak ke hadapan", definition_en: "to approach, to push forward" }
    ]
  },
  // 32. pe-suk -> pesuk
  19438: {
    headword: "pesuk",
    pos: "KATA KERJA",
    ipa: "/pəsuk/",
    senses: [
      { id: 19438, definition_ms: "menjadi kurus, menguruskan", definition_en: "to become thin, to lose weight" }
    ]
  },
  // 33. pe-tangis -> petangis
  19439: {
    headword: "petangis",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pətaŋis/",
    senses: [
      { id: 19439, definition_ms: "menangiskan, membuat seseorang menangis", definition_en: "to make someone cry" }
    ]
  },
  // 34. pe-telak -> petelak
  19440: {
    headword: "petelak",
    pos: "KATA KERJA",
    ipa: "/pətəlak/",
    senses: [
      { id: 19440, definition_ms: "menjadi terang, menjadi jelas", definition_en: "to become clear, to brighten" }
    ]
  },
  // 35. pe-tio -> petio
  19441: {
    headword: "petio",
    pos: "KATA KERJA",
    ipa: "/pətio/",
    senses: [
      { id: 19441, definition_ms: "menjadi jauh, menjauhkan", definition_en: "to become far, to move away" }
    ]
  },
  // 36. pe-tondok -> petondok
  19443: {
    headword: "petondok",
    pos: "KATA KERJA",
    ipa: "/pətondok/",
    senses: [
      { id: 19443, definition_ms: "menundukkan, membongkokkan", definition_en: "to stoop, to bend down" }
    ]
  },
  // 37. pe-turi -> peturi
  19444: {
    headword: "peturi",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəturi/",
    senses: [
      { id: 19444, definition_ms: "menidurkan, merebahkan tidur", definition_en: "to put someone to sleep, to lay down to sleep" }
    ]
  },
  // 38. pe-tuun -> petuun
  19445: {
    headword: "petuun",
    pos: "KATA KERJA",
    ipa: "/pətuːn/",
    senses: [
      { id: 19445, definition_ms: "menyelam, menurunkan ke dalam air", definition_en: "to dive, to submerge" }
    ]
  },
  // 39. peberen
  19447: {
    headword: "peberen",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəbərən/",
    senses: [
      { id: 19447, definition_ms: "membenarkan, membiarkan", definition_en: "to allow, to let" }
    ]
  },
  // 40. peboroon
  19448: {
    headword: "peboroon",
    pos: "KATA NAMA",
    ipa: "/pəboroːn/",
    senses: [
      { id: 19448, definition_ms: "tempat membakar kemenyan, perasapan", definition_en: "censer, incense burner" }
    ]
  },
  // 41. pedarag
  19449: {
    headword: "pedarag",
    pos: "KATA KERJA",
    ipa: "/pədarag/",
    senses: [
      { id: 19449, definition_ms: "menjadi merah, memerah", definition_en: "to become red" }
    ]
  },
  // 42. pediki'
  19452: {
    headword: "pediki'",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pədikiʔ/",
    senses: [
      { id: 19452, definition_ms: "mengecilkan, menjadi kecil", definition_en: "to become small, to shrink" }
    ]
  },
  // 43. pejata'
  19454: {
    headword: "pejata'",
    pos: "KATA KERJA",
    ipa: "/pədʒataʔ/",
    senses: [
      { id: 19454, definition_ms: "menaikkan, bergerak ke atas", definition_en: "to go upward, ascend" }
    ]
  },
  // 44. pekeet
  19456: {
    headword: "pekeet",
    pos: "KATA KERJA",
    ipa: "/pəkeːt/",
    senses: [
      { id: 19456, definition_ms: "terbakar, menyala (secara spontan/tidak terkawal)", definition_en: "to catch fire, to burn (involuntarily/spontaneously)" }
    ]
  },
  // 45. pelanga
  19458: {
    headword: "pelanga",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəlaŋa/",
    senses: [
      { id: 19458, definition_ms: "meninggikan, menjadi tinggi", definition_en: "to become high, to elevate" }
    ]
  },
  // 46. pelema'
  19459: {
    headword: "pelema'",
    pos: "KATA KERJA",
    ipa: "/pələmaʔ/",
    senses: [
      { id: 19459, definition_ms: "melembutkan, menjadi lembut", definition_en: "to become soft, to soften" }
    ]
  },
  // 47. peloot-loot
  19460: {
    headword: "peloot-loot",
    pos: "KATA KERJA",
    ipa: "/pəloːt-loːt/",
    senses: [
      { id: 19460, definition_ms: "mencapai-capai (dengan tangan)", definition_en: "to repeatedly reach with the hand" }
    ]
  },
  // 48. pemeli
  19461: {
    headword: "pemeli",
    pos: "KATA NAMA",
    ipa: "/pəməli/",
    senses: [
      { id: 19461, definition_ms: "mata wang, alat bayaran", definition_en: "currency, medium of exchange" }
    ]
  },
  // 49. pemia-an -> pemiaan
  19463: {
    headword: "pemiaan",
    pos: "KATA KERJA", // was KATA BILANGAN
    ipa: "/pəmiaːn/",
    senses: [
      { id: 19463, definition_ms: "mencarikan (sesuatu untuk seseorang)", definition_en: "to search for something for someone" }
    ]
  },
  // 50. peN -> peN-
  19464: {
    headword: "peN-",
    pos: "KATA TUGAS / PARTIKEL", // was KATA NAMA
    ipa: "/pəN-/",
    senses: [
      { id: 19464, definition_ms: "imbuhan pembentuk kata nama (alat, tempat, atau pelaku) yang mengalami asimilasi sengau", definition_en: "nominalising prefix (instrument, location, or actor) with nasal assimilation" }
    ]
  },
  // 51. penangis
  19465: {
    headword: "penangis",
    pos: "KATA SIFAT", // was KATA BILANGAN
    ipa: "/pənaŋis/",
    senses: [
      { id: 19465, definition_ms: "mudah menangis, cengeng, kuat menangis", definition_en: "prone to cry, tearful" }
    ]
  },
  // 52. penangkau
  19466: {
    headword: "penangkau",
    pos: "KATA SIFAT", // was KATA BILANGAN
    ipa: "/pənaŋkaw/",
    senses: [
      { id: 19466, definition_ms: "suka mencuri, panjang tangan, pencuri", definition_en: "prone to steal, thievish; thief" }
    ]
  },
  // 53. penebong
  19468: {
    headword: "penebong",
    pos: "KATA NAMA",
    ipa: "/pənəboŋ/",
    senses: [
      { id: 19468, definition_ms: "parang pemotong, alat penebang, parang pencencang", definition_en: "chopper, cutting blade, cleaver" }
    ]
  },
  // 54. penepak
  19469: {
    headword: "penepak",
    pos: "KATA NAMA",
    ipa: "/pənəpak/",
    senses: [
      { id: 19469, definition_ms: "pemukul (cth: pemukul lalat), penepuk", definition_en: "swatter (e.g. fly swatter), beater" }
    ]
  },
  // 55. peng-enda-an -> pengendaan
  19470: {
    headword: "pengendaan",
    pos: "KATA NAMA",
    ipa: "/pəŋəndaːn/",
    senses: [
      { id: 19470, definition_ms: "tempat melihat, tempat meninjau", definition_en: "place for viewing, observation point" }
    ]
  },
  // 56. pengayam
  19471: {
    headword: "pengayam",
    pos: "KATA NAMA", // was KATA KERJA
    ipa: "/pəŋajam/",
    senses: [
      { id: 19471, definition_ms: "haiwan ternakan, binatang peliharaan", definition_en: "domesticated animals, livestock, pets" }
    ]
  },
  // 57. pengellau
  19472: {
    headword: "pengellau",
    pos: "KATA NAMA", // was KATA SIFAT
    ipa: "/pəŋəlːaw/",
    senses: [
      { id: 19472, definition_ms: "musim kemarau, musim panas", definition_en: "dry season, hot season" }
    ]
  },
  // 58. pengelong
  19473: {
    headword: "pengelong",
    pos: "KATA NAMA",
    ipa: "/pəŋəloŋ/",
    senses: [
      { id: 19473, definition_ms: "tali leher kerbau, abah-abah kerbau", definition_en: "neck harness (for buffalo)" }
    ]
  },
  // 59. pengennaan
  19474: {
    headword: "pengennaan",
    pos: "KATA NAMA",
    ipa: "/pəŋənːaːn/",
    senses: [
      { id: 19474, definition_ms: "bekas, tempat simpanan", definition_en: "container, storage receptacle" }
    ]
  },
  // 60. pengentanan
  19475: {
    headword: "pengentanan",
    pos: "KATA NAMA",
    ipa: "/pəŋəntanan/",
    senses: [
      { id: 19475, definition_ms: "pemegang, hulu, tangkai", definition_en: "handle, holder, grip" }
    ]
  },
  // 61. penguran
  19476: {
    headword: "penguran",
    pos: "KATA NAMA",
    ipa: "/pəŋuran/",
    senses: [
      { id: 19476, definition_ms: "musim hujan, musim tengkujuh", definition_en: "rainy season, monsoon" }
    ]
  },
  // 62. penitik
  19478: {
    headword: "penitik",
    pos: "KATA NAMA", // was KATA KERJA
    ipa: "/pənitik/",
    senses: [
      { id: 19478, definition_ms: "pemukul (alat perkusi seperti kulintangan atau gong)", definition_en: "beater, mallet (for percussion instruments like kulintangan or gong)" }
    ]
  },
  // 63. pepekar
  19480: {
    headword: "pepekar",
    pos: "KATA KERJA",
    ipa: "/pəpəkar/",
    senses: [
      { id: 19480, definition_ms: "membentangkan, membentang", definition_en: "to unfurl, unfold" }
    ]
  },
  // 64. pepekar-pepekar
  19481: {
    headword: "pepekar-pepekar",
    pos: "KATA KERJA",
    ipa: "/pəpəkar-pəpəkar/",
    senses: [
      { id: 19481, definition_ms: "membentang-bentang, berkembang berulang-kali", definition_en: "to unfurl repeatedly" }
    ]
  },
  // 65. pepelua'
  19482: {
    headword: "pepelua'",
    pos: "KATA SIFAT", // was KATA BILANGAN
    ipa: "/pəpəluaʔ/",
    senses: [
      { id: 19482, definition_ms: "gemar keluar, suka keluar", definition_en: "prone to go out, wandering" }
    ]
  },
  // 66. pepule' -> pepulé'
  19483: {
    headword: "pepulé'",
    pos: "KATA KERJA",
    ipa: "/pəpuleʔ/",
    senses: [
      { id: 19483, definition_ms: "memulangkan, mengembalikan", definition_en: "to return something" }
    ]
  },
  // 67. perlu
  19484: {
    headword: "perlu",
    pos: "KATA TUGAS / PARTIKEL", // was KATA NAMA
    ipa: "/pərlu/",
    senses: [
      { id: 19484, definition_ms: "mesti, perlu", definition_en: "must, need" }
    ]
  },
  // 68. pesi
  19486: {
    headword: "pesi",
    pos: "KATA NAMA",
    ipa: "/pəsi/",
    senses: [
      { id: 19486, definition_ms: "joran pancing, pancing", definition_en: "fishing rod" }
    ]
  },
  // 69. pesuk-pesuk
  19488: {
    headword: "pesuk-pesuk",
    pos: "KATA KERJA",
    ipa: "/pəsuk-pəsuk/",
    senses: [
      { id: 19488, definition_ms: "semakin lama semakin kurus, beransur kurus", definition_en: "to continue getting thinner" }
    ]
  },
  // 70. pesuuk
  19489: {
    headword: "pesuuk",
    pos: "KATA KERJA",
    ipa: "/pəsuːk/",
    senses: [
      { id: 19489, definition_ms: "menyusup ke bawah, lalu di bawah", definition_en: "to go underneath, pass under" }
    ]
  },
  // 71. peteketa
  19490: {
    headword: "peteketa",
    pos: "KATA KERJA",
    ipa: "/pətəkəta/",
    senses: [
      { id: 19490, definition_ms: "dapat menyeberangkan (sesuatu)", definition_en: "able to bring something across" }
    ]
  },
  // 72. peteko
  19491: {
    headword: "peteko",
    pos: "KATA KERJA",
    ipa: "/pətəko/",
    senses: [
      { id: 19491, definition_ms: "menghantar, menyampaikan", definition_en: "to send something, deliver" }
    ]
  },
  // 73. petingkoo'
  19492: {
    headword: "petingkoo'",
    pos: "KATA KERJA",
    ipa: "/pətiŋkoːʔ/",
    senses: [
      { id: 19492, definition_ms: "mendudukkan, meletakkan ke bawah", definition_en: "to seat someone, to set something down" }
    ]
  },
  // 74. pian
  19493: {
    headword: "pian",
    pos: "KATA TUGAS / PARTIKEL", // was KATA NAMA
    ipa: "/pian/",
    senses: [
      { id: 19493, definition_ms: "bagaimana", definition_en: "how" }
    ]
  },
  // 75. pikiran
  19495: {
    headword: "pikiran",
    pos: "KATA NAMA",
    ipa: "/pikiran/",
    senses: [
      { id: 19495, definition_ms: "fikiran, pendapat, idea", definition_en: "thought, idea, opinion" }
    ]
  },
  // 76. pinene'
  19497: {
    headword: "pinene'",
    pos: "KATA KERJA", // was KATA NAMA
    ipa: "/pinənəʔ/",
    senses: [
      { id: 19497, definition_ms: "dipilih", definition_en: "to be chosen, selected" }
    ]
  },
  // 77. pinisak-pisak
  19498: {
    headword: "pinisak-pisak",
    pos: "KATA KERJA",
    ipa: "/pinisak-pisak/",
    senses: [
      { id: 19498, definition_ms: "dihancurkan berulang kali, dilenyek-lenyekkan", definition_en: "to be repeatedly crushed or smashed" }
    ]
  },
  // 78. pisak-pisak
  19500: {
    headword: "pisak-pisak",
    pos: "KATA KERJA",
    ipa: "/pisak-pisak/",
    senses: [
      { id: 19500, definition_ms: "hancur berkecai, dilenyek-lenyek", definition_en: "to be crushed repeatedly, trampled" }
    ]
  },
  // 79. pitu'
  19501: {
    headword: "pitu'",
    pos: "KATA BILANGAN",
    ipa: "/pituʔ/",
    senses: [
      { id: 19501, definition_ms: "tujuh", definition_en: "seven" }
    ]
  },
  // 80. pu'
  19504: {
    headword: "pu'",
    pos: "KATA BILANGAN", // was KATA NAMA
    ipa: "/puʔ/",
    senses: [
      { id: 19504, definition_ms: "puluh (cth: empat pu' = empat puluh)", definition_en: "tens, forty (e.g. empat pu')" }
    ]
  },
  // 81. pule' -> pulé'
  19505: {
    headword: "pulé'",
    pos: "KATA KERJA",
    ipa: "/puleʔ/",
    senses: [
      { id: 19505, definition_ms: "pulang, balik (rumah)", definition_en: "to return, go home" }
    ]
  },
  // 82. pungkau
  19506: {
    headword: "pungkau",
    pos: "KATA KERJA", // was KATA NAMA
    ipa: "/puŋkaw/",
    senses: [
      { id: 19506, definition_ms: "bangun, terjaga (dari tidur)", definition_en: "to wake up, awake" }
    ]
  },
  // 83. pusing
  19507: {
    headword: "pusing",
    pos: "KATA KERJA", // was KATA NAMA
    ipa: "/pusiŋ/",
    senses: [
      { id: 19507, definition_ms: "pusing, putar", definition_en: "to turn, rotate" }
    ]
  },
  // 84. pute' -> puté'
  19508: {
    headword: "puté'",
    pos: "KATA SIFAT", // was KATA KERJA
    ipa: "/puteʔ/",
    senses: [
      { id: 19508, definition_ms: "putih", definition_en: "white" }
    ]
  }
};

fs.writeFileSync("scripts/proposed_p_corrections.json", JSON.stringify(corrections, null, 2), "utf8");
console.log(`Prepared ${Object.keys(corrections).length} proposed entry corrections in scripts/proposed_p_corrections.json`);
