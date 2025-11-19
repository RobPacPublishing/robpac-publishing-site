#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mappa ebook con libri correlati (EN e IT)
const ebookData = {
  0: {
    title: 'Read More in 30 Days',
    en: {
      description: 'a simple plan for busy people who love books',
      intro: "We're excited to have you join our reading community.",
      books: [
        { title: 'Focus and Mental Clarity', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DSKBTXVV' },
        { title: 'Overcoming Self-Sabotage', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DR5BH3YN' },
        { title: 'Master Your Anger', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DPKWMDH8' },
        { title: 'The Dark Side of Charisma', author: 'Ryan Walker', url: 'https://www.amazon.com/dp/B0DFC1QLKD' },
        { title: 'Perception and Attention Biases', author: 'John Keagan Dr.', url: 'https://www.amazon.com/dp/B0DNM6SP55' }
      ]
    },
    it: {
      description: 'un piano semplice per chi ama i libri',
      intro: "Siamo entusiasti di averti nella nostra comunità di lettori.",
      books: [
        { title: 'Autostima Infrangibile', author: 'Massimo Recaldi', url: 'https://www.amazon.it/dp/B0FB36DGV7' },
        { title: 'RUMINAZIONE MENTALE', author: 'Massimo Recaldi', url: 'https://www.amazon.it/dp/B0D8TSCF4B' },
        { title: 'La Via del Guerriero Illuminato', author: 'Adrian Stone', url: 'https://www.amazon.it/dp/B0DLWKX93J' },
        { title: 'Visualizzazione Positiva', author: 'Roberto Pacetti', url: 'https://www.amazon.it/dp/B0FCYG9RPG' },
        { title: 'SHIN-SHINOBI NO KOKORO', author: 'Saito K. Jackson', url: 'https://www.amazon.it/dp/B0FG7HKPHL' }
      ]
    }
  },
  1: {
    title: 'Find Your Next Favorite Book',
    en: {
      description: 'a mood-based guide to smart reading choices',
      intro: "We're thrilled to help you discover your next great read.",
      books: [
        { title: 'Whispers in the Abyss', author: 'Jackson Blackwood', url: 'https://www.amazon.com/dp/B0DK8W7DHW' },
        { title: 'RESTLESS SILENCE', author: 'Ryan Walker', url: 'https://www.amazon.com/dp/B0DH48RWM4' },
        { title: 'THE HEIR OF THE STARS', author: 'A.R. Blackthorne', url: 'https://www.amazon.com/dp/B0FBSWMY92' },
        { title: 'The Dark Side of Charisma', author: 'Ryan Walker', url: 'https://www.amazon.com/dp/B0DFC1QLKD' }
      ]
    },
    it: {
      description: 'una guida basata sull\'umore per scelte di lettura intelligenti',
      intro: "Siamo felici di aiutarti a scoprire il tuo prossimo grande libro.",
      books: [
        { title: 'Tra le Pagine del Cuore', author: 'Rob Pac', url: 'https://www.amazon.it/dp/B0FCC1QN4V' },
        { title: 'Il Silenzio delle Vette', author: 'Alessandra Montalcini', url: 'https://www.amazon.it/dp/B0DSP6RNJB' },
        { title: 'Oltre il Sentiero', author: 'Lorenzo De Sanctis', url: 'https://www.amazon.it/dp/B0DSPZGTLJ' },
        { title: 'Tra Fede e Nichilismo', author: 'Lorenzo De Sanctis', url: 'https://www.amazon.it/dp/B0F6MPZ752' }
      ]
    }
  },
  2: {
    title: 'Behind the Pages',
    en: {
      description: 'behind-the-scenes look at our publishing process and exclusive author interviews',
      intro: "Get exclusive insights from our publishing journey.",
      books: [
        { title: 'Intelligenza Artificiale e Debito Cognitivo', author: 'Massimo Recaldi', url: 'https://www.amazon.it/dp/B0FH25BVCS' },
        { title: 'Empower Your Team', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0FHW98R17' },
        { title: 'Focus and Mental Clarity', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DSKBTXVV' },
        { title: 'Perception and Attention Biases', author: 'John Keagan Dr.', url: 'https://www.amazon.com/dp/B0DNM6SP55' },
        { title: 'The Psychology of Saving', author: 'Ryan Walker', url: 'https://www.amazon.com/dp/B0DH8963ZG' }
      ]
    },
    it: {
      description: 'uno sguardo dietro le quinte del nostro processo editoriale e interviste esclusive con autori',
      intro: "Ottieni approfondimenti esclusivi dal nostro percorso editoriale.",
      books: [
        { title: 'ECHO HOUSE', author: 'Roberto Pacetti', url: 'https://www.amazon.it/dp/B0F7QZBVW5' },
        { title: 'Menti Divergenti', author: 'Rob Pac', url: 'https://www.etsy.com/it/listing/1899127981/autismo-una-panoramica-scientifica' },
        { title: 'PSICOLOGIA DELLA PERSONALITÀ', author: 'Roberto Pacetti', url: 'https://www.amazon.it/dp/B0DGQ9GJ14' },
        { title: 'ADOLESCENZA: Guida all\'addestramento', author: 'Roberto Pacetti', url: 'https://www.amazon.it/dp/B0F4WZKZ6N' },
        { title: 'Il Codice Bergoglio', author: 'Lorenzo De Sanctis', url: 'https://www.amazon.it/dp/B0F6VC8J7B' }
      ]
    }
  }
};

const translations = {
  en: {
    greeting: 'Hi',
    thankyou: 'Thank you for downloading',
    attached: 'Your Free eBook is Attached',
    download: 'Download and enjoy',
    suggestTitle: 'You Might Also Enjoy',
    suggestText: 'Based on your interest, we handpicked these titles from our catalog:',
    cta: 'Explore Our Full Catalog',
    ctaText: 'Discover 100+ books across fiction, self-help, psychology, wellness, and more.',
    browse: 'Browse All Books',
    closing: 'Happy reading! If you have any questions, feel free to reach out.',
    regards: 'Best regards,',
    team: 'The RobPac Publishing Team',
    footer: '© 2025 RobPac Publishing. All rights reserved.'
  },
  it: {
    greeting: 'Ciao',
    thankyou: 'Grazie per aver scaricato',
    attached: 'Il tuo eBook gratuito è allegato',
    download: 'Scarica e goditi',
    suggestTitle: 'Potresti Anche Apprezzare',
    suggestText: 'In base ai tuoi interessi, abbiamo selezionato questi titoli dal nostro catalogo:',
    cta: 'Esplora il Nostro Catalogo Completo',
    ctaText: 'Scopri più di 100 libri tra fiction, self-help, psicologia, benessere e molto altro.',
    browse: 'Sfoglia Tutti i Libri',
    closing: 'Buona lettura! Se hai domande, non esitare a contattarci.',
    regards: 'Cordiali saluti,',
    team: 'Il Team di RobPac Publishing',
    footer: '© 2025 RobPac Publishing. Tutti i diritti riservati.'
  }
};

function generateBooksHTML(books) {
  return books.map(book => `
            <div class="book-item">
                <div class="book-item-img">📕</div>
                <div class="book-item-text">
                    <h4>${book.title}</h4>
                    <p>by ${book.author}</p>
                    <a href="${book.url}" target="_blank" class="book-link">View on Amazon</a>
                </div>
            </div>`).join('');
}

function generateEmailTemplate(userName, userEmail, ebookIndex, lang = 'en') {
  const ebook = ebookData[ebookIndex];
  const ebookInfo = ebook[lang];
  const t = translations[lang];
  const booksHTML = generateBooksHTML(ebookInfo.books);

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 40px 20px; text-align: center; color: white; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .greeting strong { color: #d97706; }
        .ebook-section { background: #fef3c7; border-left: 4px solid #d97706; padding: 20px; border-radius: 6px; margin: 25px 0; }
        .ebook-title { font-size: 18px; font-weight: bold; color: #92400e; margin-bottom: 10px; }
        .ebook-icon { font-size: 40px; margin: 15px 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #d97706; margin: 30px 0 20px 0; }
        .book-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 12px; display: flex; gap: 15px; }
        .book-item-img { width: 60px; height: 90px; background: #e5e7eb; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .book-item-text h4 { font-size: 14px; font-weight: bold; margin-bottom: 5px; color: #1f2937; }
        .book-item-text p { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        .book-link { display: inline-block; padding: 8px 16px; background: #d97706; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .book-link:hover { background: #b45309; }
        .cta-section { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin: 25px 0; text-align: center; }
        .cta-button { display: inline-block; padding: 14px 32px; background: #d97706; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-top: 10px; }
        .cta-button:hover { background: #b45309; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 RobPac Publishing</div>
            <div class="tagline">Your Free eBook Download</div>
        </div>

        <div class="content">
            <div class="greeting">
                ${t.greeting} <strong>${userName}</strong> <span style="font-size: 14px; color: #6b7280;">(${userEmail})</span>,
            </div>

            <p>${t.thankyou} <strong>"${ebook.title}"</strong>! ${ebookInfo.intro}</p>

            <div class="ebook-section">
                <div class="ebook-icon">📖</div>
                <div class="ebook-title">${t.attached}</div>
                <p style="font-size: 14px; color: #92400e; margin-top: 10px;">${t.download} "${ebook.title}" — ${ebookInfo.description}.</p>
            </div>

            <div class="section-title">${t.suggestTitle}</div>
            <p style="margin-bottom: 15px; color: #6b7280;">${t.suggestText}</p>

            ${booksHTML}

            <div class="cta-section">
                <h3 style="color: #1e40af; margin-bottom: 10px;">${t.cta}</h3>
                <p style="color: #1e40af; margin-bottom: 15px;">${t.ctaText}</p>
                <a href="https://www.robpacpublishing.com" class="cta-button">${t.browse}</a>
            </div>

            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">${t.closing}</p>
            <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">${t.regards}<br><strong>${t.team}</strong></p>
        </div>

        <div class="footer">
            <p>${t.footer}</p>
            <p><a href="https://www.robpacpublishing.com">www.robpacpublishing.com</a></p>
        </div>
    </div>
</body>
</html>`;
}

// Uso da CLI
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Uso: node generate-email-template.js <nome_utente> <email_utente> <ebook_indice> [lingua]');
  console.log('\nEsempi:');
  console.log('  node generate-email-template.js "Roberto" "tdrob@libero.it" 0 "it"');
  console.log('  node generate-email-template.js "John" "john@gmail.com" 1 "en"');
  console.log('\nEbook indici: 0=Read More, 1=Find Favorite, 2=Behind Pages');
  console.log('Lingue: en (default), it');
  process.exit(1);
}

const userName = args[0];
const userEmail = args[1];
const ebookIndex = parseInt(args[2]);
const lang = args[3] || 'en';

if (!ebookData[ebookIndex]) {
  console.error('❌ Errore: ebook_indice deve essere 0, 1 o 2');
  process.exit(1);
}

if (lang !== 'en' && lang !== 'it') {
  console.error('❌ Errore: lingua deve essere "en" o "it"');
  process.exit(1);
}

// Crea struttura cartelle
const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const outputDir = `./email-sent/${dateFolder}/`;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const html = generateEmailTemplate(userName, userEmail, ebookIndex, lang);
const filename = `${outputDir}email-${userName.toLowerCase().replace(/\s+/g, '-')}_${userEmail.replace(/[@.]/g, '-')}_${Date.now()}.html`;

fs.writeFileSync(filename, html);
console.log(`✓ Template generato: ${filename}`);
console.log(`  Nome: ${userName}`);
console.log(`  Email: ${userEmail}`);
console.log(`  Lingua: ${lang}`);
