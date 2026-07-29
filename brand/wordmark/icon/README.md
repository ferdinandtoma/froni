# FRONI app-icon / favicon set

The Gilda Display "F" monogram, outlined (font-free), bone #EDE6D6 on tenebrae
#131114, centred in a square. Built from the locked FRONI wordmark.

## Files
- `favicon.svg` — scalable, modern browsers (the master icon).
- `favicon.ico` — multi-resolution (16/32/48), legacy + Windows.
- `favicon-16.png`, `-32.png`, `-48.png`, `-64.png` — PNG favicons.
- `apple-touch-icon.png` — 180x180, iOS home screen.
- `icon-192.png`, `icon-512.png` — PWA / Android.
- `icon-maskable-512.png` — Android maskable (F pulled into the safe zone).
- `icon-1024.png` — store / large.
- `icon-gold-512.png`, `icon-reversed-512.png`, `icon-F-transparent.svg` — alternates.
- `site.webmanifest` — PWA manifest referencing the above.

## Drop-in `<head>`
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#131114">
```

## Notes
- The monogram is the same Gilda Display "F" as the wordmark, so the icon and
  logo are one system.
- At 16px the fine serifs soften but the F stays legible; use `favicon.svg`
  where possible so it stays crisp at every size.
- Gilda Display is SIL OFL; the license travels with the wordmark in
  `../logo/GildaDisplay-OFL.txt`.
