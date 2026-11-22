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
six seconds. It pauses on hover, keyboard focus, when out of view,
and when the page is hidden. Previous and next buttons appear beside
the frame on hover or focus. The arrows are also visible on mobile.
Arrow keys and touch swipes provide manual navigation. Clicking a photo opens
the full Photographs page.
Each frame follows the photograph’s original proportions. Reduced-motion users
start with autoplay paused.

`assets/css/edition.css` and `assets/js/edition.js` power the homepage. Existing
content pages continue to use `assets/css/site.css` and `assets/js/site.js`.
The carousel covers the complete gallery listed in `photographs/photos.json`.
Smaller local derivatives live in `assets/images/camera-roll/`; the remaining
images reuse the gallery’s existing Cloudinary delivery, with original images
as fallbacks. Original gallery images remain in `photographs/images/`.

## Substack notes

The homepage and blog read `/blog/notes.json`. The six newest valid notes appear
on the homepage pinboard, linking to the originals. The homepage also includes
fallback notes for visitors without JavaScript or when the cache cannot be read.

GitHub Actions refreshes the cache every six hours using the public Open RSS
feed for the profile. It adds only verified original notes, preserves the
existing cache on a feed failure, and requests a Pages build when the live cache
differs. The workflow can also be run manually from GitHub Actions.

## Validation

```sh
node --check assets/js/edition.js
node --check assets/js/site.js
git diff --check
```

Check desktop and mobile layouts, Daylight/Midnight switching, carousel controls,
photo navigation and keyboard focus, and the Substack links before publishing.

© 2026 Raja Dhanda. All rights reserved.
