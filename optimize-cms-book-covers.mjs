import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourcePath = 'cms-data/books-source.json';
const coversDir = 'covers-web-optimized';

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const maxWidth = 900;
const webpQuality = 82;

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

const uniquePath = (dir, baseName) => {
  let candidate = path.join(dir, `${baseName}.webp`);
  let count = 2;

  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${baseName}-${count}.webp`);
    count += 1;
  }

  return candidate;
};

if (!fs.existsSync(sourcePath)) {
  throw new Error(`${sourcePath} non trovato.`);
}

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

if (!Array.isArray(data.books)) {
  throw new Error(`${sourcePath} deve contenere un campo "books" di tipo array.`);
}

let changed = false;
let optimized = 0;

for (const book of data.books) {
  if (!book.cover) continue;

  const coverPath = String(book.cover).replace(/^\/+/, '');
  const parsed = path.parse(coverPath);

  if (parsed.dir !== coversDir) continue;

  const ext = parsed.ext.toLowerCase();

  if (!imageExtensions.has(ext)) continue;

  const inputPath = coverPath;

  if (!fs.existsSync(inputPath)) continue;

  const titleSlug = slugify(book.title);
  const currentSlug = slugify(parsed.name);
  const baseName = titleSlug || currentSlug || 'cover';

  if (ext === '.webp') {
    const metadata = await sharp(inputPath).metadata();

    if ((metadata.width || 0) <= maxWidth) {
      continue;
    }
  }

  const outputPath = ext === '.webp'
    ? inputPath
    : uniquePath(coversDir, baseName);

  const transformer = sharp(inputPath)
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: webpQuality });

  if (outputPath === inputPath) {
    const tempPath = `${inputPath}.tmp.webp`;
    await transformer.toFile(tempPath);
    fs.renameSync(tempPath, inputPath);
  } else {
    await transformer.toFile(outputPath);
    fs.rmSync(inputPath, { force: true });
  }

  const publicPath = `/${outputPath.replaceAll(path.sep, '/')}`;

  if (book.cover !== publicPath) {
    book.cover = publicPath;
    changed = true;
  }

  optimized += 1;
}

if (changed) {
  fs.writeFileSync(sourcePath, JSON.stringify(data, null, 2) + '\n');
}

console.log(`Cover ottimizzate: ${optimized}`);
console.log(changed ? 'books-source.json aggiornato.' : 'books-source.json invariato.');
