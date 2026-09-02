import sys
import os
import re
import json
import fitz

sys.stdout.reconfigure(encoding='utf-8')

ENGLISH_STOPWORDS = {
    'the', 'and', 'or', 'to', 'in', 'on', 'at', 'from', 'with', 'by', 'of', 'for',
    'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might',
    'must', 'can', 'could', 'that', 'this', 'these', 'those', 'it', 'its', 'as',
    'if', 'when', 'than', 'because', 'while', 'where', 'after', 'so', 'though',
    'since', 'until', 'whether', 'before', 'although', 'nor', 'like', 'once',
    'unless', 'now', 'except', 'chapter', 'table', 'figure', 'section', 'see',
    'example', 'page', 'wc', 'bajau', 'voice', 'actor', 'undergoer', 'passive',
    'indicative', 'imperative', 'mood', 'applicative', 'causative', 'nominal',
    'intransitive', 'transitive', 'derivation', 'inflection', 'order', 'aspect',
    'characterized', 'severed', 'ladder', 'must', 'cut', 'not', 'person', 'word',
    'words', 'clause', 'clauses', 'phrase', 'phrases', 'stem', 'stems', 'root',
    'roots', 'base', 'bases', 'prefix', 'suffix', 'infix', 'circumfix', 'clitic',
    'subject', 'object', 'verb', 'noun', 'adjective', 'adverb', 'pronoun'
}

def clean_hw(hw):
    if not hw:
        return ""
    hw = hw.strip(' \t\n\r\'\"‘’`.,;:()[]{}<>/?!@#$%^&*+=~|\\')
    # Standardize internal glottal stop to standard apostrophe '
    hw = hw.replace('’', "'").replace('‘', "'").replace('`', "'").replace('ʔ', "'")
    return hw

def is_valid_bajau_word(hw, gloss=""):
    cleaned = clean_hw(hw).lower()
    if len(cleaned) < 2:
        return False
    if cleaned in ENGLISH_STOPWORDS:
        return False
    if not re.match(r"^[a-z\u0259\']+$", cleaned):
        return False
    # Check if headword is identical to gloss (which means it was probably English)
    if gloss and cleaned == clean_hw(gloss).lower():
        return False
    return True

print("Cleaning and refining grammar dataset...")

with open('src/lib/db/extracted_grammar_entries.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

cleaned_entries = []
seen_norms = set()

for item in raw_data:
    hw = clean_hw(item['headword'])
    gloss = item['definition_en']
    if is_valid_bajau_word(hw, gloss):
        norm = re.sub(r'[^a-z0-9]', '', hw.lower())
        if norm and norm not in seen_norms and len(norm) >= 2:
            seen_norms.add(norm)
            item['headword'] = hw
            item['searchNormalized'] = norm
            cleaned_entries.append(item)

print(f"Original entries: {len(raw_data)} -> Validated Bajau entries: {len(cleaned_entries)}")

with open('src/lib/db/extracted_grammar_entries.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_entries, f, ensure_ascii=False, indent=2)

print("Saved cleaned entries. Re-running database seed...")
os.system("npx tsx src/lib/db/seed.ts")
