// All words that belong to the personal pronoun paradigm (Set I, Set II, Set III and variants)
export const PERSONAL_PRONOUN_SET = new Set([
  // Set I: Enclitics & attached forms
  '-ku', 'ku', '-ti', 'ti', '-nu', 'nu', '-bi', 'bi', '-ni', 'ni',
  // Set II: Independent personal pronouns
  'aku', 'kiti', 'kitei', 'kitai', 'kami', 'kau', 'kaam', 'kam', 'io', 'iyo', 'gai',
  // Set III: Oblique / Prepositional pronouns (em- + Set II)
  'maku', 'engkiti', 'engkami', 'engkau', 'engkaam', 'mio', 'miyo', 'enggai',
]);

export function isPersonalPronounWord(word: string): boolean {
  if (!word) return false;
  return PERSONAL_PRONOUN_SET.has(word.toLowerCase().trim());
}
