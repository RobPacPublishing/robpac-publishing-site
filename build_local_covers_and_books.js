"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const INPUT_BACKUP_JSON = "libri_backup.before_nocloud.json";
const OUTPUT_BOOKS_JSON = "books.json";
const COVERS_DIR = "covers";
const PLACEHOLDER_NAME = "placeholder.svg";

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error(`Formato inatteso in ${file}: atteso array`);
  return data;
}

function stripQuery(u) {
  return u.split("?")[0];
}

function filenameFromUrl(u) {
  const clean = stripQuery(u);
  const last = clean.split("/").pop() || "";
  if (!last.includes(".")) return `${last}.jpg`;
  return last;
}

function normalizeBook(b) {
  const title = (b.title ?? b.titolo ?? "").toString().trim();
  const author = (b.author ?? b.autore ?? "").toString().trim();
  const category = (b.category ?? b.genere ?? b.sottogenere ?? "").toString().trim();
  const description = (b.description ?? b.descrizione ?? "").toString();
  const amazon = (b.amazon ?? b.linkAmazon ?? "").toString().trim();
  const coverUrl = (b.cover ?? b.immagine ?? "").toString().trim();
  return { title, author, category, description, amazon, coverUrl };
}

function createPlaceholderIfMissing() {
  const p = path.join(COVERS_DIR, PLACEHOLDER_NAME);
  if (fs.existsSync(p)) return;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <rect width="100%" height="100%" fill="#111"/>
      <rect x="40" y="40" width="520" height="820" fill="#1b1b1b" stroke="#333" stroke-width="4"/>
      <text x="300" y="455" fill="#bbb" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">
        Cover not available
      </text>
    </svg>`;
  fs.writeFileSync(p, svg, "utf8");
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https://") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": "RobPac-Covers-Downloader" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpGet(res.headers.location));
      }
      resolve(res);
    });
    req.on("error", reject);
  });
}

function downloadToFile(url, outPath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https://") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": "RobPac-Covers-Downloader" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadToFile(res.headers.location, outPath));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(outPath);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    });
    req.on("error", reject);
  });
}

function addFauto(url) {
  if (!url.includes("/image/upload/")) return url;
  if (url.includes("/image/upload/f_auto")) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_80/");
}

function removeVersion(url) {
  return url.replace(/\/v\d+\//, "/");
}

function swapExt(url, ext) {
  const clean = stripQuery(url);
  return clean.replace(/\.(jpg|jpeg|png|webp)$/i, `.${ext}`);
}

function candidateUrls(original) {
  const url = stripQuery(original);
  const set = new Set();

  set.add(url);
  set.add(addFauto(url));
  set.add(removeVersion(url));
  set.add(addFauto(removeVersion(url)));

  if (/\.(jpg|jpeg|png|webp)$/i.test(url)) {
    for (const ext of ["jpg", "png", "webp"]) {
      set.add(swapExt(url, ext));
      set.add(addFauto(swapExt(url, ext)));
      set.add(removeVersion(swapExt(url, ext)));
      set.add(addFauto(removeVersion(swapExt(url, ext))));
    }
  }

  return [...set];
}

(async function main() {
  if (!fs.existsSync(INPUT_BACKUP_JSON)) {
    console.error(`❌ File non trovato: ${INPUT_BACKUP_JSON}`);
    process.exit(1);
  }

  ensureDir(COVERS_DIR);
  createPlaceholderIfMissing();

  const rawBooks = readJson(INPUT_BACKUP_JSON);
  const normalized = rawBooks.map(normalizeBook).filter(b => b.title && b.coverUrl);

  console.log(`📚 Libri letti: ${rawBooks.length}`);
  console.log(`✅ Libri con titolo+coverUrl: ${normalized.length}`);

  let ok = 0;
  let fail = 0;

  const solvedUrlByTitle = new Map(); // titolo -> url effettivamente scaricato (se risolto)

  for (let i = 0; i < normalized.length; i++) {
    const b = normalized[i];

    const fileName = filenameFromUrl(b.coverUrl);
    const outFile = path.join(COVERS_DIR, fileName);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 0) {
      ok++;
      solvedUrlByTitle.set(b.title, b.coverUrl);
      continue;
    }

    const tries = candidateUrls(b.coverUrl);
    let downloaded = false;

    for (const u of tries) {
      try {
        const tmpFile = outFile;
        await downloadToFile(u, tmpFile);
        downloaded = true;
        solvedUrlByTitle.set(b.title, u);
        break;
      } catch (e) {
        // continua
      }
    }

    if (downloaded) {
      ok++;
    } else {
      fail++;
      console.error(`❌ Download fallito (tutte le varianti): "${b.title}"`);
      console.error(`   URL origine: ${b.coverUrl}`);
    }

    if ((i + 1) % 10 === 0) console.log(`⬇️  Elaborate ${i + 1}/${normalized.length}`);
  }

  const outputBooks = normalized.map(b => {
    const fileName = filenameFromUrl(b.coverUrl);
    const localPath = `/covers/${fileName}`;
    const exists = fs.existsSync(path.join(COVERS_DIR, fileName)) && fs.statSync(path.join(COVERS_DIR, fileName)).size > 0;

    return {
      title: b.title,
      author: b.author,
      category: b.category,
      cover: exists ? localPath : `/covers/${PLACEHOLDER_NAME}`,
      description: b.description,
      amazon: b.amazon
    };
  });

  fs.writeFileSync(OUTPUT_BOOKS_JSON, JSON.stringify(outputBooks, null, 2), "utf8");

  console.log(`\n🖼️  Copertine OK: ${ok}`);
  console.log(`⚠️  Copertine KO: ${fail}`);
  console.log(`🧾 Creato/aggiornato: ${OUTPUT_BOOKS_JSON}`);
  console.log(`📁 Cartella copertine: ${COVERS_DIR}/`);
})();
