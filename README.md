# rajadhanda.me

Raja Dhanda’s personal website: projects, writing, and photographs.

## Running locally

This is a static HTML, CSS, and vanilla JavaScript site with no build step or runtime dependencies. Serve the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. GitHub Pages deploys the `main` branch.

## Design and structure

The homepage uses Space Grotesk and DM Sans with an electric blue accent, selected photography, and small hover interactions. Light and midnight themes share the same design tokens. Content and homepage navigation remain available without JavaScript, and motion respects the visitor’s reduced-motion preference.

- `index.html` — homepage
- `assets/css/editorial.css` — homepage design and shared content-page refinements
- `assets/css/site.css` — existing content-page layout and gallery controls
- `assets/js/site.js` — shared theme switch and content-page navigation
- `assets/js/home.js` — optional homepage details
- `assets/images/selected/` — resized homepage photos, derived from the original gallery images
- `projects/` — projects
- `blog/` — articles and synced Substack notes
- `photographs/` — gallery and original photographs
- `paddock/` — F1 page

The GitHub Actions workflows in `.github/workflows/` keep the Substack notes in sync. The gallery continues to use its existing Cloudinary image delivery and lightbox.

## Quick checks

```sh
node --check assets/js/site.js
node --check assets/js/home.js
git diff --check
```

Check the homepage and content pages on desktop and mobile, switch themes, and open a gallery photo before publishing design changes.

© 2026 Raja Dhanda. All rights reserved.
