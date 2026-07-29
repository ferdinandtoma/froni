# site — froni.co capture page

Scaffold, July 14, 2026. Preview by opening index.html in a browser. Nothing here is final; the real build is its own session, unhurried.

## What is placed

- The three confirmed lines: "Christ Pantocrator, embroidered on a heavyweight hoodie." / "200 made to order in Portugal." / "November 22."
- Wordmark, favicons, og image copied from C:\cipher\brand\wordmark.
- Palette as CSS variables. Gold used as ink only.

## Decisions pending before this ships

1. Full page copy placed from Froni_Copywriting_Document_v1 (capture page section).
2. Body typeface. Georgia is a stand-in. The wordmark is Gilda Display and stays an SVG image.
3. Form provider and the form action. Also the consent line for the list (GDPR: state what they are signing up for, one plain sentence).
4. Button copy check against the copy doc.
5. Analytics decision: none, or something privacy-quiet. Nothing is installed.

## Deploy

Cloudflare Pages, static upload of this folder, custom domain froni.co. No build step. When the page is live, bio links across all profiles point at the domain.
