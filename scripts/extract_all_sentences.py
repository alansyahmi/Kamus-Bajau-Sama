import sys
import json
import os
import re
import fitz

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = os.path.join(os.getcwd(), 'design_references', 'AGrammarofWestCoastBajau.pdf')
OUTPUT_JSON_PATH = os.path.join(os.getcwd(), 'src', 'lib', 'db', 'raw_extracted_sentences.json')

print(f"Reading PDF from {PDF_PATH}...")
doc = fitz.open(PDF_PATH)

examples = []
seen_sentences = set()

for page_idx in range(len(doc)):
    page = doc[page_idx]
    blocks = page.get_text('blocks')
    
    for b in blocks:
        text = b[4].strip()
        m = re.match(r'^\((\d+\.\d+[a-z]?)\)\s*(.*)', text, re.DOTALL)
        if not m:
            continue
            
        ex_num = m.group(1)
        body = m.group(2).strip()
        
        src_m = re.search(r'\(([^)]+(?:\d+|Elicited|elicited)[^)]*)\)$', body.strip())
        source_citation = src_m.group(1).strip() if src_m else f"Mark T. Miller (2007), p.{page_idx + 1}"
        
        quotes = list(re.finditer(r'[\u2018\x27]([^\u2019\x27\n\r]{6,300})[\u2019\x27]', body))
        if not quotes:
            continue
            
        translation_en = quotes[-1].group(1).strip()
        
        lines = [l.strip() for l in body.split('\n') if l.strip()]
        if not lines:
            continue
            
        raw_bajau_line = lines[0]
        # Skip commentary
        if any(raw_bajau_line.lower().startswith(p) for p in ['or the ', 'this is ', 'table ', 'chapter ', 'figure ', 'see ', 'cf. ', 'example ']):
            continue
            
        clean_bj = re.sub(r'[∅\(\?\)\[\]=\^/]', '', raw_bajau_line)
        clean_bj = re.sub(r'[\x27\u2018\u2019][^\x27\u2019]+[\x27\u2019]', '', clean_bj)
        clean_bj = re.sub(r'^[A-Za-z]\.\s*', '', clean_bj)
        clean_bj = re.sub(r'\(\d+[\.\d]*[a-z]?\)', '', clean_bj)
        clean_bj = re.sub(r'\s+', ' ', clean_bj).strip(" ,.;:-_`'")
        
        words = clean_bj.split()
        if len(words) >= 3 and len(translation_en.split()) >= 2:
            if clean_bj not in seen_sentences:
                seen_sentences.add(clean_bj)
                examples.append({
                    'ex_num': ex_num,
                    'page': page_idx + 1,
                    'sentence_bajau': clean_bj,
                    'sentence_en_raw': translation_en,
                    'source': source_citation
                })

print(f"Extracted {len(examples)} unique sentences. Saving to {OUTPUT_JSON_PATH}...")
with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(examples, f, indent=2, ensure_ascii=False)
print("Done!")
