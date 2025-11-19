# -*- coding: utf-8 -*-
import json, os, re, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
COVERS_DIR = os.path.join(ROOT, "covers")

# 1) Sorgente dati: prima books.json, altrimenti il backup
CANDIDATES = ["books.json", "books", "libri_backup_2025-11-07 -.json"]
data = None
for name in CANDIDATES:
    p = os.path.join(ROOT, name)
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                break
            except Exception as e:
                pass

if data is None:
    print("❌ Nessun JSON trovato (books.json o backup).")
    sys.exit(1)

# Normalizza struttura se è contenuta in una chiave nota
if isinstance(data, dict):
    for k in ("books", "items", "data"):
        if k in data and isinstance(data[k], list):
            data = data[k]
            break

def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[’'`]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s

missing = []
slug_mismatch = []
dup_map = defaultdict(list)

def norm_cover_path(c):
    """Ritorna nome file cover (senza cartella) per confronto."""
    if not c: 
        return ""
    c = c.replace("\\", "/")
    return c.split("/")[-1]

for i, b in enumerate(data, 1):
    title = (b.get("title") or "").strip()
    cover = (b.get("cover") or b.get("image") or b.get("img") or "").strip()
    file_only = norm_cover_path(cover)

    # Expected: titolo -> slug -> <slug>.jpg/png
    exp_slug = slugify(title)
    # Proviamo estensioni più comuni
    expected_candidates = [f"{exp_slug}.jpg", f"{exp_slug}.jpeg", f"{exp_slug}.png", f"{exp_slug}.webp"]

    # File effettivo (se presente)
    actual_path = os.path.join(COVERS_DIR, file_only) if file_only else ""
    exists = os.path.exists(actual_path)

    # Segnala mancanti
    if not file_only or not exists:
        missing.append((title, cover))
    else:
        dup_map[file_only].append(title)
        # Verifica mismatch tra slug del titolo e nome file cover
        base = os.path.splitext(file_only)[0]
        if base != exp_slug and file_only not in expected_candidates:
            slug_mismatch.append((title, file_only, exp_slug))

print("\n=== RISULTATI ===")
if missing:
    print("\n❌ Cover mancanti o percorso inesistente:")
    for t, c in missing:
        print(f" - '{t}' -> cover dichiarata: {c or '(vuota)'}")

if slug_mismatch:
    print("\n⚠️  Cover presente ma nome file non coerente con il titolo:")
    for t, file_only, exp in slug_mismatch:
        print(f" - '{t}' -> file: {file_only}  | atteso (slug titolo): {exp}.(jpg|png|webp)")

dups = [fn for fn, titles in dup_map.items() if len(titles) > 1]
if dups:
    print("\n⚠️  Cover usata da più libri (possibile scambio/copertura errata):")
    for fn in dups:
        print(f" - {fn} -> {', '.join(dup_map[fn])}")

if not missing and not slug_mismatch and not dups:
    print("\n✅ Nessuna incongruenza rilevata tra cover e titoli.")
print("")
