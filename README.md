# rajadhanda.me

Raja Dhanda’s personal website: projects, photographs, writing, and Substack notes.

## Run locally

No build step or dependencies are required. From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. GitHub Pages deploys the `main` branch.

## Homepage

The Sunday Edition design uses the existing cream palette and serif typography,
with Daylight and Midnight modes, prominent social links, and an animated EyesOff
feature at the centre. The camera-roll carousel supports buttons, arrow keys,
touch swipes, and an enlarged-photo dialog. It advances when the visitor asks.

`assets/css/edition.css` and `assets/js/edition.js` power the homepage. Existing
content pages continue to use `assets/css/site.css` and `assets/js/site.js`.
The homepage photo derivatives live in `assets/images/selected/`; original gallery
images remain in `photographs/images/`.

## Substack notes

The homepage reads `/blog/notes.json`, the same file used by the blog. The existing
`.github/workflows/sync-substack-notes.yml` workflow refreshes it every six hours.
The homepage displays the newest three valid notes, linking to their originals.
Pre-rendered notes remain visible if JavaScript is disabled or the fetch fails.

## Validation

```sh
node --check assets/js/edition.js
node --check assets/js/site.js
git diff --check
```

Check desktop and mobile layouts, Daylight/Midnight switching, carousel controls,
photo-dialog keyboard focus, and the Substack links before publishing.

© 2026 Raja Dhanda. All rights reserved.
