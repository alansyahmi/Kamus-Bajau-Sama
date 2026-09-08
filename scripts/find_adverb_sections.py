import fitz # PyMuPDF
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open('design_references/AGrammarofWestCoastBajau.pdf')
print(f"Total pages: {len(doc)}")

# 1. Search Table of Contents / Outline
toc = doc.get_toc()
adverb_toc = [item for item in toc if 'adverb' in item[1].lower() or 'time' in item[1].lower() or 'manner' in item[1].lower() or 'degree' in item[1].lower() or 'particle' in item[1].lower()]
print(f"Matching TOC entries ({len(adverb_toc)}):")
for lvl, title, page in adverb_toc:
    print(f"  Level {lvl}: {title} (Page {page})")

# If TOC is empty or minimal, search for section headings in text
if not adverb_toc:
    print("\nSearching text for Adverb sections...")
    for pno in range(len(doc)):
        text = doc[pno].get_text()
        matches = re.findall(r'(\d+\.\d+(?:\.\d+)?\s+[^\n]*adverb[^\n]*)', text, re.IGNORECASE)
        for m in matches:
            print(f"  Page {pno+1}: {m.strip()}")
