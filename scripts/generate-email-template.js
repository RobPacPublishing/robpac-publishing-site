#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mappa ebook con libri correlati
const ebookData = {
  0: {
    title: 'Read More in 30 Days',
    description: 'a simple plan for busy people who love books',
    books: [
      { title: 'Focus and Mental Clarity', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DSKBTXVV' },
      { title: 'Overcoming Self-Sabotage', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DR5BH3YN' },
      { title: 'Master Your Anger', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0DPKWMDH8' },
      { title: 'Autostima Infrangibile', author: 'Massimo Recaldi', url: 'https://www.amazon.it/dp/B0FB36DGV7' },
      { title: 'RUMINAZIONE MENTALE', author: 'Massimo Recaldi', url: 'https://www.amazon.it/dp/B0D8TSCF4B' }
    ]
  },
  1: {
    title: 'Find Your Next Favorite Book',
    description: 'a mood-based guide to smart reading choices',
    books: [
      { title: 'Whispers in the Abyss', author: 'Jackson Blackwood', url: 'https://www.amazon.com/dp/B0DK8W7DHW' },
      { title: 'RESTLESS SILENCE', author: 'Ryan Walker', url: 'https://www.amazon.com/dp/B0DH48RWM4' },
      { title: 'THE HEIR OF THE STARS', author: 'A.R. Blackthorne', url: 'https://www.amazon.com/dp/B0FBSWMY92' },
      { title: 'Tra le Pagine del Cuore', author: 'Rob Pac', url: 'https://www.amazon.it/dp/B0FCC1QN4V' }
    ]
  },
  2: {
    title: 'Behind the Pages',
    description: 'behind-the-scenes look at our publishing process and exclusive author interviews',
    books: [
      { title: 'Intelligenza Artificiale e Debito Cognitivo', author: 'Massimo Recaldi', url: 'https://www.amazon.it/dp/B0FH25BVCS' },
      { title: 'ECHO HOUSE', author: 'Roberto Pacetti', url: 'https://www.amazon.it/dp/B0F7QZBVW5' },
      { title: 'Menti Divergenti', author: 'Rob Pac', url: 'https://www.etsy.com/it/listing/1899127981/autismo-una-panoramica-scientifica' },
      { title: 'Empower Your Team', author: 'John Keagan', url: 'https://www.amazon.com/dp/B0FHW98R17' },
      { title: 'PSICOLOGIA DELLA PERSONALITÀ', author: 'Roberto Pacetti', url: 'https://www.amazon.it/dp/B0DGQ9GJ14' }
    ]
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

function generateEmailTemplate(userName, ebookIndex) {
  const ebook = ebookData[ebookIndex];
  const booksHTML = generateBooksHTML(ebook.books);

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
                Hi <strong>${userName}</strong>,
            </div>

            <p>Thank you for downloading <strong>"${ebook.title}"</strong>! ${ebookIndex === 0 ? "We're excited to have you join our reading community." : ebookIndex === 1 ? "We're thrilled to help you discover your next great read." : "Get exclusive insights from our publishing journey."}</p>

            <div class="ebook-section">
                <div class="ebook-icon">📖</div>
                <div class="ebook-title">Your Free eBook is Attached</div>
                <p style="font-size: 14px; color: #92400e; margin-top: 10px;">Download and enjoy "${ebook.title}" — ${ebook.description}.</p>
            </div>

            <div class="section-title">📚 You Might Also Enjoy</div>
            <p style="margin-bottom: 15px; color: #6b7280;">Based on your interest, we handpicked these titles from our catalog:</p>

            ${booksHTML}

            <div class="cta-section">
                <h3 style="color: #1e40af; margin-bottom: 10px;">Explore Our Full Catalog</h3>
                <p style="color: #1e40af; margin-bottom: 15px;">Discover 100+ books across fiction, self-help, psychology, wellness, and more.</p>
                <a href="https://www.robpacpublishing.com" class="cta-button">Browse All Books</a>
            </div>

            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Happy reading! If you have any questions, feel free to reach out.</p>
            <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">Best regards,<br><strong>The RobPac Publishing Team</strong></p>
        </div>

        <div class="footer">
            <p>© 2025 RobPac Publishing. All rights reserved.</p>
            <p><a href="https://www.robpacpublishing.com">www.robpacpublishing.com</a></p>
        </div>
    </div>
</body>
</html>`;
}

// Uso da CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Uso: node generate-email-template.js <nome_utente> <ebook_indice> [output_path]');
  console.log('\nEsempi:');
  console.log('  node generate-email-template.js "Roberto" 0');
  console.log('  node generate-email-template.js "Maria" 1 ./email-templates/');
  process.exit(1);
}

const userName = args[0];
const ebookIndex = parseInt(args[1]);
const outputDir = args[2] || './email-templates/';

if (!ebookData[ebookIndex]) {
  console.error('Errore: ebook_indice deve essere 0, 1 o 2');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const html = generateEmailTemplate(userName, ebookIndex);
const filename = `${outputDir}email-${userName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`;

fs.writeFileSync(filename, html);
console.log(`✓ Template generato: ${filename}`);
