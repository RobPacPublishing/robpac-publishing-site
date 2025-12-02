#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configurazione
const BOOKS_JSON_FILE = 'books.json'; // File JSON esportato dall'admin panel
const INDEX_FILE = 'index.html';
const BACKUP_FILE = 'index.html.backup';

console.log('🔧 RobPac Publishing - Book Merger\n');

// 1. Verifica che il file JSON esista
if (!fs.existsSync(BOOKS_JSON_FILE)) {
    console.error(`❌ Errore: File "${BOOKS_JSON_FILE}" non trovato`);
    console.log(`\nProc:
1. Esporta i libri dall'admin panel (clicca "Esporta JSON")
2. Salva il file come "books.json" nella stessa cartella di questo script
3. Esegui di nuovo questo script`);
    process.exit(1);
}

// 2. Verifica che index.html esista
if (!fs.existsSync(INDEX_FILE)) {
    console.error(`❌ Errore: File "${INDEX_FILE}" non trovato`);
    process.exit(1);
}

try {
    // 3. Leggi il file JSON dei nuovi libri
    console.log(`📖 Leggo il file: ${BOOKS_JSON_FILE}`);
    const jsonData = fs.readFileSync(BOOKS_JSON_FILE, 'utf-8');
    const nuoviLibri = JSON.parse(jsonData);

    if (!Array.isArray(nuoviLibri)) {
        throw new Error('Il file JSON deve contenere un array di libri');
    }

    console.log(`✅ Trovati ${nuoviLibri.length} nuovi libri\n`);

    // 4. Leggi index.html
    console.log(`📄 Leggo il file: ${INDEX_FILE}`);
    let indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');

    // 5. Fai un backup
    console.log(`💾 Creo backup: ${BACKUP_FILE}`);
    fs.writeFileSync(BACKUP_FILE, indexContent);

    // 6. Trova l'array books in index.html
    const bookArrayMatch = indexContent.match(/const books = \[([\s\S]*?)\];/);
    
    if (!bookArrayMatch) {
        throw new Error('Non riesco a trovare "const books = [...]" in index.html');
    }

    // 7. Estrai i libri esistenti
    const listriGrezza = bookArrayMatch[1];
    const libruExistenti = JSON.parse('[' + listriGrezza + ']');
    
    console.log(`✅ Trovati ${libruExistenti.length} libri esistenti in index.html\n`);

    // 8. Merge: aggiungi i nuovi libri (senza duplicati per title+author)
    const libriMerged = [...libruExistenti];
    let aggiunti = 0;

    for (const nuovoLibro of nuoviLibri) {
        const esiste = libruExistenti.some(
            l => l.title === nuovoLibro.title && l.author === nuovoLibro.author
        );

        if (!esiste) {
            libriMerged.push(nuovoLibro);
            aggiunti++;
        }
    }

    console.log(`➕ Aggiunti ${aggiunti} nuovi libri`);
    console.log(`📊 Totale libri: ${libriMerged.length}\n`);

    // 9. Converti il nuovo array in JavaScript
    const booksArrayString = JSON.stringify(libriMerged, null, 0);
    const newBooksDeclaration = `const books = ${booksArrayString};`;

    // 10. Sostituisci l'array in index.html
    const newIndexContent = indexContent.replace(
        /const books = \[[\s\S]*?\];/,
        newBooksDeclaration
    );

    // 11. Salva il nuovo index.html
    fs.writeFileSync(INDEX_FILE, newIndexContent);
    console.log(`✅ ${INDEX_FILE} aggiornato con successo!\n`);

    // 12. Pulizia
    fs.unlinkSync(BOOKS_JSON_FILE);
    console.log(`🗑️  File temporaneo "${BOOKS_JSON_FILE}" eliminato\n`);

    console.log('✨ Merge completato!\n');
    console.log('Prossimi passi:');
    console.log(`1. Verifica le modifiche in ${INDEX_FILE}`);
    console.log('2. Testa il sito nel browser');
    console.log('3. Se tutto ok: git add index.html && git commit && git push');
    console.log(`4. Se qualcosa non va: ripristina il backup da ${BACKUP_FILE}`);

} catch (error) {
    console.error(`\n❌ Errore: ${error.message}\n`);
    console.log(`Backup salvato in: ${BACKUP_FILE}`);
    process.exit(1);
}
