import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('design_references/AGrammarofWestCoastBajau.pdf')

words_to_find = [
    'terus', 'mono-mono', 'semono-mono', 'entedo', 'lingaw', 'betiru',
    'debui\'', 'sinsaung', 'patut', 'rupo-rupo', 'andang', 'mitu', 'pitu'
]

# Search entire PDF text for numbered examples containing these words
pattern = re.compile(r'(\(\d+\.\d+\)\s+.*?(?:\n[^\n]+){2,8}?[‘\"][^’\"]+[’\"])', re.DOTALL)

found_examples = {}

for pno in range(len(doc)):
    page_text = doc[pno].get_text()
    for m in pattern.finditer(page_text):
        ex = m.group(1)
        for w in words_to_find:
            if re.search(r'\b' + re.escape(w) + r'\b', ex, re.IGNORECASE):
                if w not in found_examples:
                    found_examples[w] = []
                if len(found_examples[w]) < 2:
                    found_examples[w].append((pno + 1, ex.strip()))

for w in words_to_find:
    print(f"\n==================== {w} ({len(found_examples.get(w, []))} found) ====================")
    for p, text in found_examples.get(w, []):
        print(f"[Page {p}]\n{text}\n")
