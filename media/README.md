# LM Visuals — Media drop-in folder

This is where **all of Luka's photos and videos** live. Drop files into the right
folder using the **exact filenames** below and they appear on the site automatically.
If a file is missing, the site shows a tasteful gradient placeholder, so it always
looks finished — even before you add real media.

> Tip: keep web images **under ~500 KB** each (export at ~2000px on the long edge,
> quality ~80). Prefer `.webp` or `.jpg`. The site lazy-loads everything below the fold.

## Folders & expected filenames

| Folder | What goes here | Filenames the site looks for |
|--------|----------------|------------------------------|
| `hero/` | 3–5 of your very best, wide, cinematic shots (the homepage background) | `hero-01.jpg`, `hero-02.jpg`, `hero-03.jpg` |
| `about/` | A portrait of Luka for the About section | `luka-portrait.jpg` |
| `sports/` | Sports work for the gallery | `sports-01.jpg` … `sports-08.jpg` |
| `real-estate/` | Real estate work for the gallery | `real-estate-01.jpg` … `real-estate-08.jpg` |
| `events/` | Events work for the gallery | `events-01.jpg` … `events-08.jpg` |
| `videos/` | Optional self-hosted reels (mp4) or a poster image | `reel-poster.jpg`, `showreel.mp4` |

You can use either `.jpg` or `.webp` — if you use `.webp`, just change the extension
in `scripts/data.js` (one line per image, clearly labelled).

## Want more than 8 images per category?

Open `scripts/data.js` and add another line to that category's list — it's plain,
commented, and copy-paste friendly.

## Video embeds (YouTube / Vimeo)

If your reels live on YouTube or Vimeo, you don't need to upload anything here — paste
the embed link into `scripts/data.js` under `videos`. (Use the `youtube-nocookie.com`
or `player.vimeo.com` embed URL.)
