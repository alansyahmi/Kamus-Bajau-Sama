import sqlite3
import shutil
import time
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

db_path = 'dictionary.db'
backup_path = f'backups/dictionary_pre_ipa_lengthening_{int(time.time())}.db'
shutil.copyfile(db_path, backup_path)
print(f"Safety backup created at: {backup_path}")

def syllabify_single_word(w):
    if not w:
        return ""
    
    # Clean glottal marks
    w = w.replace("'", "ʔ").replace("’", "ʔ").replace("`", "ʔ")
    
    # Tokenize characters into phonemes and C / V tags
    raw_tokens = []
    i = 0
    n = len(w)
    while i < n:
        # Check 2-char consonants
        if w[i:i+2] == 'ng':
            raw_tokens.append(('ŋ', 'C'))
            i += 2
        elif w[i:i+2] == 'ny':
            raw_tokens.append(('ɲ', 'C'))
            i += 2
        elif w[i:i+2] in ['bb', 'dd', 'kk', 'll', 'mm', 'nn', 'pp', 'ss', 'tt']:
            c = w[i]
            raw_tokens.append((c, 'C'))
            raw_tokens.append((c, 'C'))
            i += 2
        # Check double vowels (lengthening)
        elif w[i:i+2] == 'aa':
            raw_tokens.append(('aː', 'V'))
            i += 2
        elif w[i:i+2] in ['ee', 'éé']:
            raw_tokens.append(('eː', 'V'))
            i += 2
        elif w[i:i+2] == 'ii':
            raw_tokens.append(('iː', 'V'))
            i += 2
        elif w[i:i+2] == 'oo':
            raw_tokens.append(('oː', 'V'))
            i += 2
        elif w[i:i+2] == 'uu':
            raw_tokens.append(('uː', 'V'))
            i += 2
        # Single consonants
        elif w[i] == 'j':
            raw_tokens.append(('dʒ', 'C'))
            i += 1
        elif w[i] == 'y':
            raw_tokens.append(('j', 'C'))
            i += 1
        elif w[i] == 'w':
            raw_tokens.append(('w', 'C'))
            i += 1
        elif w[i] == 'ʔ':
            raw_tokens.append(('ʔ', 'C'))
            i += 1
        elif w[i] in 'bdfghklmnprst':
            raw_tokens.append((w[i], 'C'))
            i += 1
        # Single vowels
        elif w[i] == 'é':
            raw_tokens.append(('e', 'V'))
            i += 1
        elif w[i] == 'e':
            # In final syllable, e is always /e/ (schwa never in ultimate syllable, Miller p.78)
            remaining = w[i+1:]
            has_later_vowel = any(ch in 'aiuoeé' for ch in remaining)
            if not has_later_vowel:
                raw_tokens.append(('e', 'V'))
            else:
                raw_tokens.append(('ə', 'V'))
            i += 1
        elif w[i] in 'aiuo':
            raw_tokens.append((w[i], 'V'))
            i += 1
        else:
            raw_tokens.append((w[i], 'C'))
            i += 1

    # Detect diphthongs: -au, -ai, -aw, -ay (at word end or before final ʔ)
    tokens = []
    j = 0
    m = len(raw_tokens)
    while j < m:
        sym, typ = raw_tokens[j]
        if sym == 'a' and j + 1 < m:
            next_sym, _ = raw_tokens[j+1]
            if next_sym in ['u', 'w']:
                if j + 2 == m or (j + 2 < m and raw_tokens[j+2][0] == 'ʔ' and j + 3 == m):
                    tokens.append(('aw', 'V'))
                    j += 2
                    continue
            elif next_sym in ['i', 'j']:
                if j + 2 == m or (j + 2 < m and raw_tokens[j+2][0] == 'ʔ' and j + 3 == m):
                    tokens.append(('aj', 'V'))
                    j += 2
                    continue
        tokens.append((sym, typ))
        j += 1

    # Insert epenthetic glides between u/i and following dissimilar vowel
    glide_tokens = []
    for idx in range(len(tokens)):
        glide_tokens.append(tokens[idx])
        if idx < len(tokens) - 1:
            curr_v, curr_typ = tokens[idx]
            next_v, next_typ = tokens[idx+1]
            if curr_typ == 'V' and next_typ == 'V':
                if curr_v in ['u', 'uː'] and next_v in ['e', 'eː', 'ə', 'o', 'oː', 'a', 'aː', 'i', 'iː']:
                    glide_tokens.append(('w', 'C'))
                elif curr_v in ['i', 'iː'] and next_v in ['o', 'oː', 'u', 'uː', 'a', 'aː', 'ə', 'e', 'eː']:
                    glide_tokens.append(('j', 'C'))

    tokens = glide_tokens

    # Find vowel nuclei
    v_indices = [idx for idx, (sym, typ) in enumerate(tokens) if typ == 'V']
    
    if len(v_indices) <= 1:
        return "".join(t[0] for t in tokens)

    # Maximum Onset Principle
    syllable_breaks = set()
    for k in range(len(v_indices) - 1):
        i1 = v_indices[k]
        i2 = v_indices[k+1]
        c_count = i2 - i1 - 1
        if c_count == 0:
            syllable_breaks.add(i1 + 1)
        elif c_count == 1:
            syllable_breaks.add(i1 + 1)
        elif c_count >= 2:
            syllable_breaks.add(i1 + 2)

    res = []
    for idx, (sym, typ) in enumerate(tokens):
        if idx in syllable_breaks and idx > 0:
            res.append('.')
        res.append(sym)

    return "".join(res)

def syllabify_bajau_ipa(phrase):
    if not phrase or not phrase.strip():
        return ""
    
    words = phrase.strip().split()
    syll_words = []
    for w in words:
        if '-' in w:
            parts = w.split('-')
            syll_words.append("-".join(syllabify_single_word(p) for p in parts if p))
        else:
            syll_words.append(syllabify_single_word(w))
            
    return f"/{' '.join(syll_words)}/"

conn = sqlite3.connect(db_path)
c = conn.cursor()

rows = c.execute("SELECT id, headword FROM entries ORDER BY id ASC").fetchall()
print(f"Applying syllable-split IPA with vowel lengthening (ː) to {len(rows)} entries...")

updated_count = 0
for eid, hw in rows:
    new_ipa = syllabify_bajau_ipa(hw)
    c.execute("UPDATE entries SET ipa = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_ipa, eid))
    updated_count += 1

conn.commit()
conn.close()

print(f"Successfully updated IPA with lengthening for {updated_count} entries!")
