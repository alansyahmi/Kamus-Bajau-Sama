import sys
import json
import os
import re
import fitz

sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = os.path.join(os.getcwd(), 'design_references', 'AGrammarofWestCoastBajau.pdf')
OUTPUT_SENTENCES_JSON = os.path.join(os.getcwd(), 'src', 'lib', 'db', 'verified_sentence_corpus.json')

print(f"Loading PDF from {PDF_PATH}...")
doc = fitz.open(PDF_PATH)

parsed_candidates = []
seen = set()

for page_idx in range(95, len(doc)):
    text = doc[page_idx].get_text()
    
    # Split text into numbered blocks
    blocks = re.split(r'\n(?=\(\d+\.\d+[a-z]?\))', text)
    for b in blocks:
        m = re.match(r'^\((\d+\.\d+[a-z]?)\)\s*(.*)', b.strip(), re.DOTALL)
        if not m:
            continue
        ex_num = m.group(1)
        body = m.group(2).strip()
        
        # English translation is in quotes at the end
        quotes = list(re.finditer(r'[\u2018\x27]([^\u2019\x27\n\r]{10,250})[\u2019\x27]', body))
        if not quotes:
            continue
        translation_en = quotes[-1].group(1).strip()
        
        # Source citation
        src_m = re.search(r'\(([^)]+(?:\d+|Elicited|elicited)[^)]*)\)$', body.strip())
        src = src_m.group(1).strip() if src_m else f"Miller (2007), p.{page_idx+1}"
        
        lines = [l.strip() for l in body.split('\n') if l.strip()]
        if len(lines) < 2:
            continue
            
        # Extract the Bajau line(s) before the interlinear gloss line
        bajau_words = []
        for l in lines:
            if re.search(r'[\u2018\x27][^\u2019\x27]+[\u2019\x27]', l):
                break
            caps_count = sum(1 for c in l if c.isupper())
            if caps_count > len(l) * 0.35 and any(tag in l for tag in ['AV', 'UV', 'PERF', 'NOM', 'ACC', 'FOC', 'TOP', '1S', '2S', '3S', 'THAT', 'ART', 'PST', 'DIR', 'PL', 'SG', 'COMPL', 'CAUS', 'APPL', 'PREP', 'NEG']):
                break
            # Remove interlinear gloss annotations
            clean_l = re.sub(r'[∅\(\?\)\[\]=\^/]', '', l)
            clean_l = re.sub(r'^[a-z]\.\s*', '', clean_l)
            clean_l = re.sub(r'[\x27\u2018\u2019][^\x27\u2019]+[\x27\u2019]', '', clean_l)
            for w in clean_l.split():
                if not (w.isupper() and len(w) > 1 and w in ['DEM', 'PRT', 'FOC', 'TOP', 'PERF', 'AV', 'UV', 'PASS', '1S', '2S', '3S', '1P', '2P', '3P', 'ART', 'PST', 'DIR', 'PL', 'SG', 'COMPL', 'CAUS', 'APPL', 'PREP', 'NEG']):
                    bajau_words.append(w)
                    
        bj_line = ' '.join(bajau_words).strip(" ,.;:-_`'")
        bj_line = re.sub(r'\s+', ' ', bj_line)
        
        # Apply standardized orthography: -ay -> -ai, -aw -> -au, bu'e'
        tokens = bj_line.split()
        std_tokens = []
        for tok in tokens:
            t = tok
            if t.endswith('ay'):
                t = t[:-2] + 'ai'
            elif t.endswith('aw'):
                t = t[:-2] + 'au'
            elif t == "bue'":
                t = "bu'e'"
            std_tokens.append(t)
        bj_line = ' '.join(std_tokens)
        
        if len(bj_line.split()) >= 3 and len(translation_en.split()) >= 3:
            # Filter out non-sentences
            if not any(translation_en.lower().startswith(p) for p in ['actor ', 'undergoer ', 'passive ', 'the term ', 'counting ', 'region or ', 'foot reduplication', 'intensiveness', 'nominalizer', 'clause ']):
                if bj_line not in seen and len(bj_line) > 12:
                    seen.add(bj_line)
                    parsed_candidates.append({
                        'ex_num': ex_num,
                        'page': page_idx + 1,
                        'sentence_bajau': bj_line,
                        'sentence_en': translation_en,
                        'source': src
                    })

print(f"Extracted {len(parsed_candidates)} authentic sentences from chapters 5-14.")
with open(OUTPUT_SENTENCES_JSON, 'w', encoding='utf-8') as f:
    json.dump(parsed_candidates, f, indent=2, ensure_ascii=False)
