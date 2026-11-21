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
with Daylight and Midnight modes, interactive social bubbles beside the name,
and a pointer-following EyesOff feature at the centre. The introduction uses the
existing portrait and original bio. The framed camera-roll carousel cycles through all 29 gallery photographs every
six seconds. It pauses on hover, keyboard focus, hidden tabs, when out of view,
and while an enlarged photo is open. A discreet Play/Pause control appears inside the frame on hover or focus;
arrow keys, touch swipes, and the enlarged-photo dialog provide manual navigation.
Each frame follows the photograph’s original proportions. Reduced-motion users
start with autoplay paused.

`assets/css/edition.css` and `assets/js/edition.js` power the homepage. Existing
content pages continue to use `assets/css/site.css` and `assets/js/site.js`.
The carousel covers the complete gallery listed in `photographs/photos.json`.
Smaller local derivatives live in `assets/images/camera-roll/`; the remaining
images reuse the gallery’s existing Cloudinary delivery, with original images
as fallbacks. Original gallery images remain in `photographs/images/`.

## Substack notes

The homepage reads `/blog/notes.json`, the same file used by the blog. The existing
`.github/workflows/sync-substack-notes.yml` workflow refreshes it every six hours.
The homepage displays the newest six valid notes as Post-it notes on a
board, linking to their originals. Hovering a social bubble shows its username. Note bodies use the site’s readable serif typeface.
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
