export type LanguageCode = 'ms' | 'bj' | 'en';

export interface LexicalEntry {
  id: number;
  headword: string;
  searchNormalized: string;
  partOfSpeech: string;
  ipa?: string | null;
  audioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  senses: LexicalSense[];
  affixes: LexicalAffix[];
  dialects: LexicalDialect[];
  thesaurus: LexicalThesaurus[];
  sources: LexicalSource[];
  rootEntry?: {
    headword: string;
    definitionMs: string;
    definitionEn?: string | null;
    affixPattern?: string;
  } | null;
}

export interface LexicalSense {
  id: number;
  entryId: number;
  orderIndex: number;
  definitionMs: string;
  definitionEn?: string | null;
  examples: LexicalExample[];
}

export interface LexicalExample {
  id: number;
  senseId: number;
  sentenceBajau: string;
  highlightWord?: string | null;
  sentenceMs: string;
  sentenceEn?: string | null;
  audioUrl?: string | null;
}

export interface LexicalAffix {
  id: number;
  entryId: number;
  term: string;
  meaningMs: string;
  meaningEn?: string | null;
  isAttested?: boolean;
  linkedHeadword?: string;
  isTheoretical?: boolean;
  affixPattern?: string;
}

export interface LexicalDialect {
  id: number;
  entryId: number;
  localityName: string;
  dialectForm: string;
}

export interface LexicalThesaurus {
  id: number;
  entryId: number;
  relatedHeadword: string;
  relationNote?: string | null;
}

export interface LexicalSource {
  id: number;
  entryId: number;
  sourceType: string;
  description: string;
  verifiedBy?: string | null;
}

export interface CommunitySubmissionInput {
  headword: string;
  meaning: string;
  exampleSentence?: string;
  locality?: string;
  contributorName?: string;
  contributorEmail?: string;
  notes?: string;
}

export interface SearchResultItem {
  id: number;
  headword: string;
  partOfSpeech: string;
  definitionMs: string;
  definitionEn?: string | null;
  matchType: 'exact' | 'prefix' | 'normalized' | 'variant' | 'affix' | 'meaning' | 'substring';
  matchedVariant?: {
    form: string;
    type: 'spelling' | 'dialect';
    localityName?: string;
  };
}
