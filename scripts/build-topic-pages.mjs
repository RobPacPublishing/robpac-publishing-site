import fs from "fs";
import path from "path";

const SITE_URL = "https://www.robpacpublishing.com";

const TOPICS = [
  {
    slug: "stress-anxiety-emotional-balance",
    outputDir: "topics/stress-anxiety-emotional-balance",
    subcategory: "Stress, Anxiety & Emotional Balance",
    lang: "en",
    title: "Books on Stress, Anxiety & Emotional Balance | RobPac Publishing",
    description: "Explore RobPac Publishing books on stress, anxiety, panic attacks, burnout, mindfulness, and emotional balance.",
    h1: "Books on Stress, Anxiety & Emotional Balance",
    intro: "Explore a focused selection of RobPac Publishing titles dedicated to stress, anxiety, panic attacks, burnout, mindfulness, and emotional balance. This collection brings together accessible books designed for readers who want practical tools, clearer self-understanding, and a more grounded approach to personal wellbeing."
  },
  {
    slug: "cookbooks-nutrition",
    outputDir: "topics/cookbooks-nutrition",
    subcategory: "Cookbooks & Nutrition",
    lang: "en",
    title: "Cookbooks & Nutrition Books | RobPac Publishing",
    description: "Discover RobPac Publishing cookbooks and nutrition guides, from Mediterranean recipes to practical diet-focused titles.",
    h1: "Cookbooks & Nutrition Books",
    intro: "Discover RobPac Publishing cookbooks and nutrition guides created for readers who want practical, accessible, and enjoyable food inspiration."
  },
  {
    slug: "artificial-intelligence-society",
    outputDir: "topics/artificial-intelligence-society",
    subcategory: "Artificial Intelligence & Society",
    lang: "en",
    title: "Books on Artificial Intelligence & Society | RobPac Publishing",
    description: "Explore RobPac Publishing books on artificial intelligence, society, digital change, and the human impact of emerging technologies.",
    h1: "Books on Artificial Intelligence & Society",
    intro: "Explore books that examine artificial intelligence, digital transformation, and their impact on society, education, work, creativity, and human life."
  },
  {
    slug: "dark-psychology-manipulation",
    outputDir: "topics/dark-psychology-manipulation",
    subcategory: "Dark Psychology & Manipulation",
    lang: "en",
    title: "Dark Psychology & Manipulation Books | RobPac Publishing",
    description: "Explore RobPac Publishing books on dark psychology, manipulation, narcissism, charisma, and emotional influence.",
    h1: "Dark Psychology & Manipulation Books",
    intro: "Explore books focused on dark psychology, manipulation, narcissism, charisma, emotional influence, and psychological self-protection."
  },
  {
    slug: "psicologia-scienze-umane",
    outputDir: "it/argomenti/psicologia-scienze-umane",
    subcategory: "Psicologia e scienze umane",
    lang: "it",
    title: "Libri di psicologia e scienze umane | RobPac Publishing",
    description: "Scopri i libri RobPac Publishing dedicati a psicologia, scienze umane, società, personalità, sviluppo e comportamento umano.",
    h1: "Libri di psicologia e scienze umane",
    intro: "Scopri una selezione di libri RobPac Publishing dedicati alla psicologia e alle scienze umane, pensati per lettori curiosi, studenti e persone interessate a comprendere meglio il comportamento umano."
  },
  {
    slug: "benessere-emotivo-ansia",
    outputDir: "it/argomenti/benessere-emotivo-ansia",
    subcategory: "Benessere emotivo e gestione dell’ansia",
    lang: "it",
    title: "Libri su benessere emotivo e gestione dell’ansia | RobPac Publishing",
    description: "Scopri libri RobPac Publishing su ansia, benessere emotivo, equilibrio interiore e crescita personale.",
    h1: "Libri su benessere emotivo e gestione dell’ansia",
    intro: "Una selezione di libri dedicati al benessere emotivo, alla gestione dell’ansia e alla crescita personale, con un linguaggio accessibile e orientato alla consapevolezza."
  },
  {
    slug: "fede-spiritualita-societa",
    outputDir: "it/argomenti/fede-spiritualita-societa",
    subcategory: "Fede, spiritualità e società",
    lang: "it",
    title: "Libri su fede, spiritualità e società | RobPac Publishing",
    description: "Scopri libri RobPac Publishing dedicati a fede, spiritualità, società, riflessione religiosa e vita comunitaria.",
    h1: "Libri su fede, spiritualità e società",
    intro: "Una raccolta di libri dedicati al rapporto tra fede, spiritualità, società e vita quotidiana, con attenzione alla riflessione personale e comunitaria."
  }
];

const args = process.argv.slice(2);
const selectedTopics = args.includes("--all")
  ? TOPICS
  : TOPICS.filter(topic => args.length ? args.includes(topic.slug) : topic.slug === "stress-anxiety-emotional-balance");

const booksPath = path.join(process.cwd(), "books.json");
const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(value = "", max = 210) {
  const text = String(value).trim();
  return text.length > max ? text.slice(0, max).trim().replace(/[,.!?;:]*$/, "") + "…" : text;
}

function bookUrl(book) {
  return book.amazon || book.payhip || "#";
}

