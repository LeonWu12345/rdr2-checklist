# Map rendering regression — 2026-09-13

## Findings

- All 517 JPEG tiles decoded successfully at 1024 × 1024. Their SHA-256 hashes
  matched the copies in `outputs/rdr2-ui-redesign` before editing.
- Before editing, the browser reported a 944 × 559 viewport containing a
  **21617 × 16785** `#map-canvas` element and an equally oversized `.map-overview`.
  `#map-canvas` used a CSS scale/translation and `will-change: transform`.
- Disabling markers had not removed that oversized compositing layer. The
  geometry remained the same with zero markers. Changing tile paths or hiding
  markers therefore did not address this rendering risk.
- The supplied Opera GX screenshots show rectangular map and UI repaint gaps.
  The oversized transformed layer is a concrete code defect consistent with
  these symptoms, **not proof of a specific GPU/driver failure**. This environment
  could not inspect Opera's GPU state or open its `file://` page.

## Fix

`map-renderer.js` draws cropped source regions into a viewport-sized software 2D
canvas. No world-sized DOM/bitmap surface or CSS transform is used. Painting is
contained within the map stage. Every frame repaints the overview before detail
tiles; late image callbacks request a repaint of the current view, not an old
zoom level. Cache size, concurrent requests and canvas dimensions are bounded.
Empty marker data, storage keys, map imagery and checklist content are unchanged.

## Automated checks

Run `node tests/map-check.cjs` (includes `map-renderer-check.cjs`). It covers:

- All pyramid asset paths and application/script integration.
- 120 fit/detail/pan cycles at six viewport/DPR combinations, including tile-level
  boundaries and source image edges; source and destination crops stay in bounds.
- Delayed out-of-order loads after zooming out, image errors, missing overview,
  context restoration, and callbacks after teardown.
- Maximum 4 Mi-pixel / 4096-per-side backing canvas, 48 cached tiles and six
  concurrent detail requests.

Also run `node tests/functional-check.cjs` and
`node tests/validate-redesign.cjs` for checklist/Compendium regressions.

## Browser QA

Using the in-app browser at `http://127.0.0.1:4173/map.html`:

- 1280 × 720: 12 zoom-in clicks, drag, 12 zoom-out clicks. Overview and UI intact;
  measured canvas 944 × 559, CSS transform `none`, `will-change: auto`.
- 1920 × 1080: three rounds of 13 zoom-in / 13 zoom-out clicks. Map, heading,
  sidebar and controls intact; no browser warnings/errors reported.
- 375 × 812: English + light theme, 13 zoom-in / 13 zoom-out clicks. Map intact,
  no horizontal overflow; measured canvas 360 × 503.

These checks do not claim to reproduce or certify the user's Opera GX/driver
environment. After copying the fix to the local output, the remaining target-
environment check is to reopen `map.html` in Opera and repeat zoom, pan and
zoom-out several times while watching the map, header and sidebar.
