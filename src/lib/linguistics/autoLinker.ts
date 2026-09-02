export function normalizeQuery(query: string): string {
  let q = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`\s\-_]/g, '');

  if (q.endsWith('ay')) {
    q = q.slice(0, -2) + 'ai';
  } else if (q.endsWith('aw')) {
    q = q.slice(0, -2) + 'au';
  }
  return q;
}

export interface DetectedWordToken {
  raw: string;
  cleaned: string;
  isWord: boolean;
  matchingHeadword?: string;
  isCurrentHeadword?: boolean;
}

/**
 * Tokenizes a sentence into words and punctuation while preserving whitespace
 * and glottal apostrophes within words.
 */
export function tokenizeSentence(sentence: string): string[] {
  if (!sentence) return [];
  // Split on whitespace or punctuation, keeping separators
  return sentence.split(/(\s+|[.,!?;:()"—–[\]{}]+)/);
}

/**
 * Cleans a token for dictionary matching:
 * - strips surrounding punctuation
 * - converts to lowercase
 * - preserves legitimate Bajau Samah internal/terminal glottals (' / ’ / `)
 */
export function cleanBajauWord(rawToken: string): string {
  if (!rawToken) return '';
  return rawToken
    .trim()
    .toLowerCase()
    .replace(/^[.,!?;:()"—–[\]{}]+/g, '')
    .replace(/[.,!?;:()"—–[\]{}]+$/g, '');
}

/**
 * Scans a sentence against a list or Set of existing dictionary headwords
 * and returns detailed token metadata for auto-linking and interactive chip displays.
 */
export function detectWordsInSentence(
  sentence: string,
  knownHeadwordsSet: Set<string>,
  currentHeadword?: string
): DetectedWordToken[] {
  const tokens = tokenizeSentence(sentence);
  const currentNormalized = currentHeadword ? normalizeQuery(currentHeadword) : '';

  return tokens.map((raw) => {
    // If whitespace or punctuation only
    if (/^\s+$/.test(raw) || /^[.,!?;:()"—–[\]{}]+$/.test(raw)) {
      return {
        raw,
        cleaned: '',
        isWord: false,
      };
    }

    const cleaned = cleanBajauWord(raw);
    if (!cleaned) {
      return {
        raw,
        cleaned: '',
        isWord: false,
      };
    }

    const normalized = normalizeQuery(cleaned);
    const isCurrent = Boolean(currentNormalized && normalized === currentNormalized);

    let matchingHeadword: string | undefined = undefined;
    if (knownHeadwordsSet.has(cleaned)) {
      matchingHeadword = cleaned;
    } else if (knownHeadwordsSet.has(normalized)) {
      matchingHeadword = normalized;
    }

    return {
      raw,
      cleaned,
      isWord: true,
      matchingHeadword,
      isCurrentHeadword: isCurrent,
    };
  });
}
