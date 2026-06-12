import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const writeJson = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
};

const booksSourcePath = 'cms-data/books-source.json';
const studioSourcePath = 'cms-data/studio-products-source.json';

const booksSource = readJson(booksSourcePath);
const studioSource = readJson(studioSourcePath);

if (!booksSource || !Array.isArray(booksSource.books)) {
  throw new Error(`${booksSourcePath} deve contenere un campo "books" di tipo array.`);
}

if (!studioSource || !Array.isArray(studioSource.items)) {
  throw new Error(`${studioSourcePath} deve contenere un campo "items" di tipo array.`);
}

writeJson('books.json', booksSource.books);
writeJson('studio-products.json', studioSource.items);

console.log(`books.json rigenerato: ${booksSource.books.length} libri`);
console.log(`studio-products.json rigenerato: ${studioSource.items.length} materiali Studio`);
