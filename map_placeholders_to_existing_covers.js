cat > map_placeholders_to_existing_covers.js <<'EOF'
"use strict";

const fs = require("fs");
const path = require("path");

const BOOKS_JSON = "books.json";
const COVERS_DIR = "covers";
const PLACEHOLDER = "/covers/placeholder.svg";

function norm(s){
  return String(s||"")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g," ")
    .trim();
}

function bestMatch(title, files){
  const t = norm(title);
  let best = null;
  for(const f of files){
    const base = f.replace(/\.[^.]+$/,"");
    const n = norm(base);
    // punteggio semplice: quante parole del titolo compaiono nel filename
    const words = t.split(" ").filter(Boolean);
    let score = 0;
    for(const w of words){
      if(w.length >= 4 && n.includes(w)) score++;
    }
    // bonus se include parola chiave forte
    if(n.includes("charisma") && t.includes("charisma")) score += 3;
    if(n.includes("ruminazione") && t.includes("ruminazione")) score += 3;
    if(n.includes("shinrin") && t.includes("shinrin")) score += 3;
    if(n.includes("emozioni") && t.includes("emozioni")) score += 3;
    if(n.includes("pellegrini") && t.includes("pellegrini")) score += 3;
    if(n.includes("memory") && t.includes("memory")) score += 3;

    if(!best || score > best.score) best = { f, score };
  }
  return best && best.score > 0 ? best.f : null;
}

(function main(){
  const books = JSON.parse(fs.readFileSync(BOOKS_JSON,"utf8"));
  const files = fs.readdirSync(COVERS_DIR).filter(x => /\.(png|jpe?g|webp)$/i.test(x));

  const missing = books.filter(b => (b.cover||"") === PLACEHOLDER);
  if(missing.length === 0){
    console.log("Nessun placeholder da mappare.");
    return;
  }

  let updated = 0;

  for(const b of missing){
    const m = bestMatch(b.title, files);
    if(!m){
      console.log(`⚠️  Nessun match: ${b.title}`);
      continue;
    }
    b.cover = `/covers/${m}`;
    updated++;
    console.log(`✅ ${b.title} -> ${m}`);
  }

  fs.writeFileSync(BOOKS_JSON, JSON.stringify(books, null, 2), "utf8");
  console.log(`\nAggiornati: ${updated}/${missing.length}`);
})();
EOF
