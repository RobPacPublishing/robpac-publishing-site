import fs from 'fs';
import path from 'path';

const root = process.cwd();
const today = '2026-08-02';

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const target = filePath(relativePath);
  if (!fs.existsSync(target)) throw new Error(`Missing required file: ${relativePath}`);
  return fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
}

function write(relativePath, content) {
  const target = filePath(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
  console.log(`Updated ${relativePath}`);
}

function replaceRequired(content, search, replacement, label) {
  if (!content.includes(search)) {
    if (content.includes(replacement)) return content;
    throw new Error(`Could not find expected ${label}. The source file may have changed.`);
  }
  return content.replace(search, replacement);
}

function replaceRegexRequired(content, pattern, replacement, label) {
  if (!pattern.test(content)) {
    throw new Error(`Could not find expected ${label}. The source file may have changed.`);
  }
  pattern.lastIndex = 0;
  return content.replace(pattern, replacement);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function catalogPage({ lang, canonicalPath, title, description, eyebrow, heading, intro, searchLabel, allLabel, countLabel, viewLabel, amazonLabel, payhipLabel, emptyLabel, crossLabel, crossHref, crossCta, catalogLanguage }) {
  const isItalian = lang === 'it';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.robpacpublishing.com${canonicalPath}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="https://www.robpacpublishing.com${canonicalPath}">
  <meta property="og:image" content="https://www.robpacpublishing.com/assets/hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/assets/logo3senzasfondo.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .heading-font { font-family: 'Playfair Display', serif; }
    .book-card { transition: transform .25s ease, box-shadow .25s ease; }
    .book-card:hover { transform: translateY(-5px); box-shadow: 0 22px 44px rgba(0,0,0,.12); }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  <nav class="bg-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-5">
      <a href="/" class="flex items-center gap-3 min-w-0">
        <img src="/assets/logo3senzasfondo.png" alt="RobPac Publishing" class="h-12 w-12 object-contain">
        <div class="min-w-0">
          <p class="heading-font text-xl sm:text-2xl font-bold text-amber-700 truncate">RobPac Publishing</p>
          <p class="text-xs text-gray-500">${isItalian ? 'Casa editrice indipendente' : 'Independent Publishing House'}</p>
        </div>
      </a>
      <div class="flex items-center gap-3 sm:gap-5 text-sm font-semibold">
        <a href="/" class="text-gray-700 hover:text-amber-700">Home</a>
        <a href="${crossHref}" class="hidden sm:inline text-gray-700 hover:text-amber-700">${crossLabel}</a>
      </div>
    </div>
  </nav>

  <header class="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-b border-amber-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
      <p class="text-sm uppercase tracking-[.24em] font-bold text-amber-700 mb-4">${escapeHtml(eyebrow)}</p>
      <h1 class="heading-font text-4xl lg:text-6xl font-black leading-tight max-w-5xl mb-5">${escapeHtml(heading)}</h1>
      <p class="text-lg text-gray-700 leading-relaxed max-w-4xl">${escapeHtml(intro)}</p>
      <div class="mt-7 inline-flex items-center gap-3 rounded-full bg-white border border-amber-200 px-5 py-3 shadow-sm">
        <span class="font-black text-amber-700" id="catalogCount">0</span>
        <span class="text-sm text-gray-600">${escapeHtml(countLabel)}</span>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <section class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-10">
      <div class="grid md:grid-cols-[1fr_auto] gap-4 items-center">
        <label class="block">
          <span class="sr-only">${escapeHtml(searchLabel)}</span>
          <input id="catalogSearch" type="search" placeholder="${escapeHtml(searchLabel)}" class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500">
        </label>
        <select id="categoryFilter" class="border border-gray-300 rounded-xl px-4 py-3 bg-white min-w-[220px]">
          <option value="all">${escapeHtml(allLabel)}</option>
        </select>
      </div>
    </section>

    <section id="catalogGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"></section>
    <p id="emptyState" class="hidden text-center text-gray-600 py-16">${escapeHtml(emptyLabel)}</p>

    <section class="mt-16 rounded-3xl bg-gray-900 text-white p-8 lg:p-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[.22em] font-bold text-amber-300 mb-2">RobPac Publishing</p>
        <h2 class="heading-font text-3xl font-bold mb-3">${escapeHtml(crossCta)}</h2>
        <p class="text-gray-300 max-w-2xl">${isItalian ? 'Un unico editore, due cataloghi distinti per lingua e percorso editoriale.' : 'One publishing house with two distinct catalogs, each defined by its language and editorial direction.'}</p>
      </div>
      <a href="${crossHref}" class="inline-flex justify-center bg-amber-600 hover:bg-amber-700 text-white px-7 py-3 rounded-full font-bold whitespace-nowrap">${escapeHtml(crossLabel)} →</a>
    </section>
  </main>

  <footer class="bg-white border-t border-gray-200 py-10 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-5 justify-between text-sm text-gray-600">
      <p>© <span id="year"></span> RobPac Publishing</p>
      <div class="flex flex-wrap gap-5">
        <a href="/privacy.html" class="hover:text-amber-700">Privacy</a>
        <a href="/terms.html" class="hover:text-amber-700">Terms</a>
        <a href="/" class="hover:text-amber-700">Home</a>
      </div>
    </div>
  </footer>

  <script>
    const CATALOG_LANGUAGE = ${JSON.stringify(catalogLanguage)};
    const labels = {
      view: ${JSON.stringify(viewLabel)},
      amazon: ${JSON.stringify(amazonLabel)},
      payhip: ${JSON.stringify(payhipLabel)}
    };
    let catalogBooks = [];

    function escapeHtml(value = '') {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function normalizeBook(book) {
      return {
        ...book,
        language: book.language || (book.category === 'In lingua italiana' ? 'it' : 'en'),
        amazonLink: book.amazonLink || book.amazon || '',
        payhipLink: book.payhipLink || book.payhip || '',
        cover: book.cover || '/covers/placeholder.svg'
      };
    }

    function populateCategories() {
      const select = document.getElementById('categoryFilter');
      const categories = [...new Set(catalogBooks.map(book => book.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
      }
    }

    function renderCatalog() {
      const query = document.getElementById('catalogSearch').value.trim().toLowerCase();
      const category = document.getElementById('categoryFilter').value;
      const filtered = catalogBooks.filter(book => {
        const matchesCategory = category === 'all' || book.category === category;
        const haystack = [book.title, book.author, book.category, book.subcategory, book.description].join(' ').toLowerCase();
        return matchesCategory && (!query || haystack.includes(query));
      });

      const grid = document.getElementById('catalogGrid');
      const empty = document.getElementById('emptyState');
      grid.innerHTML = filtered.map(book => {
        const links = [];
        if (book.amazonLink) links.push('<a href="' + escapeHtml(book.amazonLink) + '" target="_blank" rel="noopener noreferrer" class="block text-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg font-bold text-sm">' + escapeHtml(labels.amazon) + '</a>');
        if (book.payhipLink) links.push('<a href="' + escapeHtml(book.payhipLink) + '" target="_blank" rel="noopener noreferrer" class="block text-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-bold text-sm">' + escapeHtml(labels.payhip) + '</a>');
        return '<article class="book-card bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">' +
          '<div class="bg-gray-100"><img src="' + escapeHtml(book.cover) + '" alt="' + escapeHtml(book.title) + ' cover" class="w-full h-60 object-contain" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=&quot;/covers/placeholder.svg&quot;"></div>' +
          '<div class="p-4 flex flex-col flex-grow"><p class="text-xs uppercase tracking-wide font-bold text-amber-700 mb-2">' + escapeHtml(book.subcategory || book.category || '') + '</p>' +
          '<h2 class="font-bold leading-snug mb-2">' + escapeHtml(book.title) + '</h2>' +
          '<p class="text-sm text-gray-500 mb-4">' + (book.author ? ((${JSON.stringify(isItalian ? 'di ' : 'by ')}) + escapeHtml(book.author)) : '') + '</p>' +
          '<div class="mt-auto space-y-2">' + links.join('') + '</div></div></article>';
      }).join('');
      empty.classList.toggle('hidden', filtered.length !== 0);
    }

    async function initCatalog() {
      const response = await fetch('/books.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load books.json');
      const data = await response.json();
      catalogBooks = (Array.isArray(data) ? data : []).map(normalizeBook).filter(book => book.language === CATALOG_LANGUAGE);
      document.getElementById('catalogCount').textContent = catalogBooks.length;
      populateCategories();
      renderCatalog();
    }

    document.getElementById('catalogSearch').addEventListener('input', renderCatalog);
    document.getElementById('categoryFilter').addEventListener('change', renderCatalog);
    document.getElementById('year').textContent = new Date().getFullYear();
    initCatalog().catch(error => {
      console.error(error);
      document.getElementById('emptyState').classList.remove('hidden');
    });
  </script>
</body>
</html>
`;
}

// 1. Add an explicit language field to every catalog record.
const booksPath = 'books.json';
const books = JSON.parse(read(booksPath));
if (!Array.isArray(books)) throw new Error('books.json must contain an array.');
let languageChanges = 0;
for (const book of books) {
  const inferred = book.language || (book.category === 'In lingua italiana' ? 'it' : 'en');
  if (book.language !== inferred) {
    book.language = inferred;
    languageChanges += 1;
  }
}
if (languageChanges > 0) write(booksPath, JSON.stringify(books, null, 2) + '\n');
else console.log('books.json already has explicit language values.');

// 2. Create the two distinct catalog destinations.
write('international/index.html', catalogPage({
  lang: 'en',
  canonicalPath: '/international/',
  title: 'International Catalog | RobPac Publishing',
  description: 'Explore the RobPac Publishing International Catalog: fiction, ideas, and practical knowledge published in English.',
  eyebrow: 'International Catalog · Books in English',
  heading: 'Stories, ideas and knowledge in English',
  intro: 'Explore fiction, personal growth, psychology, culture, lifestyle, and practical knowledge from the international editorial catalog of RobPac Publishing.',
  searchLabel: 'Search the International Catalog',
  allLabel: 'All categories',
  countLabel: 'books in the International Catalog',
  viewLabel: 'View book',
  amazonLabel: 'View on Amazon',
  payhipLabel: 'View eBook',
  emptyLabel: 'No books match your search.',
  crossLabel: 'Catalogo Italiano',
  crossHref: '/it/catalogo/',
  crossCta: 'Looking for books published in Italian?',
  catalogLanguage: 'en'
}));

write('it/catalogo/index.html', catalogPage({
  lang: 'it',
  canonicalPath: '/it/catalogo/',
  title: 'Catalogo Italiano | RobPac Publishing',
  description: 'Esplora il Catalogo Italiano RobPac Publishing: narrativa, idee e conoscenza pubblicate in italiano.',
  eyebrow: 'Catalogo Italiano · Libri in italiano',
  heading: 'Storie, idee e conoscenza in italiano',
  intro: 'Scopri narrativa, psicologia, benessere, spiritualità, cultura e conoscenza pratica nel catalogo editoriale italiano di RobPac Publishing.',
  searchLabel: 'Cerca nel Catalogo Italiano',
  allLabel: 'Tutte le categorie',
  countLabel: 'libri nel Catalogo Italiano',
  viewLabel: 'Vedi libro',
  amazonLabel: 'Vedi su Amazon',
  payhipLabel: 'Vedi eBook',
  emptyLabel: 'Nessun libro corrisponde alla ricerca.',
  crossLabel: 'International Catalog',
  crossHref: '/international/',
  crossCta: 'Cerchi i libri pubblicati in inglese?',
  catalogLanguage: 'it'
}));

// 3. Turn the homepage into a shared publishing-house gateway.
let indexHtml = read('index.html');

indexHtml = indexHtml
  .replaceAll('RobPac Publishing | 100+ Books - Fiction, Self-Help, Health & Wellness', 'RobPac Publishing | International and Italian Book Catalogs')
  .replaceAll('Independent publishing house with 100+ quality books on Amazon KDP. Explore fiction, self-help, diet cookbooks, psychology guides. Free chapter downloads available.', 'One independent publishing house with two distinct editorial catalogs: the International Catalog in English and the Catalogo Italiano in Italian.')
  .replaceAll('independent publisher, self-help books, fiction novels, diet cookbooks, psychology books, Amazon KDP, free book chapters, wellness guides', 'independent publisher, international book catalog, Italian book catalog, books in English, libri in italiano, Amazon KDP')
  .replaceAll('Independent publishing house delivering quality content across fiction, self-help, health, and specialized non-fiction with over 100 titles on Amazon KDP.', 'Independent publishing house presenting two distinct editorial catalogs: books published in English and books published in Italian, each with its own editorial direction.');

const oldNav = /<div class="hidden lg:flex[^"]*">[\s\S]*?<button onclick="openModal\(\)"[\s\S]*?<\/button>\s*<\/div>/;
const newNav = `                <div class="hidden lg:flex items-center space-x-5">
                    <a href="#home" class="text-gray-700 hover:text-amber-600 font-medium transition">Home</a>
                    <a href="/international/" class="text-gray-700 hover:text-amber-600 font-medium transition">International Catalog</a>
                    <a href="/it/catalogo/" class="text-gray-700 hover:text-amber-600 font-medium transition">Catalogo Italiano</a>
                    <a href="#studio" class="text-gray-700 hover:text-amber-600 font-medium transition">Studio</a>
                    <a href="#about" class="text-gray-700 hover:text-amber-600 font-medium transition">About</a>
                    <button onclick="openModal()" class="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:from-amber-600 hover:to-orange-700 transition shadow-md" aria-label="Request a free eBook">
                        Free eBook
                    </button>
                </div>`;
if (!indexHtml.includes('href="/international/" class="text-gray-700 hover:text-amber-600 font-medium transition">International Catalog</a>')) {
  indexHtml = replaceRegexRequired(indexHtml, oldNav, newNav, 'desktop navigation block');
}

const oldHeroText = /                <div class="text-center lg:text-left">[\s\S]*?                <\/div>\n\n                <div class="hidden lg:block">/;
const newHeroText = `                <div class="text-center lg:text-left">
                    <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-700 mb-5">RobPac Publishing</p>
                    <h1 class="heading-font text-4xl lg:text-5xl font-black text-gray-950 leading-tight mb-6">
                        One Publishing House. Two Editorial Catalogs.
                    </h1>
                    <p class="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                        An international catalog of books published in English and a distinct catalog of books published in Italian — united by one independent publishing identity.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-7">
                        <a href="/international/" class="bg-amber-700 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-amber-800 transition shadow-lg text-center">
                            Explore the International Catalog
                        </a>
                        <a href="/it/catalogo/" class="bg-white border border-amber-200 text-amber-800 px-8 py-4 rounded-full font-bold text-base hover:bg-amber-50 transition shadow-md text-center">
                            Esplora il Catalogo Italiano
                        </a>
                    </div>

                    <p class="text-sm text-gray-500">
                        Books in English · Libri in italiano · Distinct editorial paths
                    </p>
                </div>

                <div class="hidden lg:block">`;
if (!indexHtml.includes('One Publishing House. Two Editorial Catalogs.')) {
  indexHtml = replaceRegexRequired(indexHtml, oldHeroText, newHeroText, 'homepage hero text');
}

indexHtml = indexHtml
  .replace('>Independent Catalog</p>', '>One Publishing House</p>')
  .replace('Books across fiction, psychology, culture, lifestyle and practical knowledge.', 'An international catalog in English and a distinct catalog of books published in Italian.')
  .replace('>Editorial Catalog</p>', '>Two Editorial Catalogs</p>')
  .replace('Stories, guides, ideas and practical knowledge.', 'Distinct audiences, languages and editorial paths.');

const gateway = `<!-- CATALOG GATEWAY START -->
<section id="catalogs" class="py-16 bg-white border-b border-amber-100" aria-labelledby="catalogs-heading">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto mb-10">
      <p class="text-xs font-bold uppercase tracking-[0.25em] text-amber-700 mb-3">Two distinct editorial catalogs</p>
      <h2 id="catalogs-heading" class="heading-font text-3xl lg:text-4xl font-black text-gray-950 mb-4">Explore RobPac Publishing through two editorial paths</h2>
      <p class="text-gray-600 leading-relaxed">Discover books published in English in our International Catalog, or explore titles published in Italian in the Catalogo Italiano.</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-7">
      <article class="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-7 lg:p-9 shadow-lg">
        <div class="flex items-start justify-between gap-5 mb-6">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] font-bold text-amber-700 mb-2">Books published in English</p>
            <h3 class="heading-font text-3xl font-black text-gray-950">International Catalog</h3>
          </div>
          <div class="rounded-full bg-white border border-amber-200 px-4 py-2 text-sm whitespace-nowrap"><strong id="internationalCatalogCount">0</strong> books</div>
        </div>
        <p class="text-gray-700 leading-relaxed mb-6">An editorial selection spanning fiction, personal growth, psychology, culture, lifestyle, and practical knowledge.</p>
        <div id="internationalCatalogPreview" class="grid grid-cols-4 gap-3 mb-7" aria-label="International Catalog preview"></div>
        <a href="/international/" class="inline-flex justify-center bg-amber-700 hover:bg-amber-800 text-white px-7 py-3 rounded-full font-bold">Explore the International Catalog →</a>
      </article>

      <article class="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-7 lg:p-9 shadow-lg">
        <div class="flex items-start justify-between gap-5 mb-6">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] font-bold text-indigo-700 mb-2">Libri pubblicati in italiano</p>
            <h3 class="heading-font text-3xl font-black text-gray-950">Catalogo Italiano</h3>
          </div>
          <div class="rounded-full bg-white border border-indigo-200 px-4 py-2 text-sm whitespace-nowrap"><strong id="italianCatalogCount">0</strong> libri</div>
        </div>
        <p class="text-gray-700 leading-relaxed mb-6">Una selezione editoriale tra narrativa, psicologia, benessere, spiritualità, cultura e conoscenza pratica.</p>
        <div id="italianCatalogPreview" class="grid grid-cols-4 gap-3 mb-7" aria-label="Anteprima del Catalogo Italiano"></div>
        <a href="/it/catalogo/" class="inline-flex justify-center bg-indigo-700 hover:bg-indigo-800 text-white px-7 py-3 rounded-full font-bold">Esplora il Catalogo Italiano →</a>
      </article>
    </div>
  </div>
</section>
<!-- CATALOG GATEWAY END -->`;

if (!indexHtml.includes('<!-- CATALOG GATEWAY START -->')) {
  indexHtml = replaceRequired(
    indexHtml,
    '</header>\n\n<section class="bg-white py-6" aria-label="Percorsi e materiali">',
    `</header>\n\n${gateway}\n\n<section id="studio" class="bg-white py-6" aria-label="RobPac Publishing Studio e percorsi">`,
    'catalog gateway insertion point'
  );
} else if (!indexHtml.includes('<section id="studio"')) {
  indexHtml = indexHtml.replace('<section class="bg-white py-6" aria-label="Percorsi e materiali">', '<section id="studio" class="bg-white py-6" aria-label="RobPac Publishing Studio e percorsi">');
}
indexHtml = indexHtml.replace('>Percorsi e materiali</p>', '>RobPac Publishing Studio · Percorsi e materiali</p>');

indexHtml = indexHtml
  .replace('<section id="featured" class="py-20 bg-gray-50">', '<section id="featured" class="hidden py-20 bg-gray-50" aria-hidden="true">')
  .replace('<section class="py-8 bg-amber-50/60 border-y border-amber-100">', '<section class="hidden py-8 bg-amber-50/60 border-y border-amber-100" aria-hidden="true">')
  .replace('<section id="books" class="py-20 bg-white">', '<section id="books" class="hidden py-20 bg-white" aria-hidden="true">');

indexHtml = indexHtml
  .replace('<p class="text-3xl font-bold text-amber-600">100+</p>\n                    <p class="text-sm text-gray-600 font-medium">Books Published</p>', '<p class="text-3xl font-bold text-amber-600"><span id="totalCatalogCount">0</span></p>\n                    <p class="text-sm text-gray-600 font-medium">Titles Across Two Catalogs</p>')
  .replace('<h3 class="font-bold text-lg mb-1">100+ Published Titles</h3>\n                                <p class="text-gray-600">Across major categories and genres</p>', '<h3 class="font-bold text-lg mb-1">Two Editorial Catalogs</h3>\n                                <p class="text-gray-600">International books and books in Italian</p>')
  .replace('With over 100 titles on Amazon KDP, we collaborate with talented authors to bring engaging stories \n                        and valuable knowledge to readers worldwide.', 'Through two distinct editorial catalogs, we present books published in English and books published in Italian, each with its own themes and editorial direction.')
  .replace('Over 100 titles across fiction, self-help, health, and more.', 'Two distinct editorial catalogs within one independent publishing house.');

indexHtml = indexHtml
  .replace('<li><a href="#featured" class="hover:text-white transition">Featured Books</a></li>\n                        <li><a href="#books" class="hover:text-white transition">All Books</a></li>', '<li><a href="/international/" class="hover:text-white transition">International Catalog</a></li>\n                        <li><a href="/it/catalogo/" class="hover:text-white transition">Catalogo Italiano</a></li>')
  .replace('<li><a href="#books" class="hover:text-white transition">Fiction</a></li>', '<li><a href="/international/" class="hover:text-white transition">Books in English</a></li>');

indexHtml = indexHtml.replace(
  "            payhipLink: b.payhipLink || b.payhip || b.payhip_url || b.payhipURL || ''\n",
  "            payhipLink: b.payhipLink || b.payhip || b.payhip_url || b.payhipURL || '',\n            language: b.language || (b.category === 'In lingua italiana' ? 'it' : 'en')\n"
);

const gatewayScript = `
function populateCatalogGateway() {
    const internationalBooks = books.filter(book => book.language === 'en');
    const italianBooks = books.filter(book => book.language === 'it');

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText('internationalCatalogCount', internationalBooks.length);
    setText('italianCatalogCount', italianBooks.length);
    setText('totalCatalogCount', books.length);

    const renderPreview = (id, catalogBooks) => {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = catalogBooks.slice(0, 4).map(book => {
            const index = books.indexOf(book);
            return \`<button type="button" onclick="openBookModal(\${index})" class="rounded-xl overflow-hidden border border-white/80 bg-white shadow-sm hover:-translate-y-1 transition" aria-label="View \${escapeHtml(book.title)}">
                <img src="\${book.cover}" alt="\${escapeHtml(book.title)} cover" class="w-full h-32 sm:h-40 object-contain bg-white" loading="lazy" decoding="async" onerror="this.src='/covers/placeholder.svg'">
            </button>\`;
        }).join('');
    };

    renderPreview('internationalCatalogPreview', internationalBooks);
    renderPreview('italianCatalogPreview', italianBooks);
}
`;

if (!indexHtml.includes('function populateCatalogGateway()')) {
  indexHtml = replaceRequired(indexHtml, '\nasync function loadBooks() {', `${gatewayScript}\nasync function loadBooks() {`, 'loadBooks function');
}

if (!/displayBooks\(books\);\s*populateCatalogGateway\(\);/.test(indexHtml)) {
  indexHtml = indexHtml.replace(/displayBooks\(books\);\s*populateFeaturedCarousel\(\);/, 'displayBooks(books);\n        populateCatalogGateway();\n        populateFeaturedCarousel();');
}

write('index.html', indexHtml);

// 4. Extend validation to cover the new catalog structure.
let validator = read('scripts/validate-site.mjs');
if (!validator.includes('const internationalHtml = read("international/index.html");')) {
  validator = replaceRequired(
    validator,
    'read("thank-you.html");',
    'read("thank-you.html");\nconst internationalHtml = read("international/index.html");\nconst italianCatalogHtml = read("it/catalogo/index.html");',
    'validator page reads'
  );
}
if (!validator.includes('missing or invalid language')) {
  validator = replaceRequired(
    validator,
    '  if (book?.cover && !localPathExists(book.cover)) {',
    '  if (!["en", "it"].includes(String(book?.language ?? "").trim())) {\n    errors.push(`${label}: missing or invalid language; expected en or it.`);\n  }\n\n  if (book?.cover && !localPathExists(book.cover)) {',
    'catalog language validation point'
  );
}
if (!validator.includes('index.html does not link to the International Catalog')) {
  validator = replaceRequired(
    validator,
    'if (!indexHtml.includes(\'id="currentYear"\')) {',
    'if (!indexHtml.includes(\'href="/international/"\')) {\n  errors.push("index.html does not link to the International Catalog.");\n}\n\nif (!indexHtml.includes(\'href="/it/catalogo/"\')) {\n  errors.push("index.html does not link to the Catalogo Italiano.");\n}\n\nif (!internationalHtml.includes("International Catalog") || !italianCatalogHtml.includes("Catalogo Italiano")) {\n  errors.push("One or both catalog landing pages are missing their expected identity.");\n}\n\nif (!indexHtml.includes(\'id="currentYear"\')) {',
    'homepage catalog link validation point'
  );
}
write('scripts/validate-site.mjs', validator);

// 5. Add both catalog destinations to the sitemap.
let sitemap = read('sitemap.xml');
const sitemapEntries = `
  <url>
    <loc>https://www.robpacpublishing.com/international/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.robpacpublishing.com/it/catalogo/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
if (!sitemap.includes('/international/')) {
  sitemap = replaceRequired(sitemap, '\n</urlset>', `${sitemapEntries}\n</urlset>`, 'sitemap closing tag');
  write('sitemap.xml', sitemap);
} else {
  console.log('sitemap.xml already includes both catalog destinations.');
}

console.log(`\nCatalog split completed: ${books.filter(book => book.language === 'en').length} international books, ${books.filter(book => book.language === 'it').length} Italian books.`);
console.log('Run: node scripts/validate-site.mjs');
