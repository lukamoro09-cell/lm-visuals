# LM Visuals

A gallery-grade, fully static photography & videography website for **Luka Moro / LM Visuals** — sports, real estate, and event coverage in the GTA. Built as plain HTML/CSS/JS (no build step), with smooth scrolling, scroll animations, a filterable gallery + lightbox, tabbed pricing for three services, a live booking estimator, and email-delivered booking/contact forms. Installable as an app on iPhone (PWA) and works as a normal site on desktop.

---

## 1. Add Luka's media

Everything visual lives in **`/media`**. Drop files in using the exact filenames listed in
[`media/README.md`](media/README.md) and they appear automatically. Missing files show a tasteful
gradient placeholder, so the site always looks finished. Quick version:

- `media/hero/hero-01.jpg … hero-03.jpg` — homepage background (your best wide shots)
- `media/about/luka-portrait.jpg` — the About portrait
- `media/sports/sports-01.jpg … -08.jpg`
- `media/real-estate/real-estate-01.jpg … -08.jpg`
- `media/events/events-01.jpg … -08.jpg`
- `media/videos/reel-poster.jpg` (+ optional `showreel.mp4`, or a YouTube/Vimeo embed — see `scripts/data.js`)

Keep images **under ~500 KB** (export ~2000px long edge, quality ~80, `.jpg` or `.webp`).

## 2. Where the booking & contact emails go

Both forms email **lukamoro.visuals@gmail.com** through [FormSubmit](https://formsubmit.co) —
free, no account, no backend.

**One-time activation:** the very first time someone submits a form on the live site, FormSubmit
sends a confirmation email to that inbox. Click the **Activate** link once, and every submission
after that arrives automatically (formatted as a tidy table). To test it yourself, submit the form
once after deploying and confirm the email.

To change the destination email, edit `email` at the top of `scripts/data.js`.

### Optional — also log every lead to a Google Sheet

Want a running spreadsheet of all bookings/messages (in addition to the emails)? The site already
supports it — you just provide an endpoint:

1. Create a Google Sheet → **Extensions → Apps Script**.
2. Paste this and **Save**:

   ```js
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     var keys = Object.keys(data).filter(function (k) { return k.charAt(0) !== '_'; });
     if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp'].concat(keys));
     sheet.appendRow([new Date()].concat(keys.map(function (k) { return data[k]; })));
     MailApp.sendEmail('lukamoro.visuals@gmail.com',
       data._subject || 'New LM Visuals lead',
       keys.map(function (k) { return k + ': ' + data[k]; }).join('\n'));
     return ContentService.createTextOutput(JSON.stringify({ result: 'ok' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Deploy → New deployment → Web app** → *Execute as: Me*, *Who has access: Anyone* → **Deploy**,
   then copy the `/exec` URL.
4. Paste that URL into `sheetEndpoint` in `scripts/data.js`, then redeploy.

Now every submission lands in the sheet **and** emails Luka. (FormSubmit email delivery stays on as
the source of truth, so you're covered even if the script is ever down.)

## 3. Change prices, packages, or copy

- **Prices / tiers / add-ons / gallery** → `scripts/data.js` (one clearly-commented place).
- **Headlines, About text, terms** → `index.html`.
- **Colours, fonts, spacing, motion** → `styles/tokens.css`.

## 4. Run locally

It's static — any static server works:

```bash
# Python
python -m http.server 5173
# or Node
npx serve .
```

Then open http://localhost:5173.

## 5. Deploy to Vercel (free)

**Option A — drag & drop:** go to [vercel.com/new](https://vercel.com/new), drag this `lm-visuals`
folder in, and deploy. No settings needed (it's static; `vercel.json` is included).

**Option B — CLI:**

```bash
npm i -g vercel
cd lm-visuals
vercel        # follow prompts; accept defaults
vercel --prod # publish to your production URL
```

After deploying, update the URLs in `robots.txt`, `index.html` (`canonical` / `og:url`), and the
`Sitemap` line to your final domain.

---

### Tech notes
- Smooth scroll: **Lenis** · Animations: **GSAP + ScrollTrigger** (CDN, deferred, with graceful fallback)
- Type: **Fraunces** (display) + **Inter** (body) · Direction: warm cinematic "Amber Gallery"
- Security headers + CSP set in `vercel.json` · Honeypot spam trap on both forms
- Accessible: keyboard-navigable tabs & lightbox, focus styles, `prefers-reduced-motion` honored