function buildJsonLd(topic, topicBooks, canonicalUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": topic.h1,
    "description": topic.description,
    "url": canonicalUrl,
    "inLanguage": topic.lang,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": topicBooks.map((book, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Book",
          "name": book.title,
          "author": {
            "@type": "Person",
            "name": book.author || "RobPac Publishing"
          },
          "image": book.cover ? `${SITE_URL}${book.cover}` : undefined,
          "description": truncate(book.description || "", 300),
          "url": bookUrl(book),
          "inLanguage": topic.lang
        }
      }))
    }
  };
}

function renderBookCard(book) {
  const url = bookUrl(book);
  const buttonLabel = url.includes("amazon.") ? "View on Amazon" : "View book";

  return `
        <article class="book-card bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div class="bg-gray-100">
            <img src="${escapeHtml(book.cover || "/covers/placeholder.svg")}" alt="${escapeHtml(book.title)} cover" class="w-full h-80 object-contain" loading="lazy" decoding="async" onerror="this.src='/covers/placeholder.svg'">
          </div>
          <div class="p-6">
            <p class="text-sm text-amber-700 font-semibold mb-2">${escapeHtml(book.subcategory || "")}</p>
            <h2 class="text-xl font-bold text-gray-900 mb-2 leading-snug">${escapeHtml(book.title)}</h2>
            <p class="text-gray-500 text-sm mb-4">by ${escapeHtml(book.author || "RobPac Publishing")}</p>
            <p class="text-gray-700 text-sm leading-relaxed mb-6">${escapeHtml(truncate(book.description || "", 230))}</p>
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="inline-flex items-center justify-center bg-amber-600 text-white px-5 py-3 rounded-full font-bold hover:bg-amber-700 transition">${buttonLabel}</a>
          </div>
        </article>`;
}

function renderPage(topic, topicBooks) {
  const canonicalUrl = `${SITE_URL}/${topic.outputDir}/`;
  const jsonLd = buildJsonLd(topic, topicBooks, canonicalUrl);

  return `<!DOCTYPE html>
<html lang="${topic.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(topic.title)}</title>
  <meta name="description" content="${escapeHtml(topic.description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(topic.title)}">
  <meta property="og:description" content="${escapeHtml(topic.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${SITE_URL}/assets/hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico">
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; }
    .book-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .book-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
  </style>
</head>
<body class="bg-white text-gray-900">
  <nav class="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <a href="/" class="text-2xl font-bold text-gray-900">RobPac Publishing</a>
      <div class="flex gap-6 text-sm font-semibold">
        <a href="/" class="text-gray-700 hover:text-amber-600">Home</a>
        <a href="/#books" class="text-gray-700 hover:text-amber-600">All Books</a>
      </div>
    </div>
  </nav>

  <header class="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-b border-amber-100">
    <div class="max-w-7xl mx-auto px-6 py-16">
      <p class="text-amber-700 font-bold mb-4">${topic.lang === "it" ? "Argomento" : "Topic"}</p>
      <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">${escapeHtml(topic.h1)}</h1>
      <p class="text-xl text-gray-700 max-w-4xl leading-relaxed">${escapeHtml(topic.intro)}</p>
      <p class="mt-6 text-gray-500">${topicBooks.length} ${topic.lang === "it" ? "libri disponibili" : "books available"}</p>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-16">
    <nav class="text-sm text-gray-500 mb-10">
      <a href="/" class="hover:text-amber-600">RobPac Publishing</a>
      <span class="mx-2">/</span>
      <span>${escapeHtml(topic.h1)}</span>
    </nav>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
${topicBooks.map(renderBookCard).join("\n")}
    </section>

    <section class="mt-20 bg-gray-50 rounded-3xl p-8 border border-gray-100">
      <h2 class="text-2xl font-bold mb-4">${topic.lang === "it" ? "Continua a esplorare il catalogo" : "Continue exploring the catalog"}</h2>
      <p class="text-gray-700 leading-relaxed mb-6">${topic.lang === "it" ? "Torna al catalogo completo RobPac Publishing per scoprire altri libri, generi e percorsi di lettura." : "Return to the full RobPac Publishing catalog to discover more books, genres, and reading paths."}</p>
      <a href="/#books" class="inline-flex bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition">${topic.lang === "it" ? "Vai al catalogo" : "Browse all books"}</a>
    </section>
  </main>

  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
      <div>
        <p class="text-2xl font-bold mb-2">RobPac Publishing</p>
        <p class="text-gray-400">Independent publishing across fiction, wellbeing, culture, and practical knowledge.</p>
      </div>
      <div class="flex gap-6 text-gray-300">
        <a href="/" class="hover:text-white">Home</a>
        <a href="/#books" class="hover:text-white">All Books</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

for (const topic of selectedTopics) {
  const topicBooks = books
    .filter(book => String(book.subcategory || "").trim() === topic.subcategory)
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));

  if (!topicBooks.length) {
    console.warn(`No books found for: ${topic.subcategory}`);
    continue;
  }

  const outDir = path.join(process.cwd(), topic.outputDir);
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "index.html");
  fs.writeFileSync(outPath, renderPage(topic, topicBooks), "utf8");

  console.log(`Generated ${topic.outputDir}/index.html — ${topicBooks.length} books`);
}
