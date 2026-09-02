import sys
import json
import os
import re
import fitz

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = os.path.join(os.getcwd(), 'design_references', 'AGrammarofWestCoastBajau.pdf')
OUTPUT_JSON_PATH = os.path.join(os.getcwd(), 'src', 'lib', 'db', 'extracted_full_sentences.json')

print(f"Reading PDF from {PDF_PATH}...")
doc = fitz.open(PDF_PATH)

full_examples = []
seen = set()

for page_idx in range(len(doc)):
    page = doc[page_idx]
    text = page.get_text()
    
    # Matches numbered examples e.g. (5.4) ... 'English translation'
    matches = re.finditer(r'\((\d+\.\d+[a-z]?)\)\s*([^\n\r]+(?:\n[^\n\r]+)*?[\u2018\x27]([^\u2019\x27\n\r]{8,300})[\u2019\x27](?:\s*\(([^)]+)\))?)', text)
    
    for m in matches:
        ex_num = m.group(1)
        full_block = m.group(2)
        translation_en = m.group(3).strip()
        citation = m.group(4).strip() if m.group(4) else f"Miller (2007), p.{page_idx+1}"
        
        lines = [l.strip() for l in full_block.split('\n') if l.strip()]
        if not lines:
            continue
            
        bajau_lines = []
        for l in lines:
            if re.search(r'[\u2018\x27][^\u2019\x27]+[\u2019\x27]', l):
                break
            # Check if this line is an ALL-CAPS/morpheme gloss line
            caps_count = sum(1 for c in l if c.isupper())
            if caps_count > len(l) * 0.35 and any(tag in l for tag in ['AV', 'UV', 'PERF', 'NOM', 'ACC', 'FOC', 'TOP', '1S', '2S', '3S', 'THAT', 'ART', 'PST', 'DIR', 'PL', 'SG', 'COMPL']):
                break
            bajau_lines.append(l)
            
        if bajau_lines:
            raw_bj = ' '.join(bajau_lines)
            clean_bj = re.sub(r'[∅\(\?\)\[\]=\^/]', '', raw_bj)
            clean_bj = re.sub(r'^[A-Za-z]\.\s*', '', clean_bj)
            clean_bj = re.sub(r'\s+', ' ', clean_bj).strip(" ,.;:-_`'")
            
            words = clean_bj.split()
            if len(words) >= 3 and not any(clean_bj.lower().startswith(p) for p in ['or the ', 'this is ', 'table ', 'chapter ', 'figure ', 'section ', 'example ']):
                if clean_bj not in seen:
                    seen.add(clean_bj)
                    full_examples.append({
                        'ex_num': ex_num,
                        'page': page_idx + 1,
                        'sentence_bajau': clean_bj,
                        'sentence_en_raw': translation_en,
                        'source': citation
                    })

print(f"Extracted {len(full_examples)} high-quality complete examples.")
with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(full_examples, f, indent=2, ensure_ascii=False)
print(f"Saved to {OUTPUT_JSON_PATH}")
