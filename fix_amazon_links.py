import json
import re

# Carica JSON con link corretti
with open('libri_backup_2025-11-07_-.json', 'r', encoding='utf-8') as f:
    books_json = json.load(f)

# Carica HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Per ogni libro nel JSON, sostituisci il link nell'HTML
for book in books_json:
    title = book['titolo'].split(':')[0].strip()
    correct_link = book['linkAmazon']
    
    # Pattern per trovare il libro e sostituire il link
    pattern = rf'(title:\s*"{re.escape(title)}[^"]*"[^}}]*amazonLink:\s*")[^"]*(")'
    html = re.sub(pattern, rf'\1{correct_link}\2', html, flags=re.IGNORECASE)

# Salva HTML corretto
with open('index_corrected.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✓ Link Amazon corretti! File salvato: index_corrected.html")
