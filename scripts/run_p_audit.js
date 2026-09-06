const Database = require("better-sqlite3");
const db = new Database("dictionary.db");

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

console.log(`Total rows: ${rows.length}`);

// We will inspect each one and categorize
const audit = rows.map((r, i) => {
  const flags = [];
  
  // 1. Headword spelling
  // Check if pe- hyphenated
  if (/^pe-[a-z]/.test(r.headword) && r.headword !== "pe-") {
    flags.push("HYPHENATED_PREFIX");
  }
  if (r.headword.includes("-") && !["pe-", "palu-paluan", "peloot-loot", "pepekar-pepekar", "pesuk-pesuk", "pinisak-pisak", "pisak-pisak"].includes(r.headword)) {
    flags.push("SUSPICIOUS_HYPHEN");
  }
  if (r.headword === "peN") {
    flags.push("MORPHEME_LABEL");
  }
  if (r.headword === "pule'") {
    flags.push("SHOULD_BE_PULE_OR_ACCENT");
  }
  if (r.headword === "pute'") {
    flags.push("SHOULD_BE_PUTE_ACCENT");
  }

  // 2. POS
  const validPOS = [
    "KATA KERJA", "KATA NAMA", "KATA SIFAT", "KATA TUGAS / PARTIKEL",
    "KATA BILANGAN", "KATA SENDI NAMA", "KATA HUBUNG", "KATA GANTI NAMA",
    "KATA GANTI NAMA TUNJUK"
  ];
  if (!validPOS.includes(r.part_of_speech)) {
    flags.push("INVALID_POS_LABEL");
  }
  if (r.part_of_speech === "KATA BILANGAN" && !["pitu'", "pu'"].includes(r.headword)) {
    flags.push("WRONG_KATA_BILANGAN");
  }

  // 3. definition_ms
  const ms = r.definition_ms ? r.definition_ms.trim() : "";
  const en = r.definition_en ? r.definition_en.trim() : "";
  
  // English words detected in MS
  const englishWords = [
    "fence", "frog", "currency", "chopper", "swatter", "domesticated", "animals", 
    "container", "handle", "rainy", "season", "dry", "season", "beaters", "percussion",
    "unfurl", "repeatedly", "return", "fishing", "rod", "thinner", "underneath",
    "set", "idea", "opinion", "chosen", "smashed", "forty", "turn", "leave",
    "release", "flight", "become", "stand", "make", "able", "bring", "across",
    "send", "crushed", "censer", "decontrolled", "how"
  ];
  
  const wordsInMs = ms.toLowerCase().split(/[^a-z]+/);
  const matchedEng = wordsInMs.filter(w => englishWords.includes(w));
  if (matchedEng.length > 0) {
    flags.push(`ENGLISH_IN_MS(${matchedEng.join(",")})`);
  }
  
  // Literal bad translation from "(s.one)" or "(the hand)"
  if (ms.includes("satu") && !["satu", "seperti", "kesatuan"].includes(ms)) {
    flags.push("LITERAL_SATU_TRANSLATION");
  }
  if (ms.includes("dengan, tangan") || ms.includes("buat, satu")) {
    flags.push("MACHINE_TRANSLATION_ARTIFACT");
  }
  if (ms.toLowerCase() === en.toLowerCase()) {
    flags.push("MS_EQUALS_EN");
  }

  return {
    index: i + 1,
    entry_id: r.entry_id,
    sense_id: r.sense_id,
    headword: r.headword,
    pos: r.part_of_speech,
    ipa: r.ipa,
    ms: r.definition_ms,
    en: r.definition_en,
    flags
  };
});

const flagged = audit.filter(a => a.flags.length > 0);
console.log(`Flagged ${flagged.length} of ${audit.length} entries.`);

// Let's write the audit result
require("fs").writeFileSync("scripts/audit_flags.json", JSON.stringify(flagged, null, 2), "utf8");
console.log("Wrote scripts/audit_flags.json");
