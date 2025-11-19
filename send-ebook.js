import nodemailer from 'nodemailer';

const ebookData = {
  0: {
    title: 'Read More in 30 Days',
    filename: 'read-more-30-days.pdf',
    relatedBooks: [
      { title: 'Focus and Mental Clarity', author: 'John Keagan', category: 'self-help', url: 'https://www.amazon.com/dp/B0DSKBTXVV' },
      { title: 'Overcoming Self-Sabotage', author: 'John Keagan', category: 'self-help', url: 'https://www.amazon.com/dp/B0DR5BH3YN' },
      { title: 'Master Your Anger', author: 'John Keagan', category: 'self-help', url: 'https://www.amazon.com/dp/B0DPKWMDH8' },
      { title: 'Autostima Infrangibile', author: 'Massimo Recaldi', category: 'self-help', url: 'https://www.amazon.it/dp/B0FB36DGV7' },
      { title: 'RUMINAZIONE MENTALE', author: 'Massimo Recaldi', category: 'self-help', url: 'https://www.amazon.it/dp/B0D8TSCF4B' }
    ]
  },
  1: {
    title: 'Find Your Next Favorite Book',
    filename: 'find-favorite-book.pdf',
    relatedBooks: [
      { title: 'Whispers in the Abyss', author: 'Jackson Blackwood', category: 'fiction', url: 'https://www.amazon.com/dp/B0DK8W7DHW' },
      { title: 'RESTLESS SILENCE', author: 'Ryan Walker', category: 'fiction', url: 'https://www.amazon.com/dp/B0DH48RWM4' },
      { title: 'THE HEIR OF THE STARS', author: 'A.R. Blackthorne', category: 'fiction', url: 'https://www.amazon.com/dp/B0FBSWMY92' },
      { title: 'Tra le Pagine del Cuore', author: 'Rob Pac', category: 'fiction', url: 'https://www.amazon.it/dp/B0FCC1QN4V' }
    ]
  },
  2: {
    title: 'Behind the Pages',
    filename: 'behind-the-pages.pdf',
    relatedBooks: [
      { title: 'Intelligenza Artificiale e Debito Cognitivo', author: 'Massimo Recaldi', category: 'psychology', url: 'https://www.amazon.it/dp/B0FH25BVCS' },
      { title: 'ECHO HOUSE', author: 'Roberto Pacetti', category: 'psychology', url: 'https://www.amazon.it/dp/B0F7QZBVW5' },
      { title: 'Menti Divergenti', author: 'Rob Pac', category: 'psychology', url: 'https://www.etsy.com/it/listing/1899127981/autismo-una-panoramica-scientifica' },
      { title: 'Empower Your Team', author: 'John Keagan', category: 'psychology', url: 'https://www.amazon.com/dp/B0FHW98R17' },
      { title: 'PSICOLOGIA DELLA PERSONALITA\'', author: 'Roberto Pacetti', category: 'psychology', url: 'https://www.amazon.it/dp/B0DGQ9GJ14' }
    ]
  }
};

const generateEmailHTML = (name, ebookIndex) => {
  const ebook = ebookData[ebookIndex];
  const relatedBooksHTML = ebook.relatedBooks.map(book => `
    <div style="margin: 15px 0; padding: 15px; border-left: 4px solid #d97706; background: #fef3c7;">
      <h4 style="margin: 0 0 5px 0; color: #92400e; font-weight: bold;">${book.title}</h4>
      <p style="margin: 0 0 8px 0; color: #b45309; font-size: 14px;">by ${book.author}</p>
      <a href="${book.url}" target="_blank" style="color: #d97706; text-decoration: none; font-weight: bold;">View on Amazon →</a>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #d97706; margin-bottom: 10px; }
        .title { font-size: 28px; color: #1f2937; margin: 20px 0; }
        .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .section-title { font-size: 20px; color: #d97706; font-weight: bold; margin-bottom: 15px; }
        .cta { display: inline-block; padding: 12px 24px; background: #d97706; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📚 RobPac Publishing</div>
          <p style="color: #6b7280; margin: 0;">Your Free eBook Download</p>
        </div>

        <div class="section">
          <p>Hi ${name},</p>
          <p>Thank you for downloading <strong>"${ebook.title}"</strong>! Your free eBook is ready.</p>
          <p style="margin-top: 20px; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <strong>📥 Your eBook is attached to this email</strong><br>
            Download and enjoy!
          </p>
        </div>

        <div class="section">
          <div class="section-title">📖 You Might Also Enjoy</div>
          <p>Based on your interest in <strong>${ebook.title}</strong>, we handpicked these titles from our catalog:</p>
          ${relatedBooksHTML}
        </div>

        <div class="section">
          <h3 style="color: #1f2937; margin-top: 0;">More from RobPac Publishing</h3>
          <p>Explore 100+ books across fiction, self-help, psychology, and wellness.</p>
          <a href="https://www.robpacpublishing.com" class="cta">Browse Full Catalog</a>
        </div>

        <div class="footer">
          <p>© 2025 RobPac Publishing. All rights reserved.<br>
          <a href="https://www.robpacpublishing.com" style="color: #d97706;">www.robpacpublishing.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, ebook } = req.body;

  if (!email || !name || ebook === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!ebookData[ebook]) {
    return res.status(400).json({ error: 'Invalid ebook selection' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const ebookInfo = ebookData[ebook];
    const htmlContent = generateEmailHTML(name, ebook);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Your Free eBook: ${ebookInfo.title} 📚`,
      html: htmlContent,
      attachments: [
        {
          filename: ebookInfo.filename,
          path: `/public/ebooks/${ebookInfo.filename}`
        }
      ]
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
