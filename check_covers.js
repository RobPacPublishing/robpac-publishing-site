"use strict";
const fs = require("fs");
const path = require("path");
const JSON_FILE = "libri_backup.json";

function loadBooks() {
  const raw = fs.readFileSync(JSON_FILE, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error(`Formato JSON inatteso in ${JSON_FILE}`);
  return data;
}

(function main(){
  const books = loadBooks();
  const want = new Set(books.map(b => (b.cover || "").trim()).filter(Boolean));
  const have = new Set(fs.readdirSync("covers"));
  const missing = [...want].filter(x => !have.has(x));
  const extras  = [...have].filter(x => !want.has(x));

  console.log(`\n❌ MANCANTI nel folder covers/ (${missing.length})`);
  console.log(missing.length ? missing.join("\n") : "(nessuna)");
  console.log(`\nℹ️  NON REFERENZIATI dal JSON (${extras.length})`);
  console.log(extras.length ? extras.join("\n") : "(nessuno)");
})();
