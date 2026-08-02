import fs from "fs";
import path from "path";

const root = process.cwd();
const errors = [];
const warnings = [];

function validateInlineScripts(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`);
    return;
  }

  const html = fs.readFileSync(absolutePath, "utf8");
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];

  scripts.forEach((match, index) => {
    try {
      new Function(match[1]);
    } catch (error) {
      errors.push(`${relativePath}: inline script ${index + 1} has invalid JavaScript: ${error.message}`);
    }
  });
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function localPathExists(value) {
  if (!value || /^https?:\/\//i.test(value)) return true;
  const relative = String(value).replace(/^\/+/, "");
  return fs.existsSync(path.join(root, relative));
}

const booksText = read("books.json");
let books = [];

try {
  books = JSON.parse(booksText);
  if (!Array.isArray(books)) {
    errors.push("books.json must contain an array.");
    books = [];
  }
} catch (error) {
  errors.push(`books.json is not valid JSON: ${error.message}`);
}

const seen = new Map();
books.forEach((book, index) => {
  const label = `books.json item ${index + 1}`;
  for (const field of ["title", "author", "category", "cover"]) {
    if (!String(book?.[field] ?? "").trim()) {
      errors.push(`${label}: missing ${field}.`);
    }
  }

  const key = `${String(book?.title ?? "").trim().toLowerCase()}::${String(book?.author ?? "").trim().toLowerCase()}`;
  if (key !== "::") {
    if (seen.has(key)) warnings.push(`${label}: duplicate title/author also found at item ${seen.get(key)}.`);
    else seen.set(key, index + 1);
  }

  if (!["en", "it"].includes(String(book?.language ?? "").trim())) {
    errors.push(`${label}: missing or invalid language; expected en or it.`);
  }

  if (book?.cover && !localPathExists(book.cover)) {
    warnings.push(`${label}: local cover not found: ${book.cover}`);
  }

  for (const field of ["amazon", "payhip"]) {
    const value = String(book?.[field] ?? "").trim();
    if (value && !/^https:\/\//i.test(value)) {
      warnings.push(`${label}: ${field} URL is not HTTPS: ${value}`);
    }
  }
});

const indexHtml = read("index.html");
const termsHtml = read("terms.html");
read("privacy.html");
read("thank-you.html");
validateInlineScripts("international/index.html");
validateInlineScripts("it/catalogo/index.html");
const internationalHtml = read("international/index.html");
const italianCatalogHtml = read("it/catalogo/index.html");

if (!indexHtml.includes('href="privacy.html"') && !indexHtml.includes('href="/privacy.html"')) {
  errors.push("index.html does not link to privacy.html.");
}

if (!indexHtml.includes('href="/international/"')) {
  errors.push("index.html does not link to the International Catalog.");
}

if (!indexHtml.includes('href="/it/catalogo/"')) {
  errors.push("index.html does not link to the Catalogo Italiano.");
}

if (!internationalHtml.includes("International Catalog") || !italianCatalogHtml.includes("Catalogo Italiano")) {
  errors.push("One or both catalog landing pages are missing their expected identity.");
}

if (!indexHtml.includes('id="currentYear"')) {
  errors.push("index.html is missing the automatic copyright year.");
}

if (!termsHtml.includes('id="termsCurrentYear"')) {
  errors.push("terms.html is missing the automatic copyright year.");
}

if (indexHtml.includes("(bestsellers.length === 0 && i < 3)")) {
  errors.push("index.html still assigns BESTSELLER badges automatically.");
}

const submitHandlers = (indexHtml.match(/ebookDownloadForm'\)\.addEventListener\('submit'/g) || []).length;
if (submitHandlers !== 1) {
  errors.push(`Expected one free eBook submit handler; found ${submitHandlers}.`);
}

if (indexHtml.includes("Check your email for the download link")) {
  errors.push("index.html still contains the unsupported automatic-delivery message.");
}

if (indexHtml.includes('"@type": "SearchAction"')) {
  warnings.push("index.html still advertises a SearchAction that the site does not implement.");
}

if (indexHtml.includes('href="#"')) {
  warnings.push('index.html still contains one or more dead href="#" links.');
}

console.log(`Checked ${books.length} catalog records.`);

if (warnings.length) {
  console.warn("\nWarnings:");
  warnings.forEach(item => console.warn(`- ${item}`));
}

if (errors.length) {
  console.error("\nErrors:");
  errors.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log("\nSite validation completed successfully.");
