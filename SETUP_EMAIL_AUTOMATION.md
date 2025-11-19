# Email Automazione - Setup Vercel

## 1️⃣ Prepara file ebook
Crea cartella nel repo:
```
public/ebooks/
├── read-more-30-days.pdf
├── find-favorite-book.pdf
└── behind-the-pages.pdf
```

## 2️⃣ Crea file `/api/send-ebook.js` 
Copia il contenuto da `send-ebook.js` nella cartella `/api` del tuo repo Vercel.

## 3️⃣ Installa dipendenza
```bash
npm install nodemailer
```

## 4️⃣ Configura Gmail App Password
- Vai a myaccount.google.com/apppasswords
- Seleziona "Mail" e "Windows Computer"
- Copia la password generata (16 caratteri)

## 5️⃣ Aggiungi Environment Variables in Vercel
Dashboard Vercel → Settings → Environment Variables:
```
GMAIL_USER = robpacpublishing@gmail.com
GMAIL_PASS = [16-char-app-password]
```

## 6️⃣ Deploy
```bash
git add .
git commit -m "feat: add email automation with Vercel serverless function"
git push
```

## 7️⃣ Test
- Vai a https://tuodominio.com
- Clicca Get This eBook → Compila form
- Controlla inbox email

---

**Note:**
- Email template HTML è generato automaticamente con 3-5 libri correlati
- File ebook allegato automaticamente
- Logo e branding RobPac incluso
