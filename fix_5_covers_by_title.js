"use strict";
const fs = require("fs");
const path = require("path");

const BOOKS_JSON = "books.json";
const COVERS_DIR = "covers";

const map = [
  { match: /the\s+dark\s+side\s+of\s+charisma/i, file: "dark-side-of-charisma.jpg" },
  { match: /ruminazione\s+mentale/i, file: "ruminazione-mentale.jpg" },
  { match: /pellegrini\s+di\s+speranza/i, file: "pellegrini-di-speranza.png" },
  { match: /emozioni\s+intrecciate/i, file: "emozioni-intrecciate.png" },
  { match: /shinrin/i, file: "shinrin-yoku-ita.jpeg" },
];

function getTitle(b){
  return String(b.title ?? b.titolo ?? "").trim();
}
function setCover(b, f){
  const v = `/covers/${f}`;
  if ("cover" in b) b.cover = v;
  else if ("immagine" in b) b.immagine = v;
  else b.cover = v;
}

const raw = fs.readFileSync(BOOKS_JSON, "utf8");
const books = JSON.parse(raw);

let changed = 0;
const missingFiles = [];

for (const b of books) {
  const t = getTitle(b);
  if (!t) continue;

  const rule = map.find(r => r.match.test(t));
  if (!rule) continue;

  setCover(b, rule.file);
  changed++;

  const p = path.join(COVERS_DIR, rule.file);
  if (!fs.existsSync(p)) missingFiles.push(rule.file);
}

fs.writeFileSync(BOOKS_JSON, JSON.stringify(books, null, 2), "utf8");

console.log(`✅ books.json aggiornato per ${changed} record.`);
if (missingFiles.length) {
  console.log("❌ Mancano questi file in covers/:");
  [...new Set(missingFiles)].forEach(f => console.log("   - " + f));
  process.exitCode = 2;
} else {
  console.log("✅ Tutti i file copertina richiesti esistono in covers/.");
}
