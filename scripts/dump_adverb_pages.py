import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open('design_references/AGrammarofWestCoastBajau.pdf')

def print_pages(start_pno, end_pno):
    for p in range(start_pno - 1, end_pno):
        print(f"\n==================== PAGE {p+1} ====================")
        print(doc[p].get_text())

print_pages(150, 156)
print_pages(377, 388)
